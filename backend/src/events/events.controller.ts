import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from '../entities/event.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Event | null> {
    return this.eventsService.findOne(id);
  }

  @Post()
  create(@Body() event: Partial<Event>): Promise<Event> {
    return this.eventsService.create(event);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() event: Partial<Event>): Promise<Event | null> {
    return this.eventsService.update(id, event);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.eventsService.remove(id);
  }
}