import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ description: 'Access Token phục vụ gọi API' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh Token phục vụ làm mới Access Token' })
  refreshToken: string;
}
