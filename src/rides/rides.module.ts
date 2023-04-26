import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { Ride } from './entities/ride.entity';
import { Keyword } from './entities/keyword.entity';
import { Event } from 'src/events/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ride, Keyword,  Event])],
  controllers: [RidesController],
  providers: [RidesService],
})
export class RidesModule {}