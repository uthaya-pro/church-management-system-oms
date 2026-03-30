import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Member } from './entities/member.entity';
import { Event } from './entities/event.entity';
import { Donation } from './entities/donation.entity';
import { MembersModule } from './members/members.module';
import { EventsModule } from './events/events.module';
import { DonationsModule } from './donations/donations.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE === 'sqlite' ? 'sqlite' : 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Member, Event, Donation],
      synchronize: true, // Set to false in production
    }),
    MembersModule,
    EventsModule,
    DonationsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
