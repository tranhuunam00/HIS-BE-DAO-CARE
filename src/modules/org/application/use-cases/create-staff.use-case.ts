import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IStaffRepositoryToken } from '../../domain/repositories/staff.repository.interface';
import type { IStaffRepository } from '../../domain/repositories/staff.repository.interface';
import { CreateStaffDto, StaffResponseDto } from '../dtos/staff.dto';
import { Staff } from '../../domain/entities/staff.model';
import * as crypto from 'crypto';

@Injectable()
export class CreateStaffUseCase {
  constructor(
    @Inject(IStaffRepositoryToken)
    private readonly staffRepository: IStaffRepository
  ) {}

  async execute(dto: CreateStaffDto): Promise<StaffResponseDto> {
    const existingCode = await this.staffRepository.findByCode(dto.staffCode);
    if (existingCode) {
      throw new ConflictException(`Mã nhân viên "${dto.staffCode}" đã được sử dụng.`);
    }

    const existingEmail = await this.staffRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException(`Email "${dto.email}" đã được sử dụng.`);
    }

    const existingIdNumber = await this.staffRepository.findByIdentityNumber(dto.identityNumber);
    if (existingIdNumber) {
      throw new ConflictException(`Số CCCD/Identity number "${dto.identityNumber}" đã được sử dụng.`);
    }

    const id = crypto.randomUUID();
    const now = new Date();
    const staff = new Staff(
      id,
      dto.fullName,
      new Date(dto.dateOfBirth),
      dto.gender,
      dto.identityNumber,
      dto.phone,
      dto.email,
      dto.address || null,
      dto.staffCode,
      new Date(dto.joinDate),
      dto.title,
      true,
      dto.userId || null,
      dto.nickname || null,
      now,
      now,
      null,
      []
    );

    const saved = await this.staffRepository.save(staff);
    return {
      id: saved.id,
      fullName: saved.fullName,
      dateOfBirth: saved.dateOfBirth,
      gender: saved.gender,
      identityNumber: saved.identityNumber,
      phone: saved.phone,
      email: saved.email,
      address: saved.address,
      staffCode: saved.staffCode,
      joinDate: saved.joinDate,
      title: saved.title,
      isActive: saved.isActive,
      userId: saved.userId,
      certificate: null,
      assignments: [],
      nickname: saved.nickname,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
