import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { Profile } from './entities/profile.entity';
import { Keyword } from './entities/keyword.entity';
import { Event } from 'src/events/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, Keyword,  Event])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}