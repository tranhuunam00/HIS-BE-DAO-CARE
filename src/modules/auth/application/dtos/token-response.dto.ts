import { ApiProperty } from '@nestjs/swagger';

export class AuthUserSessionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  username: string | null;

  @ApiProperty()
  roleId: string;

  @ApiProperty({ nullable: true })
  defaultBranchId: string | null;

  @ApiProperty({ nullable: true })
  activeBranchId: string | null;

  @ApiProperty()
  branchScopeMode: string;

  @ApiProperty({ type: [String] })
  branchScopeIds: string[];

  @ApiProperty()
  bypassIpRestriction: boolean;
}

export class TokenResponseDto {
  @ApiProperty({ description: 'Access Token phục vụ gọi API' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh Token phục vụ làm mới Access Token' })
  refreshToken: string;

  @ApiProperty({ type: AuthUserSessionDto, required: false })
  user?: AuthUserSessionDto;
}
