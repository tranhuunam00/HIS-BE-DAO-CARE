import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IStaffRepositoryToken } from '../../domain/repositories/staff.repository.interface';
import type { IStaffRepository } from '../../domain/repositories/staff.repository.interface';
import { IBranchRepositoryToken } from '../../domain/repositories/branch.repository.interface';
import type { IBranchRepository } from '../../domain/repositories/branch.repository.interface';
import { IRoomRepositoryToken } from '../../domain/repositories/room.repository.interface';
import type { IRoomRepository } from '../../domain/repositories/room.repository.interface';
import { IStaffAssignmentRepositoryToken } from '../../domain/repositories/staff-assignment.repository.interface';
import type { IStaffAssignmentRepository } from '../../domain/repositories/staff-assignment.repository.interface';
import { AssignStaffDto, StaffAssignmentResponseDto } from '../dtos/staff.dto';
import { StaffAssignment } from '../../domain/entities/staff-assignment.model';
import * as crypto from 'crypto';

@Injectable()
export class AssignStaffUseCase {
  constructor(
    @Inject(IStaffRepositoryToken)
    private readonly staffRepository: IStaffRepository,
    @Inject(IBranchRepositoryToken)
    private readonly branchRepository: IBranchRepository,
    @Inject(IRoomRepositoryToken)
    private readonly roomRepository: IRoomRepository,
    @Inject(IStaffAssignmentRepositoryToken)
    private readonly staffAssignmentRepository: IStaffAssignmentRepository
  ) {}

  async execute(staffId: string, dto: AssignStaffDto): Promise<StaffAssignmentResponseDto> {
    const staff = await this.staffRepository.findById(staffId);
    if (!staff) {
      throw new NotFoundException(`Không tìm thấy nhân viên với ID "${staffId}"`);
    }

    const branch = await this.branchRepository.findById(dto.branchId);
    if (!branch) {
      throw new NotFoundException(`Không tìm thấy chi nhánh với ID "${dto.branchId}"`);
    }

    if (dto.roomId) {
      const room = await this.roomRepository.findById(dto.roomId);
      if (!room) {
        throw new NotFoundException(`Không tìm thấy phòng với ID "${dto.roomId}"`);
      }
    }

    const isPrimary = dto.isPrimary !== undefined ? dto.isPrimary : true;

    if (isPrimary) {
      await this.staffAssignmentRepository.clearPrimary(staffId);
    }

    // Check if assignment for this branch already exists for this staff to update, otherwise create new
    const existingAssignments = await this.staffAssignmentRepository.findByStaffId(staffId);
    const existing = existingAssignments.find((a) => a.branchId === dto.branchId);

    const id = existing ? existing.id : crypto.randomUUID();
    const now = new Date();

    const assignment = new StaffAssignment(
      id,
      staffId,
      dto.branchId,
      dto.specialtyId || null,
      dto.roomId || null,
      isPrimary,
      existing ? existing.createdAt : now,
      now
    );

    const saved = await this.staffAssignmentRepository.save(assignment);
    return {
      id: saved.id,
      staffId: saved.staffId,
      branchId: saved.branchId,
      specialtyId: saved.specialtyId,
      roomId: saved.roomId,
      isPrimary: saved.isPrimary,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
