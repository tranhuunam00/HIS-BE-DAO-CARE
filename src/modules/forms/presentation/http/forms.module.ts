import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ORM Entities
import { FormTemplateOrmEntity } from '../../infrastructure/database/form-template.entity';

// Controllers
import { FormTemplateController } from './controllers/form-template.controller';

// Repository tokens & implementations
import { IFormTemplateRepositoryToken } from '../../domain/repositories/form-template.repository.interface';
import { FormTemplateRepository } from '../../infrastructure/repositories/form-template.repository';

// Use Cases
import {
  ListFormTemplatesUseCase,
  GetFormTemplateUseCase,
  CreateFormTemplateUseCase,
  UpdateFormTemplateUseCase,
  ToggleFormTemplateStatusUseCase,
} from '../../application/use-cases/form-template.use-cases';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FormTemplateOrmEntity,
    ]),
  ],
  controllers: [
    FormTemplateController,
  ],
  providers: [
    // Repositories
    { provide: IFormTemplateRepositoryToken, useClass: FormTemplateRepository },

    // Use cases
    ListFormTemplatesUseCase,
    GetFormTemplateUseCase,
    CreateFormTemplateUseCase,
    UpdateFormTemplateUseCase,
    ToggleFormTemplateStatusUseCase,
  ],
  exports: [
    IFormTemplateRepositoryToken,
  ],
})
export class FormsModule {}
