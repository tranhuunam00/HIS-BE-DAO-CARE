import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, IsInt, Min, Max, IsIn } from 'class-validator';
import {
  PATIENT_VISIT_STATUS,
  VISIT_PRIORITY,
  type PatientVisitStatus,
  type VisitPriority,
} from '../../../../common/constants/workflow.constants';

export class CheckInDto {
  @ApiPropertyOptional({ description: 'ID của lịch hẹn đặt trước' })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @ApiProperty({ description: 'ID của bệnh nhân' })
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'ID của chi nhánh' })
  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @ApiPropertyOptional({ description: 'Phòng khám gán đầu tiên' })
  @IsOptional()
  @IsUUID()
  currentRoomId?: string;

  @ApiPropertyOptional({ description: 'Bác sĩ gán đầu tiên' })
  @IsOptional()
  @IsUUID()
  currentDoctorId?: string;

  @ApiPropertyOptional({ description: 'Lý do khám' })
  @IsOptional()
  @IsString()
  reason?: string;

  // Sinh hiệu ban đầu
  @ApiPropertyOptional({ description: 'Mạch (nhịp/phút)' })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(250)
  pulse?: number;

  @ApiPropertyOptional({ description: 'Huyết áp (e.g. 120/80)' })
  @IsOptional()
  @IsString()
  bloodPressure?: string;

  @ApiPropertyOptional({ description: 'Nhiệt độ (°C)' })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Cân nặng (kg)' })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ description: 'Chiều cao (cm)' })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ description: 'Cấp độ ưu tiên tiếp nhận', enum: VISIT_PRIORITY })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(VISIT_PRIORITY))
  priorityLevel?: VisitPriority;
}

export class UpdateVitalSignsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  pulse?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bloodPressure?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  height?: number;
}

export class TransferRoomDto {
  @ApiProperty({ description: 'ID của phòng khám/phòng thực hiện mới' })
  @IsNotEmpty()
  @IsUUID()
  roomId: string;

  @ApiPropertyOptional({ description: 'Bác sĩ mới phụ trách phòng đó' })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({ description: 'Điều dưỡng mới phụ trách' })
  @IsOptional()
  @IsUUID()
  nurseId?: string;

  @ApiPropertyOptional({ description: 'Trạng thái chuyển', enum: PATIENT_VISIT_STATUS })
  @IsOptional()
  @IsString()
  @IsIn(Object.values(PATIENT_VISIT_STATUS))
  status?: PatientVisitStatus;
}

export class PatientVisitResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  visitCode: string;

  @ApiProperty()
  patientId: string;

  @ApiProperty({ required: false })
  patient?: any;

  @ApiProperty()
  branchId: string;

  @ApiProperty({ required: false })
  branch?: any;

  @ApiProperty({ required: false })
  appointmentId: string | null;

  @ApiProperty({ required: false })
  currentRoomId: string | null;

  @ApiProperty({ required: false })
  currentRoom?: any;

  @ApiProperty({ required: false })
  currentDoctorId: string | null;

  @ApiProperty({ required: false })
  currentDoctor?: any;

  @ApiProperty({ required: false })
  currentNurseId: string | null;

  @ApiProperty({ required: false })
  currentNurse?: any;

  @ApiProperty()
  queueNumber: number;

  @ApiProperty({ description: 'Cấp độ ưu tiên tiếp nhận' })
  priorityLevel: string;

  @ApiProperty({ required: false, description: 'Số thứ tự hiển thị' })
  queueCode: string | null;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  reason: string | null;

  @ApiProperty({ required: false })
  pulse: number | null;

  @ApiProperty({ required: false })
  bloodPressure: string | null;

  @ApiProperty({ required: false })
  temperature: number | null;

  @ApiProperty({ required: false })
  weight: number | null;

  @ApiProperty({ required: false })
  height: number | null;

  @ApiProperty({ required: false })
  diagnosis?: string;

  @ApiProperty({ required: false })
  advice?: string;

  @ApiProperty({ required: false })
  prescriptions?: any[];

  @ApiProperty({ required: false })
  appointment?: any;

  @ApiPropertyOptional({ description: 'Đơn dịch vụ chỉ định liên quan' })
  order?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
