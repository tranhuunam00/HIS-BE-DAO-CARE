import { IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({ example: 'staff-uuid' })
  @IsUUID()
  @IsNotEmpty()
  staffId: string;

  @ApiProperty({ example: 'branch-uuid' })
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({ example: 'shift-uuid' })
  @IsUUID()
  @IsNotEmpty()
  shiftId: string;

  @ApiProperty({ example: '2026-06-24', description: 'Ngày điểm danh, định dạng YYYY-MM-DD' })
  @IsDateString()
  @IsNotEmpty()
  date: string;
}

export class CheckOutDto {
  @ApiProperty({ example: 'attendance-uuid' })
  @IsUUID()
  @IsNotEmpty()
  attendanceId: string;

  @ApiProperty({ example: 'Hết ca trực' })
  @IsString()
  @IsNotEmpty()
  checkoutReason: string;
}

export class AttendanceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() staffId: string;
  @ApiProperty() branchId: string;
  @ApiProperty() date: string;
  @ApiProperty() shiftId: string;
  @ApiProperty({ required: false, nullable: true }) checkInTime: Date | null;
  @ApiProperty({ required: false, nullable: true }) checkOutTime: Date | null;
  @ApiProperty({ required: false, nullable: true }) checkoutReason: string | null;
  @ApiProperty() status: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
