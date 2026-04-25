import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
  ) {}

  findAll(): Promise<Member[]> {
    return this.membersRepository.find();
  }

  findOne(id: string): Promise<Member | null> {
    return this.membersRepository.findOneBy({ id });
  }

  async create(member: Partial<Member>): Promise<Member> {
    const newMember = this.membersRepository.create(member);
    return this.membersRepository.save(newMember);
  }

  async createMany(members: Partial<Member>[]): Promise<Member[]> {
    const newMembers = this.membersRepository.create(members);
    return this.membersRepository.save(newMembers);
  }

  async update(id: string, member: Partial<Member>): Promise<Member | null> {
    await this.membersRepository.update(id, member);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.membersRepository.delete(id);
  }
}