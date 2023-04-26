import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Keyword } from './keyword.entity';
import { Ride } from 'src/rides/entities/ride.entity';

@Entity()
export class Participant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @JoinTable()
  @ManyToMany((type) => Keyword, (keyword) => keyword.participants, {
    cascade: true,
  })
  keywords: Keyword[];

  @Column({ default: 9 })
  recommendations: number;

  @ManyToOne((type) => Ride, (ride) => ride.participants)
  ride: Ride;
}
