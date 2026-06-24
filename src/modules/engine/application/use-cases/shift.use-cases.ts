import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IShiftRepositoryToken } from '../../domain/repositories/shift.repository.interface';
import type { IShiftRepository } from '../../domain/repositories/shift.repository.interface';
import { Shift } from '../../domain/entities/shift.model';
import { CreateShiftDto, UpdateShiftDto, ShiftResponseDto } from '../dtos/schedule.dto';

@Injectable()
export class ListShiftsUseCase {
  constructor(
    @Inject(IShiftRepositoryToken)
    private readonly shiftRepository: IShiftRepository,
  ) {}

  async execute(): Promise<ShiftResponseDto[]> {
    const shifts = await this.shiftRepository.findAll();
    return shifts.map((s) => this.mapToDto(s));
  }

  private mapToDto(shift: Shift): ShiftResponseDto {
    return {
      id: shift.id,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      isActive: shift.isActive,
      createdAt: shift.createdAt!,
      updatedAt: shift.updatedAt!,
    };
  }
}

@Injectable()
export class CreateShiftUseCase {
  constructor(
    @Inject(IShiftRepositoryToken)
    private readonly shiftRepository: IShiftRepository,
  ) {}

  async execute(dto: CreateShiftDto): Promise<ShiftResponseDto> {
    // Validate shift times (startTime < endTime)
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('Giờ bắt đầu phải nhỏ hơn giờ kết thúc');
    }

    const shift = new Shift('', dto.name, dto.startTime, dto.endTime, true);
    const saved = await this.shiftRepository.save(shift);
    return this.mapToDto(saved);
  }

  private mapToDto(shift: Shift): ShiftResponseDto {
    return {
      id: shift.id,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      isActive: shift.isActive,
      createdAt: shift.createdAt!,
      updatedAt: shift.updatedAt!,
    };
  }
}

@Injectable()
export class UpdateShiftUseCase {
  constructor(
    @Inject(IShiftRepositoryToken)
    private readonly shiftRepository: IShiftRepository,
  ) {}

  async execute(id: string, dto: UpdateShiftDto): Promise<ShiftResponseDto> {
    const shift = await this.shiftRepository.findById(id);
    if (!shift) {
      throw new NotFoundException('Không tìm thấy ca trực');
    }

    const newStartTime = dto.startTime ?? shift.startTime;
    const newEndTime = dto.endTime ?? shift.endTime;

    if (newStartTime >= newEndTime) {
      throw new BadRequestException('Giờ bắt đầu phải nhỏ hơn giờ kết thúc');
    }

    const updated = new Shift(
      shift.id,
      dto.name ?? shift.name,
      newStartTime,
      newEndTime,
      shift.isActive,
    );

    const saved = await this.shiftRepository.save(updated);
    return this.mapToDto(saved);
  }

  private mapToDto(shift: Shift): ShiftResponseDto {
    return {
      id: shift.id,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      isActive: shift.isActive,
      createdAt: shift.createdAt!,
      updatedAt: shift.updatedAt!,
    };
  }
}

@Injectable()
export class ToggleShiftStatusUseCase {
  constructor(
    @Inject(IShiftRepositoryToken)
    private readonly shiftRepository: IShiftRepository,
  ) {}

  async execute(id: string, isActive: boolean): Promise<ShiftResponseDto> {
    const shift = await this.shiftRepository.findById(id);
    if (!shift) {
      throw new NotFoundException('Không tìm thấy ca trực');
    }

    const updated = new Shift(
      shift.id,
      shift.name,
      shift.startTime,
      shift.endTime,
      isActive,
    );

    const saved = await this.shiftRepository.save(updated);
    return this.mapToDto(saved);
  }

  private mapToDto(shift: Shift): ShiftResponseDto {
    return {
      id: shift.id,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      isActive: shift.isActive,
      createdAt: shift.createdAt!,
      updatedAt: shift.updatedAt!,
    };
  }
}
