import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BranchAllowedIpResponseDto, UpsertBranchAllowedIpDto } from '../../../application/dtos/user-admin.dto';
import {
  ListBranchAllowedIpsUseCase,
  UpsertBranchAllowedIpsUseCase,
} from '../../../application/use-cases/branch-allowed-ip.use-cases';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

@ApiTags('Branch Login IP')
@Controller('branches/:branchId/allowed-ips')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class BranchAllowedIpController {
  constructor(
    private readonly listBranchAllowedIpsUseCase: ListBranchAllowedIpsUseCase,
    private readonly upsertBranchAllowedIpsUseCase: UpsertBranchAllowedIpsUseCase
  ) {}

  @Get()
  @RequirePermissions('branch:read')
  @ApiOperation({ summary: 'Lấy danh sách IP được phép đăng nhập theo chi nhánh' })
  @ApiResponse({ status: 200, type: [BranchAllowedIpResponseDto] })
  async getAll(@Param('branchId') branchId: string): Promise<BranchAllowedIpResponseDto[]> {
    return await this.listBranchAllowedIpsUseCase.execute(branchId);
  }

  @Put()
  @RequirePermissions('branch:update')
  @ApiOperation({ summary: 'Cập nhật danh sách IP được phép đăng nhập theo chi nhánh' })
  @ApiResponse({ status: 200, type: [BranchAllowedIpResponseDto] })
  async upsert(
    @Param('branchId') branchId: string,
    @Body() dto: UpsertBranchAllowedIpDto[]
  ): Promise<BranchAllowedIpResponseDto[]> {
    return await this.upsertBranchAllowedIpsUseCase.execute(branchId, dto);
  }
}
