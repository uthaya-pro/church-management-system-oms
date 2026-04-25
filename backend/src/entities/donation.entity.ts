import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Donation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  donor: string;

  @Column('decimal')
  amount: number;

  @Column()
  date: Date;

  @Column()
  category: string;

  @Column()
  method: 'cash' | 'check' | 'online' | 'other';

  @Column('text', { nullable: true })
  verificationImage?: string | null;

  @Column({ default: false })
  isVerified: boolean;
}
