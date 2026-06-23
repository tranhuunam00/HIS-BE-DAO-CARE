import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ORM Entities
import { SpecialtyOrmEntity } from '../../infrastructure/database/specialty.entity';
import { ServiceOrmEntity } from '../../infrastructure/database/service.entity';
import { ServicePriceOrmEntity } from '../../infrastructure/database/service-price.entity';
import { Icd10OrmEntity } from '../../infrastructure/database/icd10.entity';
import { MedicationOrmEntity } from '../../infrastructure/database/medication.entity';

// Controllers
import { SpecialtyController } from './controllers/specialty.controller';
import { ServiceController } from './controllers/service.controller';
import { Icd10Controller } from './controllers/icd10.controller';
import { MedicationController } from './controllers/medication.controller';

// Repository tokens & implementations
import { ISpecialtyRepositoryToken } from '../../domain/repositories/specialty.repository.interface';
import { SpecialtyRepository } from '../../infrastructure/repositories/specialty.repository';
import { IServiceRepositoryToken } from '../../domain/repositories/service.repository.interface';
import { ServiceRepository } from '../../infrastructure/repositories/service.repository';
import { IServicePriceRepositoryToken } from '../../domain/repositories/service-price.repository.interface';
import { ServicePriceRepository } from '../../infrastructure/repositories/service-price.repository';
import { IIcd10RepositoryToken } from '../../domain/repositories/icd10.repository.interface';
import { Icd10Repository } from '../../infrastructure/repositories/icd10.repository';
import { IMedicationRepositoryToken } from '../../domain/repositories/medication.repository.interface';
import { MedicationRepository } from '../../infrastructure/repositories/medication.repository';

// Use Cases — Specialty
import { ListSpecialtiesUseCase } from '../../application/use-cases/list-specialties.use-case';
import { GetSpecialtyUseCase } from '../../application/use-cases/get-specialty.use-case';
import { CreateSpecialtyUseCase } from '../../application/use-cases/create-specialty.use-case';
import { UpdateSpecialtyUseCase } from '../../application/use-cases/update-specialty.use-case';
import { ToggleSpecialtyStatusUseCase } from '../../application/use-cases/toggle-specialty-status.use-case';

// Use Cases — Service
import { ListServicesUseCase } from '../../application/use-cases/list-services.use-case';
import { GetServiceUseCase } from '../../application/use-cases/get-service.use-case';
import { CreateServiceUseCase } from '../../application/use-cases/create-service.use-case';
import { UpdateServiceUseCase } from '../../application/use-cases/update-service.use-case';
import { ToggleServiceStatusUseCase } from '../../application/use-cases/toggle-service-status.use-case';
import { UpsertServicePricesUseCase } from '../../application/use-cases/upsert-service-prices.use-case';

// Use Cases — ICD-10
import { ListIcd10UseCase } from '../../application/use-cases/list-icd10.use-case';
import { GetIcd10UseCase } from '../../application/use-cases/get-icd10.use-case';
import { CreateIcd10UseCase } from '../../application/use-cases/create-icd10.use-case';
import { UpdateIcd10UseCase } from '../../application/use-cases/update-icd10.use-case';

// Use Cases — Medication
import { ListMedicationsUseCase } from '../../application/use-cases/list-medications.use-case';
import { GetMedicationUseCase } from '../../application/use-cases/get-medication.use-case';
import { CreateMedicationUseCase } from '../../application/use-cases/create-medication.use-case';
import { UpdateMedicationUseCase } from '../../application/use-cases/update-medication.use-case';
import { ToggleMedicationStatusUseCase } from '../../application/use-cases/toggle-medication-status.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpecialtyOrmEntity,
      ServiceOrmEntity,
      ServicePriceOrmEntity,
      Icd10OrmEntity,
      MedicationOrmEntity,
    ]),
  ],
  controllers: [
    SpecialtyController,
    ServiceController,
    Icd10Controller,
    MedicationController,
  ],
  providers: [
    // Repositories
    { provide: ISpecialtyRepositoryToken, useClass: SpecialtyRepository },
    { provide: IServiceRepositoryToken, useClass: ServiceRepository },
    { provide: IServicePriceRepositoryToken, useClass: ServicePriceRepository },
    { provide: IIcd10RepositoryToken, useClass: Icd10Repository },
    { provide: IMedicationRepositoryToken, useClass: MedicationRepository },

    // Specialty use cases
    ListSpecialtiesUseCase,
    GetSpecialtyUseCase,
    CreateSpecialtyUseCase,
    UpdateSpecialtyUseCase,
    ToggleSpecialtyStatusUseCase,

    // Service use cases
    ListServicesUseCase,
    GetServiceUseCase,
    CreateServiceUseCase,
    UpdateServiceUseCase,
    ToggleServiceStatusUseCase,
    UpsertServicePricesUseCase,

    // ICD-10 use cases
    ListIcd10UseCase,
    GetIcd10UseCase,
    CreateIcd10UseCase,
    UpdateIcd10UseCase,

    // Medication use cases
    ListMedicationsUseCase,
    GetMedicationUseCase,
    CreateMedicationUseCase,
    UpdateMedicationUseCase,
    ToggleMedicationStatusUseCase,
  ],
  exports: [
    ISpecialtyRepositoryToken,
    IServiceRepositoryToken,
    IIcd10RepositoryToken,
    IMedicationRepositoryToken,
  ],
})
export class MedicalModule {}
