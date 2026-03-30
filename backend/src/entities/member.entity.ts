import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  age: string;

  @Column()
  joinDate: Date;

  @Column()
  status: 'active' | 'inactive' | 'pending';

  @Column()
  role: string;
}