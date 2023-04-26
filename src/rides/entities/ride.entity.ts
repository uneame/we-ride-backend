import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Keyword } from './keyword.entity';
import { Participant } from 'src/participants/entities/participant.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Ride {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column()
  machin: string;

  @JoinTable()
  @ManyToMany((type) => Keyword, (keyword) => keyword.rides, {
    cascade: true,
  })
  keywords: Keyword[];

  @Column({ default: 9 })
  recommendations: number;

  @OneToMany((type) => Participant, (participant) => participant.ride)
  participants: Participant[];

  @ManyToOne((type) => User, (user) => user.rides)
  user: User;
}
