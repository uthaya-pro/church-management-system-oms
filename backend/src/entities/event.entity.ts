import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  date: Date;

  @Column()
  time: string;

  @Column()
  location: string;

  @Column()
  description: string;

  @Column()
  attendees: number;

  @Column()
  capacity: number;
}