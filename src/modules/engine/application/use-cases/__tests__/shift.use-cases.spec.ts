import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IShiftRepositoryToken } from '../../../domain/repositories/shift.repository.interface';
import { Shift } from '../../../domain/entities/shift.model';
import {
  ListShiftsUseCase,
  CreateShiftUseCase,
  UpdateShiftUseCase,
  ToggleShiftStatusUseCase,
} from '../shift.use-cases';

describe('ShiftUseCases', () => {
  let listShiftsUseCase: ListShiftsUseCase;
  let createShiftUseCase: CreateShiftUseCase;
  let updateShiftUseCase: UpdateShiftUseCase;
  let toggleShiftStatusUseCase: ToggleShiftStatusUseCase;

  const mockShifts: Shift[] = [
    new Shift('uuid-1', 'Ca sáng', '08:00', '12:00', true, new Date(), new Date()),
    new Shift('uuid-2', 'Ca chiều', '13:30', '17:30', true, new Date(), new Date()),
  ];

  const mockShiftRepository = {
    findAll: jest.fn().mockResolvedValue(mockShifts),
    findById: jest.fn().mockImplementation((id: string) => {
      const s = mockShifts.find((item) => item.id === id);
      return Promise.resolve(s || null);
    }),
    save: jest.fn().mockImplementation((s: Shift) => {
      return Promise.resolve(
        new Shift(
          s.id || 'new-uuid',
          s.name,
          s.startTime,
          s.endTime,
          s.isActive,
          new Date(),
          new Date(),
        ),
      );
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListShiftsUseCase,
        CreateShiftUseCase,
        UpdateShiftUseCase,
        ToggleShiftStatusUseCase,
        {
          provide: IShiftRepositoryToken,
          useValue: mockShiftRepository,
        },
      ],
    }).compile();

    listShiftsUseCase = module.get<ListShiftsUseCase>(ListShiftsUseCase);
    createShiftUseCase = module.get<CreateShiftUseCase>(CreateShiftUseCase);
    updateShiftUseCase = module.get<UpdateShiftUseCase>(UpdateShiftUseCase);
    toggleShiftStatusUseCase = module.get<ToggleShiftStatusUseCase>(ToggleShiftStatusUseCase);
    
    jest.clearAllMocks();
  });

  describe('ListShiftsUseCase', () => {
    it('should return all shifts', async () => {
      const result = await listShiftsUseCase.execute();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Ca sáng');
      expect(mockShiftRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('CreateShiftUseCase', () => {
    it('should create a shift successfully', async () => {
      const dto = { name: 'Ca tối', startTime: '18:00', endTime: '21:00' };
      const result = await createShiftUseCase.execute(dto);
      expect(result.id).toBe('new-uuid');
      expect(result.name).toBe('Ca tối');
      expect(mockShiftRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if startTime >= endTime', async () => {
      const dto = { name: 'Ca tối', startTime: '21:00', endTime: '18:00' };
      await expect(createShiftUseCase.execute(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('UpdateShiftUseCase', () => {
    it('should update a shift successfully', async () => {
      const dto = { name: 'Ca sáng cập nhật', startTime: '07:30' };
      const result = await updateShiftUseCase.execute('uuid-1', dto);
      expect(result.name).toBe('Ca sáng cập nhật');
      expect(result.startTime).toBe('07:30');
      expect(result.endTime).toBe('12:00'); // remains unchanged
    });

    it('should throw NotFoundException if shift does not exist', async () => {
      await expect(
        updateShiftUseCase.execute('invalid-id', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if new startTime >= endTime', async () => {
      const dto = { startTime: '13:00' }; // current endTime is 12:00 for uuid-1
      await expect(updateShiftUseCase.execute('uuid-1', dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('ToggleShiftStatusUseCase', () => {
    it('should toggle status successfully', async () => {
      const result = await toggleShiftStatusUseCase.execute('uuid-1', false);
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException if shift does not exist', async () => {
      await expect(toggleShiftStatusUseCase.execute('invalid-id', false)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
