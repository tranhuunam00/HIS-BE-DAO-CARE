import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IStaffRepositoryToken } from '../../domain/repositories/staff.repository.interface';
import type { IStaffRepository } from '../../domain/repositories/staff.repository.interface';
import { IRoomRepositoryToken } from '../../domain/repositories/room.repository.interface';
import type { IRoomRepository } from '../../domain/repositories/room.repository.interface';
import { IStaffAssignmentRepositoryToken } from '../../domain/repositories/staff-assignment.repository.interface';
import type { IStaffAssignmentRepository } from '../../domain/repositories/staff-assignment.repository.interface';
import { StaffAssignment } from '../../domain/entities/staff-assignment.model';
import * as crypto from 'crypto';

@Injectable()
export class AssignStaffsToRoomUseCase {
  constructor(
    @Inject(IStaffRepositoryToken)
    private readonly staffRepository: IStaffRepository,
    @Inject(IRoomRepositoryToken)
    private readonly roomRepository: IRoomRepository,
    @Inject(IStaffAssignmentRepositoryToken)
    private readonly staffAssignmentRepository: IStaffAssignmentRepository
  ) {}

  async execute(roomId: string, staffIds: string[]): Promise<void> {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException(`Không tìm thấy phòng với ID "${roomId}"`);
    }

    const branchId = room.branchId;

    // 1. Find all staff currently assigned to this room
    const currentStaffList = await this.staffRepository.findAll({ roomId });
    const currentStaffIds = currentStaffList.map((s) => s.id);

    // 2. Unassign staff who are currently assigned to this room but not in the new staffIds list
    const staffToUnassign = currentStaffIds.filter((id) => !staffIds.includes(id));
    for (const staffId of staffToUnassign) {
      const existingAssignments = await this.staffAssignmentRepository.findByStaffId(staffId);
      const branchAssignment = existingAssignments.find((a) => a.branchId === branchId);
      if (branchAssignment) {
        // Set roomId to null for this assignment
        const updatedAssignment = new StaffAssignment(
          branchAssignment.id,
          branchAssignment.staffId,
          branchAssignment.branchId,
          branchAssignment.specialtyId,
          null, // Clear roomId
          branchAssignment.isPrimary,
          branchAssignment.createdAt,
          new Date()
        );
        await this.staffAssignmentRepository.save(updatedAssignment);
      }
    }

    // 3. Assign or update new list of staff to this room
    for (const staffId of staffIds) {
      const staff = await this.staffRepository.findById(staffId);
      if (!staff) {
        throw new NotFoundException(`Không tìm thấy nhân viên với ID "${staffId}"`);
      }

      const existingAssignments = await this.staffAssignmentRepository.findByStaffId(staffId);
      const branchAssignment = existingAssignments.find((a) => a.branchId === branchId);

      if (branchAssignment) {
        // Update existing assignment's roomId
        const updatedAssignment = new StaffAssignment(
          branchAssignment.id,
          branchAssignment.staffId,
          branchAssignment.branchId,
          branchAssignment.specialtyId,
          roomId, // Assign to room
          branchAssignment.isPrimary,
          branchAssignment.createdAt,
          new Date()
        );
        await this.staffAssignmentRepository.save(updatedAssignment);
      } else {
        // Create new assignment
        const now = new Date();
        const newAssignment = new StaffAssignment(
          crypto.randomUUID(),
          staffId,
          branchId,
          null,
          roomId, // Assign to room
          false, // defaults to false for new secondary assignments
          now,
          now
        );
        await this.staffAssignmentRepository.save(newAssignment);
      }
    }
  }
}
