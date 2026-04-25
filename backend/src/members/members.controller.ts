import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MembersService } from './members.service';
import { Member } from '../entities/member.entity';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll(): Promise<Member[]> {
    return this.membersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Member | null> {
    return this.membersService.findOne(id);
  }

  @Post()
  create(@Body() member: Partial<Member>): Promise<Member> {
    return this.membersService.create(member);
  }

  @Post('bulk')
  createMany(@Body() members: Partial<Member>[]): Promise<Member[]> {
    return this.membersService.createMany(members);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() member: Partial<Member>): Promise<Member | null> {
    return this.membersService.update(id, member);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.membersService.remove(id);
  }
}