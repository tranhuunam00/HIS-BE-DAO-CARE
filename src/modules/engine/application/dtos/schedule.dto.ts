import { IsString, IsNotEmpty, IsOptional, IsUUID, IsArray, IsDateString, IsEnum, ValidateNested, Matches, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  SCHEDULE_OVERRIDE_TYPE,
  type ScheduleOverrideType,
} from '../../../../common/constants/workflow.constants';

export class CreateShiftDto {
  @ApiProperty({ example: 'Ca sáng' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Giờ bắt đầu phải ở định dạng HH:mm' })
  startTime: string;

  @ApiProperty({ example: '12:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Giờ kết thúc phải ở định dạng HH:mm' })
  endTime: string;
}

export class UpdateShiftDto {
  @ApiProperty({ example: 'Ca sáng', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '08:00', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Giờ bắt đầu phải ở định dạng HH:mm' })
  startTime?: string;

  @ApiProperty({ example: '12:00', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Giờ kết thúc phải ở định dạng HH:mm' })
  endTime?: string;
}

export class ShiftResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() startTime: string;
  @ApiProperty() endTime: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class CreateStaffScheduleTemplateItemDto {
  @ApiProperty({ example: 'branch-uuid' })
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({ example: 'Monday', description: 'Monday | Tuesday | Wednesday | Thursday | Friday | Saturday | Sunday' })
  @IsEnum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
  @IsNotEmpty()
  dayOfWeek: string;

  @ApiProperty({ example: 'shift-uuid' })
  @IsUUID()
  @IsNotEmpty()
  shiftId: string;

  @ApiProperty({ example: 'room-uuid', required: false })
  @IsOptional()
  @IsUUID()
  roomId?: string;
}

export class UpdateStaffScheduleTemplateDto {
  @ApiProperty({ example: ['staff-uuid-1'] })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty()
  staffIds: string[];

  @ApiProperty({ example: '2026-06-29', description: 'Ngày áp dụng, định dạng YYYY-MM-DD' })
  @IsDateString()
  @IsNotEmpty()
  effectiveDate: string;

  @ApiProperty({ type: [CreateStaffScheduleTemplateItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStaffScheduleTemplateItemDto)
  items: CreateStaffScheduleTemplateItemDto[];
}

export class CreateOverrideDto {
  @ApiProperty({ example: 'staff-uuid' })
  @IsUUID()
  @IsNotEmpty()
  staffId: string;

  @ApiProperty({ example: '2026-06-24', description: 'Ngày điều chỉnh, định dạng YYYY-MM-DD' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ enum: SCHEDULE_OVERRIDE_TYPE, example: SCHEDULE_OVERRIDE_TYPE.LEAVE })
  @IsIn(Object.values(SCHEDULE_OVERRIDE_TYPE))
  @IsNotEmpty()
  overrideType: ScheduleOverrideType;

  @ApiProperty({ example: 'branch-uuid', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ example: 'shift-uuid', required: false })
  @IsOptional()
  @IsUUID()
  shiftId?: string;

  @ApiProperty({ example: 'room-uuid', required: false })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiProperty({ example: 'Nghỉ phép năm', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class StaffScheduleOverrideResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() staffId: string;
  @ApiProperty() date: string;
  @ApiProperty() overrideType: string;
  @ApiProperty() branchId: string | null;
  @ApiProperty() shiftId: string | null;
  @ApiProperty() roomId: string | null;
  @ApiProperty() reason: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class ResolvedScheduleShiftDto {
  @ApiProperty() shiftId: string;
  @ApiProperty() shiftName: string;
  @ApiProperty() startTime: string;
  @ApiProperty() endTime: string;
  @ApiProperty() branchId: string;
  @ApiProperty() branchName: string;
  @ApiProperty({ required: false }) roomId: string | null;
  @ApiProperty({ required: false }) roomName: string | null;
}

export class ResolvedScheduleResponseDto {
  @ApiProperty() staffId: string;
  @ApiProperty() date: string;
  @ApiProperty() dayOfWeek: string;
  @ApiProperty() isLeave: boolean;
  @ApiProperty({ required: false }) leaveReason: string | null;
  @ApiProperty({ required: false }) overrideId: string | null;
  @ApiProperty({ type: [ResolvedScheduleShiftDto] }) shifts: ResolvedScheduleShiftDto[];
}
