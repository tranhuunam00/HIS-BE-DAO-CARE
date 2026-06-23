import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'doctor@hisdaocare.com', description: 'Email đăng ký' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ example: 'Doctor@HIS2026!', description: 'Mật khẩu đăng nhập' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải dài tối thiểu 6 ký tự' })
  password: string;

  @ApiProperty({ example: 'DOCTOR', description: 'Tên vai trò (ADMIN, DOCTOR, RECEPTION, NURSE)', required: false })
  @IsOptional()
  @IsString()
  roleName?: string;
}
