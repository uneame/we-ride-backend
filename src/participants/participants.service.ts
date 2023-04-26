import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { Participant } from './entities/participant.entity';
import { Keyword } from './entities/keyword.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from '../events/entities/event.entity';


@Injectable()
export class ParticipantsService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,
    @InjectRepository(Keyword)
    private readonly keywordRepository: Repository<Keyword>,

    private readonly connection: Connection,
  ) {}

  findAll(paginationQueryDto: PaginationQueryDto) {
    const { limit, offset } = paginationQueryDto;
    return this.participantRepository.find({
      relations: {
        keywords: true,
      },
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: string) {
    const participant = await this.participantRepository.findOne({ 
      where: { id: +id },
      relations: {
        keywords: true,
      },
    });
    if (!participant) {
      throw new NotFoundException(`Participant #${id} not found`);
    }
    return participant;
  }

  async create(createParticipantDto: CreateParticipantDto) {
    const keywords = await Promise.all(
      createParticipantDto.keywords.map(name => this.preloadKeywordByName(name)),
    );

    const participant = this.participantRepository.create({
      ...createParticipantDto,
      keywords,
    });
    return this.participantRepository.save(participant);
  }

  async update(id: string, updateParticipantDto: UpdateParticipantDto) {
    const keywords =
      updateParticipantDto.keywords &&
      (await Promise.all(
        updateParticipantDto.keywords.map(name => this.preloadKeywordByName(name)),
      ));

    const participant = await this.participantRepository.preload({
      id: +id,
      ...updateParticipantDto,
      keywords,
    });
    if (!participant) {
      throw new NotFoundException(`Participant #${id} not found`);
    }
    return this.participantRepository.save(participant);
  }

  async remove(id: string) {
    const participant = await this.findOne(id);
    return this.participantRepository.remove(participant);
  }

  private async preloadKeywordByName(name: string): Promise<Keyword> {
    const existingKeyword = await this.keywordRepository.findOne({ where: { name } }); // 👈 notice the "where"
    if (existingKeyword) {
      return existingKeyword;
    }
    return this.keywordRepository.create({ name });
  }

  async recommendParticipant(participant: Participant) {
    const queryRunner = this.connection.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction(); 
    try {
      participant.recommendations++;
      
      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_participant';
      recommendEvent.type = 'participant';
      recommendEvent.payload = { participantId: participant.id };
    
      await queryRunner.manager.save(participant); 
      await queryRunner.manager.save(recommendEvent);
      
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
