import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { Keyword } from './entities/keyword.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from '../events/entities/event.entity';


@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Keyword)
    private readonly keywordRepository: Repository<Keyword>,

    private readonly connection: Connection,
  ) {}

  findAll(paginationQueryDto: PaginationQueryDto) {
    const { limit, offset } = paginationQueryDto;
    return this.profileRepository.find({
      relations: {
        keywords: true,
      },
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: string) {
    const profile = await this.profileRepository.findOne({ 
      where: { id: +id },
      relations: {
        keywords: true,
      },
    });
    if (!profile) {
      throw new NotFoundException(`Profile #${id} not found`);
    }
    return profile;
  }

  async create(createProfileDto: CreateProfileDto) {
    const keywords = await Promise.all(
      createProfileDto.keywords.map(name => this.preloadKeywordByName(name)),
    );

    const profile = this.profileRepository.create({
      ...createProfileDto,
      keywords,
    });
    return this.profileRepository.save(profile);
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    const keywords =
      updateProfileDto.keywords &&
      (await Promise.all(
        updateProfileDto.keywords.map(name => this.preloadKeywordByName(name)),
      ));

    const profile = await this.profileRepository.preload({
      id: +id,
      ...updateProfileDto,
      keywords,
    });
    if (!profile) {
      throw new NotFoundException(`Profile #${id} not found`);
    }
    return this.profileRepository.save(profile);
  }

  async remove(id: string) {
    const profile = await this.findOne(id);
    return this.profileRepository.remove(profile);
  }

  private async preloadKeywordByName(name: string): Promise<Keyword> {
    const existingKeyword = await this.keywordRepository.findOne({ where: { name } }); // 👈 notice the "where"
    if (existingKeyword) {
      return existingKeyword;
    }
    return this.keywordRepository.create({ name });
  }

  async recommendProfile(profile: Profile) {
    const queryRunner = this.connection.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction(); 
    try {
      profile.recommendations++;
      
      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_profile';
      recommendEvent.type = 'profile';
      recommendEvent.payload = { profileId: profile.id };
    
      await queryRunner.manager.save(profile); 
      await queryRunner.manager.save(recommendEvent);
      
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
