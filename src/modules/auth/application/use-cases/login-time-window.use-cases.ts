import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LoginTimeWindowOrmEntity } from '../../infrastructure/database/login-time-window.entity';
import { LoginTimeWindowResponseDto, UpsertLoginTimeWindowDto } from '../dtos/user-admin.dto';

@Injectable()
export class ListLoginTimeWindowsUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(): Promise<LoginTimeWindowResponseDto[]> {
    const windows = await this.dataSource.getRepository(LoginTimeWindowOrmEntity).find({
      order: { startTime: 'ASC' },
    });
    return windows.map(mapWindow);
  }
}

@Injectable()
export class CreateLoginTimeWindowUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(dto: UpsertLoginTimeWindowDto): Promise<LoginTimeWindowResponseDto> {
    const repository = this.dataSource.getRepository(LoginTimeWindowOrmEntity);
    const window = repository.create({
      name: dto.name,
      startTime: dto.startTime,
      endTime: dto.endTime,
      isActive: dto.isActive ?? true,
    });
    return mapWindow(await repository.save(window));
  }
}

@Injectable()
export class UpdateLoginTimeWindowUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(id: string, dto: UpsertLoginTimeWindowDto): Promise<LoginTimeWindowResponseDto> {
    const repository = this.dataSource.getRepository(LoginTimeWindowOrmEntity);
    const window = await repository.findOneBy({ id });
    if (!window) {
      throw new NotFoundException('Không tìm thấy khung giờ đăng nhập');
    }

    window.name = dto.name;
    window.startTime = dto.startTime;
    window.endTime = dto.endTime;
    window.isActive = dto.isActive ?? window.isActive;
    return mapWindow(await repository.save(window));
  }
}

@Injectable()
export class ToggleLoginTimeWindowUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(id: string, isActive: boolean): Promise<LoginTimeWindowResponseDto> {
    const repository = this.dataSource.getRepository(LoginTimeWindowOrmEntity);
    const window = await repository.findOneBy({ id });
    if (!window) {
      throw new NotFoundException('Không tìm thấy khung giờ đăng nhập');
    }

    window.isActive = isActive;
    return mapWindow(await repository.save(window));
  }
}

function mapWindow(window: LoginTimeWindowOrmEntity): LoginTimeWindowResponseDto {
  return {
    id: window.id,
    name: window.name,
    startTime: window.startTime,
    endTime: window.endTime,
    isActive: window.isActive,
  };
}
