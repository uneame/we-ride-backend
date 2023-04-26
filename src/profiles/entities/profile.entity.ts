import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Keyword } from './keyword.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @JoinTable()
  @ManyToMany((type) => Keyword, (keyword) => keyword.profiles, {
    cascade: true,
  })
  keywords: Keyword[];

  @Column({ default: 9 })
  recommendations: number;

  @OneToOne((type) => User, (user) => user.profile)
  user: User;
}
