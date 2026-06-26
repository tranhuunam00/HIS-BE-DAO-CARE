import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsDateString, IsIn } from 'class-validator';
import {
  APPOINTMENT_STATUS,
  type AppointmentStatus,
} from '../../../../common/constants/workflow.constants';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID của bệnh nhân' })
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'ID của chi nhánh' })
  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @ApiPropertyOptional({ description: 'ID của bác sĩ khám' })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ description: 'ID của phòng khám' })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional({ description: 'ID của dịch vụ khám' })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiProperty({ description: 'Ngày hẹn (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({ description: 'Giờ bắt đầu (e.g. 09:00)' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'Giờ kết thúc (e.g. 09:30)' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ description: 'Ghi chú thêm' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ enum: APPOINTMENT_STATUS })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(APPOINTMENT_STATUS))
  status?: AppointmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AppointmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  appointmentCode: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty({ required: false })
  patient?: any;

  @ApiProperty()
  branchId: string;

  @ApiProperty({ required: false })
  branch?: any;

  @ApiProperty({ required: false })
  doctorId: string | null;

  @ApiProperty({ required: false })
  doctor?: any;

  @ApiProperty({ required: false })
  roomId: string | null;

  @ApiProperty({ required: false })
  room?: any;

  @ApiProperty({ required: false })
  serviceId: string | null;

  @ApiProperty({ required: false })
  service?: any;

  @ApiProperty()
  appointmentDate: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  notes: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
