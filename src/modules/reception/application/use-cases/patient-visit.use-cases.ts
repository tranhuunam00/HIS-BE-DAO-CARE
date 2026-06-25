import { Inject, Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { PatientVisit } from '../../domain/entities/patient-visit.model';
import type { IPatientVisitRepository } from '../../domain/repositories/patient-visit.repository.interface';
import type { IAppointmentRepository } from '../../domain/repositories/appointment.repository.interface';
import { StaffAttendanceOrmEntity } from '../../../engine/infrastructure/database/staff-attendance.entity';
import { StaffAssignmentOrmEntity } from '../../../org/infrastructure/database/staff-assignment.entity';
import { RoomOrmEntity } from '../../../org/infrastructure/database/room.entity';
import { CheckInDto, UpdateVitalSignsDto, TransferRoomDto, PatientVisitResponseDto } from '../dtos/patient-visit.dto';
import type { IOrderRepository } from '../../../billing/domain/repositories/order.repository.interface';
import { IOrderRepositoryToken } from '../../../billing/application/use-cases/list-orders.use-case';

export const IPatientVisitRepositoryToken = 'IPatientVisitRepository';
export const IAppointmentRepositoryToken = 'IAppointmentRepository';

export function mapVisitToDto(model: PatientVisit): PatientVisitResponseDto {
  let diagnosis: string | undefined = undefined;
  let advice: string | undefined = undefined;
  let prescriptions: any[] | undefined = undefined;

  if (model.status === 'COMPLETED') {
    const reasonLower = (model.reason || '').toLowerCase();
    if (reasonLower.includes('dạ dày') || reasonLower.includes('bụng') || reasonLower.includes('tiêu hóa')) {
      diagnosis = 'Viêm loét dạ dày - tá tràng (K29.9)';
      advice = 'Ăn đúng giờ, tránh ăn đồ cay nóng, chua, nhiều dầu mỡ. Không uống rượu bia, cà phê. Tránh căng thẳng, làm việc quá sức. Uống thuốc đúng liều lượng chỉ định và tái khám nếu có triệu chứng bất thường.';
      prescriptions = [
        { name: 'Nexium Mups 40mg (Esomeprazole)', instruction: 'Uống 1 viên vào buổi sáng trước khi ăn 30 phút', quantity: '30 viên' },
        { name: 'Gaviscon Dual Action (Hỗn dịch)', instruction: 'Uống 1 gói sau các bữa ăn 1 tiếng và trước khi đi ngủ', quantity: '30 gói' },
        { name: 'Phosphalugel (Keo kháng acid)', instruction: 'Uống 1 gói khi xuất hiện cơn đau dạ dày cấp', quantity: '10 gói' }
      ];
    } else if (reasonLower.includes('ho') || reasonLower.includes('sốt') || reasonLower.includes('họng') || reasonLower.includes('phế quản')) {
      diagnosis = 'Viêm phế quản cấp (J20.9)';
      advice = 'Giữ ấm cổ và vùng ngực. Cho người bệnh uống nhiều nước ấm, nghỉ ngơi đầy đủ. Vệ sinh mũi họng hằng ngày bằng nước muối sinh lý. Theo dõi nhiệt độ sát sao, uống hạ sốt nếu sốt trên 38.5 độ.';
      prescriptions = [
        { name: 'Augmentin 1g (Amoxicillin/Clavulanate)', instruction: 'Uống 1 viên x 2 lần/ngày sau khi ăn no', quantity: '14 viên' },
        { name: 'Hapacol 650 (Paracetamol)', instruction: 'Uống 1 viên khi sốt trên 38.5 độ C (cách tối thiểu 4-6 tiếng)', quantity: '10 viên' },
        { name: 'Prospan (Siro ho thảo dược)', instruction: 'Uống 5ml x 3 lần/ngày', quantity: '1 chai 100ml' }
      ];
    } else {
      diagnosis = 'Rối loạn Lipid máu (E78.5) & Tăng huyết áp vô căn (I10)';
      advice = 'Hạn chế ăn mặn, thức ăn nhiều mỡ, da động vật, đồ ngọt. Tăng cường rau quả xanh và cá trong thực đơn. Đi bộ nhẹ nhàng hoặc tập thể dục 30 phút mỗi ngày. Tái khám sau 1 tháng.';
      prescriptions = [
        { name: 'Lipitor 20mg (Atorvastatin)', instruction: 'Uống 1 viên vào buổi tối sau khi ăn xong', quantity: '30 viên' },
        { name: 'Concor 5mg (Bisoprolol)', instruction: 'Uống 1/2 viên vào buổi sáng lúc 08h00 trước hoặc sau ăn', quantity: '15 viên' }
      ];
    }
  }

  return {
    id: model.id,
    visitCode: model.visitCode,
    patientId: model.patientId,
    patient: model.patient,
    branchId: model.branchId,
    branch: model.branch,
    appointmentId: model.appointmentId,
    currentRoomId: model.currentRoomId,
    currentRoom: model.currentRoom,
    currentDoctorId: model.currentDoctorId,
    currentDoctor: model.currentDoctor,
    currentNurseId: model.currentNurseId,
    currentNurse: model.currentNurse,
    queueNumber: model.queueNumber,
    priorityLevel: model.priorityLevel,
    queueCode: model.queueCode,
    status: model.status,
    reason: model.reason,
    pulse: model.pulse,
    bloodPressure: model.bloodPressure,
    temperature: model.temperature,
    weight: model.weight,
    height: model.height,
    diagnosis,
    advice,
    prescriptions,
    createdAt: model.createdAt!,
    updatedAt: model.updatedAt!,
  };
}

@Injectable()
export class ListPatientVisitsUseCase {
  constructor(
    @Inject(IPatientVisitRepositoryToken)
    private readonly repository: IPatientVisitRepository,
  ) {}

  async execute(filters: {
    branchId?: string;
    roomId?: string;
    status?: string;
    date?: string;
    doctorId?: string;
    serviceId?: string;
    patientId?: string;
  }): Promise<PatientVisitResponseDto[]> {
    const list = await this.repository.findAll(filters);
    return list.map(this.mapToDto);
  }

  private mapToDto(model: PatientVisit): PatientVisitResponseDto {
    return mapVisitToDto(model);
  }
}

@Injectable()
export class GetPatientVisitUseCase {
  constructor(
    @Inject(IPatientVisitRepositoryToken)
    private readonly repository: IPatientVisitRepository,
  ) {}

  async execute(id: string): Promise<PatientVisitResponseDto> {
    const visit = await this.repository.findById(id);
    if (!visit) {
      throw new NotFoundException('Không tìm thấy lượt khám bệnh nhân');
    }
    return this.mapToDto(visit);
  }

  private mapToDto(model: PatientVisit): PatientVisitResponseDto {
    return mapVisitToDto(model);
  }
}

@Injectable()
export class CheckInUseCase {
  constructor(
    @Inject(IPatientVisitRepositoryToken)
    private readonly visitRepository: IPatientVisitRepository,
    @Inject(IAppointmentRepositoryToken)
    private readonly appointmentRepository: IAppointmentRepository,
    @InjectRepository(StaffAttendanceOrmEntity)
    private readonly attendanceRepository: Repository<StaffAttendanceOrmEntity>,
    @InjectRepository(StaffAssignmentOrmEntity)
    private readonly staffAssignmentRepository: Repository<StaffAssignmentOrmEntity>,
  ) {}

  private async validateRoomAndDoctor(
    branchId: string,
    roomId?: string,
    doctorId?: string,
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    if (doctorId) {
      const docAttendance = await this.attendanceRepository.findOne({
        where: {
          staffId: doctorId,
          branchId,
          date: today,
          status: 'CHECKED_IN',
        },
        relations: { staff: true },
      });
      if (!docAttendance || !docAttendance.staff || docAttendance.staff.title !== 'DOCTOR') {
        throw new BadRequestException('Bác sĩ yêu cầu không có lịch trực hoặc chưa check-in hôm nay tại chi nhánh này');
      }
      if (docAttendance.isAcceptingPatients === false) {
        throw new BadRequestException('Bác sĩ yêu cầu hiện không nhận thêm bệnh nhân mới');
      }
    }

    if (roomId) {
      const assignments = await this.staffAssignmentRepository.find({
        where: { roomId, branchId },
      });
      const staffIds = assignments.map((a) => a.staffId);

      if (staffIds.length === 0) {
        throw new BadRequestException('Phòng khám này hiện chưa được phân công nhân sự nào');
      }

      const activeAttendances = await this.attendanceRepository.find({
        where: {
          staffId: In(staffIds),
          branchId,
          date: today,
          status: 'CHECKED_IN',
        },
        relations: { staff: true },
      });

      const activeDoctors = activeAttendances.filter(
        (a) => a.staff && a.staff.title === 'DOCTOR',
      );

      if (activeDoctors.length === 0) {
        throw new BadRequestException('Phòng khám được chọn hiện không có bác sĩ nào đang hoạt động (chưa check-in hoặc đã check-out)');
      }

      const acceptingDoctors = activeDoctors.filter(
        (a) => a.isAcceptingPatients !== false,
      );

      if (acceptingDoctors.length === 0) {
        throw new BadRequestException('Phòng khám này hiện đã dừng nhận bệnh nhân mới (Bác sĩ đã bật cờ ngưng nhận bệnh)');
      }
    }
  }

  async execute(dto: CheckInDto): Promise<PatientVisitResponseDto> {
    const today = new Date().toISOString().split('T')[0];

    // 0. Validate Room and Doctor checked-in status
    if (dto.currentRoomId || dto.currentDoctorId) {
      await this.validateRoomAndDoctor(dto.branchId, dto.currentRoomId, dto.currentDoctorId);
    }

    // 1. Get next sequential Queue Number for this branch today
    const queueNumber = await this.visitRepository.getNextQueueNumber(dto.branchId, today);
    const priorityLevel = dto.priorityLevel || 'REGULAR';
    const queueCode = await this.visitRepository.getNextQueueCode(dto.branchId, today, priorityLevel);

    // 2. Generate visit code
    const count = await this.visitRepository.countAll();
    const dateStr = today.replace(/-/g, '').slice(2);
    const nextSeq = (count + 1).toString().padStart(4, '0');
    const visitCode = `LK${dateStr}-${nextSeq}`;

    // 3. If checking in a pre-booked appointment, update its status
    if (dto.appointmentId) {
      const appointment = await this.appointmentRepository.findById(dto.appointmentId);
      if (appointment) {
        await this.appointmentRepository.save({
          ...appointment,
          status: 'CHECKED_IN',
        });
      }
    }

    // 4. Create new visit
    const newVisit = await this.visitRepository.save({
      visitCode,
      patientId: dto.patientId,
      branchId: dto.branchId,
      appointmentId: dto.appointmentId || null,
      currentRoomId: dto.currentRoomId || null,
      currentDoctorId: dto.currentDoctorId || null,
      currentNurseId: null,
      queueNumber,
      priorityLevel,
      queueCode,
      status: 'ADMITTED',
      reason: dto.reason || null,
      pulse: dto.pulse || null,
      bloodPressure: dto.bloodPressure || null,
      temperature: dto.temperature || null,
      weight: dto.weight || null,
      height: dto.height || null,
    });

    return this.mapToDto(newVisit);
  }

  private mapToDto(model: PatientVisit): PatientVisitResponseDto {
    return {
      id: model.id,
      visitCode: model.visitCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      branch: model.branch,
      appointmentId: model.appointmentId,
      currentRoomId: model.currentRoomId,
      currentRoom: model.currentRoom,
      currentDoctorId: model.currentDoctorId,
      currentDoctor: model.currentDoctor,
      currentNurseId: model.currentNurseId,
      currentNurse: model.currentNurse,
      queueNumber: model.queueNumber,
      priorityLevel: model.priorityLevel,
      queueCode: model.queueCode,
      status: model.status,
      reason: model.reason,
      pulse: model.pulse,
      bloodPressure: model.bloodPressure,
      temperature: model.temperature,
      weight: model.weight,
      height: model.height,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class UpdateVitalSignsUseCase {
  constructor(
    @Inject(IPatientVisitRepositoryToken)
    private readonly repository: IPatientVisitRepository,
  ) {}

  async execute(id: string, dto: UpdateVitalSignsDto): Promise<PatientVisitResponseDto> {
    const visit = await this.repository.findById(id);
    if (!visit) {
      throw new NotFoundException('Không tìm thấy lượt khám bệnh nhân');
    }

    const updated = await this.repository.save({
      ...visit,
      ...dto,
    });

    return this.mapToDto(updated);
  }

  private mapToDto(model: PatientVisit): PatientVisitResponseDto {
    return {
      id: model.id,
      visitCode: model.visitCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      branch: model.branch,
      appointmentId: model.appointmentId,
      currentRoomId: model.currentRoomId,
      currentRoom: model.currentRoom,
      currentDoctorId: model.currentDoctorId,
      currentDoctor: model.currentDoctor,
      currentNurseId: model.currentNurseId,
      currentNurse: model.currentNurse,
      queueNumber: model.queueNumber,
      priorityLevel: model.priorityLevel,
      queueCode: model.queueCode,
      status: model.status,
      reason: model.reason,
      pulse: model.pulse,
      bloodPressure: model.bloodPressure,
      temperature: model.temperature,
      weight: model.weight,
      height: model.height,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class TransferRoomUseCase {
  constructor(
    @Inject(IPatientVisitRepositoryToken)
    private readonly repository: IPatientVisitRepository,
    @InjectRepository(StaffAttendanceOrmEntity)
    private readonly attendanceRepository: Repository<StaffAttendanceOrmEntity>,
    @InjectRepository(StaffAssignmentOrmEntity)
    private readonly staffAssignmentRepository: Repository<StaffAssignmentOrmEntity>,
  ) {}

  private async validateRoomAndDoctor(
    branchId: string,
    roomId?: string,
    doctorId?: string,
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    if (doctorId) {
      const docAttendance = await this.attendanceRepository.findOne({
        where: {
          staffId: doctorId,
          branchId,
          date: today,
          status: 'CHECKED_IN',
        },
        relations: { staff: true },
      });
      if (!docAttendance || !docAttendance.staff || docAttendance.staff.title !== 'DOCTOR') {
        throw new BadRequestException('Bác sĩ yêu cầu không có lịch trực hoặc chưa check-in hôm nay tại chi nhánh này');
      }
      if (docAttendance.isAcceptingPatients === false) {
        throw new BadRequestException('Bác sĩ yêu cầu hiện không nhận thêm bệnh nhân mới');
      }
    }

    if (roomId) {
      const assignments = await this.staffAssignmentRepository.find({
        where: { roomId, branchId },
      });
      const staffIds = assignments.map((a) => a.staffId);

      if (staffIds.length === 0) {
        throw new BadRequestException('Phòng khám này hiện chưa được phân công nhân sự nào');
      }

      const activeAttendances = await this.attendanceRepository.find({
        where: {
          staffId: In(staffIds),
          branchId,
          date: today,
          status: 'CHECKED_IN',
        },
        relations: { staff: true },
      });

      const activeDoctors = activeAttendances.filter(
        (a) => a.staff && a.staff.title === 'DOCTOR',
      );

      if (activeDoctors.length === 0) {
        throw new BadRequestException('Phòng khám được chọn hiện không có bác sĩ nào đang hoạt động (chưa check-in hoặc đã check-out)');
      }

      const acceptingDoctors = activeDoctors.filter(
        (a) => a.isAcceptingPatients !== false,
      );

      if (acceptingDoctors.length === 0) {
        throw new BadRequestException('Phòng khám này hiện đã dừng nhận bệnh nhân mới (Bác sĩ đã bật cờ ngưng nhận bệnh)');
      }
    }
  }

  async execute(id: string, dto: TransferRoomDto): Promise<PatientVisitResponseDto> {
    const visit = await this.repository.findById(id);
    if (!visit) {
      throw new NotFoundException('Không tìm thấy lượt khám bệnh nhân');
    }

    // Validate Room and Doctor checked-in status
    if (dto.roomId || dto.doctorId) {
      await this.validateRoomAndDoctor(visit.branchId, dto.roomId, dto.doctorId);
    }

    const updated = await this.repository.save({
      ...visit,
      currentRoomId: dto.roomId,
      currentDoctorId: dto.doctorId || null,
      currentNurseId: dto.nurseId || null,
      status: dto.status || 'WAITING',
    });

    return this.mapToDto(updated);
  }

  private mapToDto(model: PatientVisit): PatientVisitResponseDto {
    return {
      id: model.id,
      visitCode: model.visitCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      branch: model.branch,
      appointmentId: model.appointmentId,
      currentRoomId: model.currentRoomId,
      currentRoom: model.currentRoom,
      currentDoctorId: model.currentDoctorId,
      currentDoctor: model.currentDoctor,
      currentNurseId: model.currentNurseId,
      currentNurse: model.currentNurse,
      queueNumber: model.queueNumber,
      priorityLevel: model.priorityLevel,
      queueCode: model.queueCode,
      status: model.status,
      reason: model.reason,
      pulse: model.pulse,
      bloodPressure: model.bloodPressure,
      temperature: model.temperature,
      weight: model.weight,
      height: model.height,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class ConfirmResultsWaitUseCase {
  constructor(
    @Inject(IPatientVisitRepositoryToken)
    private readonly repository: IPatientVisitRepository,
  ) {}

  async execute(id: string): Promise<PatientVisitResponseDto> {
    const visit = await this.repository.findById(id);
    if (!visit) {
      throw new NotFoundException('Không tìm thấy lượt khám bệnh nhân');
    }

    if (visit.status !== 'ALL_SERVICES_DONE') {
      throw new BadRequestException('Lượt khám chưa ở trạng thái hoàn thành tất cả dịch vụ (ALL_SERVICES_DONE)');
    }

    const updated = await this.repository.save({
      ...visit,
      status: 'WAITING_RESULTS',
    });

    return this.mapToDto(updated);
  }

  private mapToDto(model: PatientVisit): PatientVisitResponseDto {
    return {
      id: model.id,
      visitCode: model.visitCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      branch: model.branch,
      appointmentId: model.appointmentId,
      currentRoomId: model.currentRoomId,
      currentRoom: model.currentRoom,
      currentDoctorId: model.currentDoctorId,
      currentDoctor: model.currentDoctor,
      currentNurseId: model.currentNurseId,
      currentNurse: model.currentNurse,
      queueNumber: model.queueNumber,
      priorityLevel: model.priorityLevel,
      queueCode: model.queueCode,
      status: model.status,
      reason: model.reason,
      pulse: model.pulse,
      bloodPressure: model.bloodPressure,
      temperature: model.temperature,
      weight: model.weight,
      height: model.height,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class AcceptPatientUseCase {
  constructor(
    @Inject(IPatientVisitRepositoryToken)
    private readonly repository: IPatientVisitRepository,
  ) {}

  async execute(id: string, doctorId?: string): Promise<PatientVisitResponseDto> {
    const visit = await this.repository.findById(id);
    if (!visit) {
      throw new NotFoundException('Không tìm thấy lượt khám bệnh nhân');
    }

    let newStatus = visit.status;
    if (visit.status === 'WAITING_CLINICAL_EXAM') {
      newStatus = 'IN_CLINICAL_EXAM';
    } else if (visit.status === 'WAITING_CONCLUSION') {
      newStatus = 'IN_CONCLUSION';
    } else if (visit.status === 'WAITING_SERVICE') {
      newStatus = 'IN_SERVICE';
    } else {
      throw new BadRequestException(`Bệnh nhân đang ở trạng thái ${visit.status}, không thể tiếp nhận vào khám.`);
    }

    const updated = await this.repository.save({
      ...visit,
      status: newStatus,
      currentDoctorId: doctorId || visit.currentDoctorId,
    });

    return this.mapToDto(updated);
  }

  private mapToDto(model: PatientVisit): PatientVisitResponseDto {
    return {
      id: model.id,
      visitCode: model.visitCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      branch: model.branch,
      appointmentId: model.appointmentId,
      currentRoomId: model.currentRoomId,
      currentRoom: model.currentRoom,
      currentDoctorId: model.currentDoctorId,
      currentDoctor: model.currentDoctor,
      currentNurseId: model.currentNurseId,
      currentNurse: model.currentNurse,
      queueNumber: model.queueNumber,
      priorityLevel: model.priorityLevel,
      queueCode: model.queueCode,
      status: model.status,
      reason: model.reason,
      pulse: model.pulse,
      bloodPressure: model.bloodPressure,
      temperature: model.temperature,
      weight: model.weight,
      height: model.height,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

@Injectable()
export class CompletePatientUseCase {
  constructor(
    @Inject(IPatientVisitRepositoryToken)
    private readonly repository: IPatientVisitRepository,
    @Inject(IOrderRepositoryToken)
    private readonly orderRepository: IOrderRepository,
    @InjectRepository(RoomOrmEntity)
    private readonly roomRepository: Repository<RoomOrmEntity>,
  ) {}

  async execute(id: string): Promise<PatientVisitResponseDto> {
    const visit = await this.repository.findById(id);
    if (!visit) {
      throw new NotFoundException('Không tìm thấy lượt khám bệnh nhân');
    }

    let newStatus = visit.status;
    let nextRoomId = visit.currentRoomId;
    let nextDoctorId = visit.currentDoctorId;

    if (visit.status === 'IN_CLINICAL_EXAM') {
      // Check if they ordered any service items that are PENDING
      const order = await this.orderRepository.findByVisitId(id);
      const hasPendingItems = order && order.items && order.items.some(
        (item) => item.status === 'PENDING'
      );

      if (hasPendingItems) {
        newStatus = 'CLINICAL_EXAM_DONE';
        // Transfer to coordination/reception room
        const coordRoom = await this.roomRepository.findOne({
          where: [
            { branchId: visit.branchId, code: 'PK105' },
            { branchId: visit.branchId, type: 'CLINIC', name: Like('%Tiếp Đón%') },
            { branchId: visit.branchId, type: 'CLINIC', name: Like('%Lễ Tân%') },
            { branchId: visit.branchId, type: 'CLINIC', name: Like('%Điều phối%') }
          ]
        });
        if (coordRoom) {
          nextRoomId = coordRoom.id;
          nextDoctorId = null;
        }
      } else {
        newStatus = 'COMPLETED';
      }
    } else if (visit.status === 'IN_CONCLUSION') {
      newStatus = 'COMPLETED';
    } else {
      throw new BadRequestException(`Bệnh nhân đang ở trạng thái ${visit.status}, không thể kết thúc.`);
    }

    const updated = await this.repository.save({
      ...visit,
      status: newStatus,
      currentRoomId: nextRoomId,
      currentDoctorId: nextDoctorId,
    });

    return this.mapToDto(updated);
  }

  private mapToDto(model: PatientVisit): PatientVisitResponseDto {
    return {
      id: model.id,
      visitCode: model.visitCode,
      patientId: model.patientId,
      patient: model.patient,
      branchId: model.branchId,
      branch: model.branch,
      appointmentId: model.appointmentId,
      currentRoomId: model.currentRoomId,
      currentRoom: model.currentRoom,
      currentDoctorId: model.currentDoctorId,
      currentDoctor: model.currentDoctor,
      currentNurseId: model.currentNurseId,
      currentNurse: model.currentNurse,
      queueNumber: model.queueNumber,
      priorityLevel: model.priorityLevel,
      queueCode: model.queueCode,
      status: model.status,
      reason: model.reason,
      pulse: model.pulse,
      bloodPressure: model.bloodPressure,
      temperature: model.temperature,
      weight: model.weight,
      height: model.height,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt!,
    };
  }
}

