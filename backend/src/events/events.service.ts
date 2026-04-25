cdimport { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  findAll(): Promise<Event[]> {
    return this.eventsRepository.find();
  }

  findOne(id: string): Promise<Event | null> {
    return this.eventsRepository.findOneBy({ id });
  }

  async create(event: Partial<Event>): Promise<Event> {
    const newEvent = this.eventsRepository.create(event);
    return this.eventsRepository.save(newEvent);
  }

  async update(id: string, event: Partial<Event>): Promise<Event | null> {
    await this.eventsRepository.update(id, event);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.eventsRepository.delete(id);
  }
}