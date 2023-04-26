import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
import { Ride } from './entities/ride.entity';
import { Keyword } from './entities/keyword.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from '../events/entities/event.entity';


@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private readonly rideRepository: Repository<Ride>,
    @InjectRepository(Keyword)
    private readonly keywordRepository: Repository<Keyword>,

    private readonly connection: Connection,
  ) {}

  findAll(paginationQueryDto: PaginationQueryDto) {
    const { limit, offset } = paginationQueryDto;
    return this.rideRepository.find({
      relations: {
        keywords: true,
        participants: true,
      },
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: string) {
    const ride = await this.rideRepository.findOne({ 
      where: { id: +id },
      relations: {
        keywords: true,
        participants: true,
      },
    });
    if (!ride) {
      throw new NotFoundException(`Ride #${id} not found`);
    }
    return ride;
  }

  async create(createRideDto: CreateRideDto) {
    const keywords = await Promise.all(
      createRideDto.keywords.map(name => this.preloadKeywordByName(name)),
    );

    const ride = this.rideRepository.create({
      ...createRideDto,
      keywords,
    });
    return this.rideRepository.save(ride);
  }

  async update(id: string, updateRideDto: UpdateRideDto) {
    const keywords =
      updateRideDto.keywords &&
      (await Promise.all(
        updateRideDto.keywords.map(name => this.preloadKeywordByName(name)),
      ));

    const ride = await this.rideRepository.preload({
      id: +id,
      ...updateRideDto,
      keywords,
    });
    if (!ride) {
      throw new NotFoundException(`Ride #${id} not found`);
    }
    return this.rideRepository.save(ride);
  }

  async remove(id: string) {
    const ride = await this.findOne(id);
    return this.rideRepository.remove(ride);
  }

  private async preloadKeywordByName(name: string): Promise<Keyword> {
    const existingKeyword = await this.keywordRepository.findOne({ where: { name } }); // 👈 notice the "where"
    if (existingKeyword) {
      return existingKeyword;
    }
    return this.keywordRepository.create({ name });
  }

  async recommendRide(ride: Ride) {
    const queryRunner = this.connection.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction(); 
    try {
      ride.recommendations++;
      
      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_ride';
      recommendEvent.type = 'ride';
      recommendEvent.payload = { rideId: ride.id };
    
      await queryRunner.manager.save(ride); 
      await queryRunner.manager.save(recommendEvent);
      
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
