import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientOrmEntity } from '../../infrastructure/database/patient.entity';
import { AppointmentOrmEntity } from '../../infrastructure/database/appointment.entity';
import { PatientVisitOrmEntity } from '../../infrastructure/database/patient-visit.entity';
import { PatientRepository } from '../../infrastructure/repositories/patient.repository';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { PatientVisitRepository } from '../../infrastructure/repositories/patient-visit.repository';

import { PatientController } from './controllers/patient.controller';
import { AppointmentController } from './controllers/appointment.controller';
import { PatientVisitController } from './controllers/patient-visit.controller';

import { IPatientRepositoryToken, ListPatientsUseCase, GetPatientUseCase, CreatePatientUseCase, UpdatePatientUseCase } from '../../application/use-cases/patient.use-cases';
import { IAppointmentRepositoryToken, ListAppointmentsUseCase, GetAppointmentUseCase, CreateAppointmentUseCase, UpdateAppointmentUseCase } from '../../application/use-cases/appointment.use-cases';
import { IPatientVisitRepositoryToken, ListPatientVisitsUseCase, GetPatientVisitUseCase, CheckInUseCase, UpdateVitalSignsUseCase, TransferRoomUseCase } from '../../application/use-cases/patient-visit.use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientOrmEntity,
      AppointmentOrmEntity,
      PatientVisitOrmEntity,
    ]),
  ],
  controllers: [
    PatientController,
    AppointmentController,
    PatientVisitController,
  ],
  providers: [
    {
      provide: IPatientRepositoryToken,
      useClass: PatientRepository,
    },
    {
      provide: IAppointmentRepositoryToken,
      useClass: AppointmentRepository,
    },
    {
      provide: IPatientVisitRepositoryToken,
      useClass: PatientVisitRepository,
    },
    // Patient Use Cases
    ListPatientsUseCase,
    GetPatientUseCase,
    CreatePatientUseCase,
    UpdatePatientUseCase,
    // Appointment Use Cases
    ListAppointmentsUseCase,
    GetAppointmentUseCase,
    CreateAppointmentUseCase,
    UpdateAppointmentUseCase,
    // PatientVisit Use Cases
    ListPatientVisitsUseCase,
    GetPatientVisitUseCase,
    CheckInUseCase,
    UpdateVitalSignsUseCase,
    TransferRoomUseCase,
  ],
  exports: [
    IPatientRepositoryToken,
    IAppointmentRepositoryToken,
    IPatientVisitRepositoryToken,
  ],
})
export class ReceptionModule {}
