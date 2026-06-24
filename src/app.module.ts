import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppDataSource } from './infrastructure/database/data-source';
import { AuthModule } from './modules/auth/presentation/http/auth.module';
import { OrgModule } from './modules/org/presentation/http/org.module';
import { MedicalModule } from './modules/medical/presentation/http/medical.module';
import { EngineModule } from './modules/engine/presentation/http/engine.module';
import { FormsModule } from './modules/forms/presentation/http/forms.module';
import { ReceptionModule } from './modules/reception/presentation/http/reception.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
    }),
    AuthModule,
    OrgModule,
    MedicalModule,
    EngineModule,
    FormsModule,
    ReceptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
