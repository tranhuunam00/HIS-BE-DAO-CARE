import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { IFormTemplateRepositoryToken } from '../../domain/repositories/form-template.repository.interface';
import type { IFormTemplateRepository } from '../../domain/repositories/form-template.repository.interface';
import { FormTemplate } from '../../domain/entities/form-template.model';
import { CreateFormTemplateDto, UpdateFormTemplateDto, FormTemplateResponseDto } from '../dtos/form-template.dto';

@Injectable()
export class ListFormTemplatesUseCase {
  constructor(
    @Inject(IFormTemplateRepositoryToken)
    private readonly repository: IFormTemplateRepository,
  ) {}

  async execute(type?: string, category?: string): Promise<FormTemplateResponseDto[]> {
    const list = await this.repository.findAll(type, category);
    return list.map((item) => this.mapToDto(item));
  }

  private mapToDto(model: FormTemplate): FormTemplateResponseDto {
    return {
      id: model.id,
      name: model.name,
      code: model.code,
      type: model.type,
      category: model.category,
      htmlContent: model.htmlContent,
      description: model.description,
      isActive: model.isActive,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class GetFormTemplateUseCase {
  constructor(
    @Inject(IFormTemplateRepositoryToken)
    private readonly repository: IFormTemplateRepository,
  ) {}

  async execute(id: string): Promise<FormTemplateResponseDto> {
    const template = await this.repository.findById(id);
    if (!template) {
      throw new NotFoundException('Không tìm thấy mẫu biểu mẫu');
    }
    return this.mapToDto(template);
  }

  private mapToDto(model: FormTemplate): FormTemplateResponseDto {
    return {
      id: model.id,
      name: model.name,
      code: model.code,
      type: model.type,
      category: model.category,
      htmlContent: model.htmlContent,
      description: model.description,
      isActive: model.isActive,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class CreateFormTemplateUseCase {
  constructor(
    @Inject(IFormTemplateRepositoryToken)
    private readonly repository: IFormTemplateRepository,
  ) {}

  async execute(dto: CreateFormTemplateDto): Promise<FormTemplateResponseDto> {
    const existing = await this.repository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException('Mã biểu mẫu này đã tồn tại');
    }

    const template = new FormTemplate(
      '',
      dto.name,
      dto.code,
      dto.type,
      dto.category,
      dto.htmlContent,
      dto.description || null,
      true,
    );

    const saved = await this.repository.save(template);
    return this.mapToDto(saved);
  }

  private mapToDto(model: FormTemplate): FormTemplateResponseDto {
    return {
      id: model.id,
      name: model.name,
      code: model.code,
      type: model.type,
      category: model.category,
      htmlContent: model.htmlContent,
      description: model.description,
      isActive: model.isActive,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class UpdateFormTemplateUseCase {
  constructor(
    @Inject(IFormTemplateRepositoryToken)
    private readonly repository: IFormTemplateRepository,
  ) {}

  async execute(id: string, dto: UpdateFormTemplateDto): Promise<FormTemplateResponseDto> {
    const template = await this.repository.findById(id);
    if (!template) {
      throw new NotFoundException('Không tìm thấy mẫu biểu mẫu');
    }

    const updated = new FormTemplate(
      template.id,
      dto.name ?? template.name,
      template.code,
      dto.type ?? template.type,
      dto.category ?? template.category,
      dto.htmlContent ?? template.htmlContent,
      dto.description !== undefined ? dto.description : template.description,
      template.isActive,
    );

    const saved = await this.repository.save(updated);
    return this.mapToDto(saved);
  }

  private mapToDto(model: FormTemplate): FormTemplateResponseDto {
    return {
      id: model.id,
      name: model.name,
      code: model.code,
      type: model.type,
      category: model.category,
      htmlContent: model.htmlContent,
      description: model.description,
      isActive: model.isActive,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class ToggleFormTemplateStatusUseCase {
  constructor(
    @Inject(IFormTemplateRepositoryToken)
    private readonly repository: IFormTemplateRepository,
  ) {}

  async execute(id: string, isActive: boolean): Promise<FormTemplateResponseDto> {
    const template = await this.repository.findById(id);
    if (!template) {
      throw new NotFoundException('Không tìm thấy mẫu biểu mẫu');
    }

    const updated = new FormTemplate(
      template.id,
      template.name,
      template.code,
      template.type,
      template.category,
      template.htmlContent,
      template.description,
      isActive,
    );

    const saved = await this.repository.save(updated);
    return this.mapToDto(saved);
  }

  private mapToDto(model: FormTemplate): FormTemplateResponseDto {
    return {
      id: model.id,
      name: model.name,
      code: model.code,
      type: model.type,
      category: model.category,
      htmlContent: model.htmlContent,
      description: model.description,
      isActive: model.isActive,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}
