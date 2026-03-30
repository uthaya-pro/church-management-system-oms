import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { Donation } from '../entities/donation.entity';

@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Get()
  findAll(): Promise<Donation[]> {
    return this.donationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Donation | null> {
    return this.donationsService.findOne(id);
  }

  @Post()
  create(@Body() donation: Partial<Donation>): Promise<Donation> {
    return this.donationsService.create(donation);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() donation: Partial<Donation>): Promise<Donation | null> {
    return this.donationsService.update(id, donation);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.donationsService.remove(id);
  }
}