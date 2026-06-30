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
      const roomAssignments = existingAssignments.filter((a) => a.branchId === branchId && a.roomId === roomId);
      for (const a of roomAssignments) {
        if (a.isPrimary) {
          // If it is primary, keep the assignment row but clear the roomId (so they remain assigned to the branch)
          const updatedAssignment = new StaffAssignment(
            a.id,
            a.staffId,
            a.branchId,
            a.specialtyId,
            null, // Clear roomId
            a.isPrimary,
            a.createdAt,
            new Date()
          );
          await this.staffAssignmentRepository.save(updatedAssignment);
        } else {
          // If it is a secondary assignment, delete the assignment row
          await this.staffAssignmentRepository.delete(a.id);
        }
      }
    }

    // 3. Assign or update new list of staff to this room
    for (const staffId of staffIds) {
      const staff = await this.staffRepository.findById(staffId);
      if (!staff) {
        throw new NotFoundException(`Không tìm thấy nhân viên với ID "${staffId}"`);
      }

      const existingAssignments = await this.staffAssignmentRepository.findByStaffId(staffId);
      
      // Check if they are already assigned to this room in this branch
      const alreadyAssigned = existingAssignments.some(
        (a) => a.branchId === branchId && a.roomId === roomId
      );

      if (alreadyAssigned) {
        continue;
      }

      // Check if they have an existing assignment in this branch with no room
      const emptyRoomAssignment = existingAssignments.find(
        (a) => a.branchId === branchId && !a.roomId
      );

      if (emptyRoomAssignment) {
        // Fill the empty room assignment with this room
        const updatedAssignment = new StaffAssignment(
          emptyRoomAssignment.id,
          emptyRoomAssignment.staffId,
          emptyRoomAssignment.branchId,
          emptyRoomAssignment.specialtyId,
          roomId, // Assign to room
          emptyRoomAssignment.isPrimary,
          emptyRoomAssignment.createdAt,
          new Date()
        );
        await this.staffAssignmentRepository.save(updatedAssignment);
      } else {
        // Create new assignment row for this room.
        // Make it primary only if they have no primary assignment in this branch yet.
        const hasPrimaryInBranch = existingAssignments.some(
          (a) => a.branchId === branchId && a.isPrimary
        );
        const now = new Date();
        const newAssignment = new StaffAssignment(
          crypto.randomUUID(),
          staffId,
          branchId,
          null,
          roomId, // Assign to room
          !hasPrimaryInBranch,
          now,
          now
        );
        await this.staffAssignmentRepository.save(newAssignment);
      }
    }
  }
}
