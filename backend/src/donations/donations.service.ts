import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donation } from '../entities/donation.entity';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(Donation)
    private donationsRepository: Repository<Donation>,
  ) {}

  findAll(): Promise<Donation[]> {
    return this.donationsRepository.find();
  }

  findOne(id: string): Promise<Donation | null> {
    return this.donationsRepository.findOneBy({ id });
  }

  async create(donation: Partial<Donation>): Promise<Donation> {
    const newDonation = this.donationsRepository.create(donation);
    return this.donationsRepository.save(newDonation);
  }

  async update(id: string, donation: Partial<Donation>): Promise<Donation | null> {
    await this.donationsRepository.update(id, donation);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.donationsRepository.delete(id);
  }
}