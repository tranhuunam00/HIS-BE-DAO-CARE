import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PatientResponseDto } from '../../../reception/application/dtos/patient.dto';
import { TokenResponseDto } from './token-response.dto';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google Identity Services ID token' })
  @IsNotEmpty()
  @IsString()
  idToken: string;

  @ApiPropertyOptional({ description: 'Patient full name override when creating a new profile' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Patient phone, used to link or create the patient profile' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Patient date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'OTHER'])
  gender?: string;

  @ApiPropertyOptional({ description: 'Patient address' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class GoogleLoginResponseDto extends TokenResponseDto {
  @ApiProperty({ type: [PatientResponseDto] })
  patients: PatientResponseDto[];

  @ApiProperty({ nullable: true })
  activePatientId: string | null;

  @ApiProperty()
  isNewUser: boolean;

  @ApiProperty()
  isNewPatientProfile: boolean;

  @ApiProperty({
    description: 'True when the auto-created profile still needs phone, DOB or gender confirmation',
  })
  profileRequiresCompletion: boolean;
}
