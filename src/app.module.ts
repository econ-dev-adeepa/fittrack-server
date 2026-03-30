import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Gym } from './gyms/gym.entity';
import { GymAffiliation } from './affiliations/gym-affiliation.entity';
import { Program } from './programs/program.entity';
import { PTRelationship } from './pt-relationships/pt-relationship.entity';
import { ProgramsModule } from './programs/programs.module';
import { PTRelationshipsModule } from './pt-relationships/pt-relationships.module';
import { AffiliationsModule } from './affiliations/affiliations.module';
import { GymsModule } from './gyms/gyms.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RefreshUserInterceptor } from './common/interceptors/refreshuser.interceptor';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [User, Gym, GymAffiliation, Program, PTRelationship],
        synchronize: true,
      }),
    }),
    ProgramsModule,
    PTRelationshipsModule,
    AffiliationsModule,
    GymsModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RefreshUserInterceptor,
    },
  ],
})
export class AppModule {}