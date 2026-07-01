import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@hisdaocare.com', description: 'Tên đăng nhập hoặc Email của người dùng' })
  @IsString({ message: 'Tên đăng nhập hoặc Email không hợp lệ' })
  @IsNotEmpty({ message: 'Tên đăng nhập hoặc Email không được để trống' })
  email: string;

  @ApiProperty({ example: 'Admin@HIS2026!', description: 'Mật khẩu đăng nhập' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải dài tối thiểu 6 ký tự' })
  password: string;
}
