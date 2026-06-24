import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IStaffRepository } from '../../domain/repositories/staff.repository.interface';
import { Staff } from '../../domain/entities/staff.model';
import { PracticingCertificate } from '../../domain/entities/practicing-certificate.model';
import { StaffAssignment } from '../../domain/entities/staff-assignment.model';
import { StaffOrmEntity } from '../database/staff.entity';
import { PracticingCertificateOrmEntity } from '../database/practicing-certificate.entity';

@Injectable()
export class StaffRepository implements IStaffRepository {
  constructor(
    @InjectRepository(StaffOrmEntity)
    private readonly ormRepository: Repository<StaffOrmEntity>,
    @InjectRepository(PracticingCertificateOrmEntity)
    private readonly certOrmRepository: Repository<PracticingCertificateOrmEntity>
  ) {}

  async findAll(filters?: { branchId?: string; title?: string; isActive?: boolean; roomId?: string; specialtyId?: string }): Promise<Staff[]> {
    const query = this.ormRepository.createQueryBuilder('staff')
      .leftJoinAndSelect('staff.certificate', 'certificate')
      .leftJoinAndSelect('staff.assignments', 'assignments');

    if (filters?.branchId) {
      query.andWhere('assignments.branchId = :branchId', { branchId: filters.branchId });
    }
    if (filters?.title) {
      query.andWhere('staff.title = :title', { title: filters.title });
    }
    if (filters?.isActive !== undefined) {
      query.andWhere('staff.isActive = :isActive', { isActive: filters.isActive });
    }
    // Filter doctors assigned to a specific room via staff_assignments
    if (filters?.roomId) {
      query.andWhere('assignments.roomId = :roomId', { roomId: filters.roomId });
    }
    // Filter doctors assigned to a specific specialty via staff_assignments
    if (filters?.specialtyId) {
      query.andWhere('assignments.specialtyId = :specialtyId', { specialtyId: filters.specialtyId });
    }

    query.orderBy('staff.createdAt', 'ASC');
    const orms = await query.getMany();
    return orms.map((orm) => this.toDomain(orm));
  }

  async findById(id: string): Promise<Staff | null> {
    const orm = await this.ormRepository.findOne({
      where: { id },
      relations: { certificate: true, assignments: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCode(code: string): Promise<Staff | null> {
    const orm = await this.ormRepository.findOne({
      where: { staffCode: code },
      relations: { certificate: true, assignments: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByEmail(email: string): Promise<Staff | null> {
    const orm = await this.ormRepository.findOne({
      where: { email },
      relations: { certificate: true, assignments: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByIdentityNumber(identityNumber: string): Promise<Staff | null> {
    const orm = await this.ormRepository.findOne({
      where: { identityNumber },
      relations: { certificate: true, assignments: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async save(staff: Staff): Promise<Staff> {
    const orm = this.toOrm(staff);
    const saved = await this.ormRepository.save(orm);
    return this.findById(saved.id) as Promise<Staff>; // Re-fetch to get all relations mapped
  }

  async saveCertificate(certificate: PracticingCertificate): Promise<PracticingCertificate> {
    const orm = new PracticingCertificateOrmEntity();
    orm.id = certificate.id;
    orm.staffId = certificate.staffId;
    orm.certificateNumber = certificate.certificateNumber;
    orm.issuedDate = certificate.issuedDate;
    orm.expiryDate = certificate.expiryDate;
    orm.issuedBy = certificate.issuedBy;
    orm.scopeOfPractice = certificate.scopeOfPractice;
    orm.signatureScanUrl = certificate.signatureScanUrl;
    if (certificate.createdAt) orm.createdAt = certificate.createdAt;
    if (certificate.updatedAt) orm.updatedAt = certificate.updatedAt;

    const saved = await this.certOrmRepository.save(orm);
    return new PracticingCertificate(
      saved.id,
      saved.staffId,
      saved.certificateNumber,
      saved.issuedDate,
      saved.expiryDate,
      saved.issuedBy,
      saved.scopeOfPractice,
      saved.signatureScanUrl,
      saved.createdAt,
      saved.updatedAt
    );
  }

  private toDomain(orm: StaffOrmEntity): Staff {
    const certificate = orm.certificate
      ? new PracticingCertificate(
          orm.certificate.id,
          orm.certificate.staffId,
          orm.certificate.certificateNumber,
          new Date(orm.certificate.issuedDate),
          orm.certificate.expiryDate ? new Date(orm.certificate.expiryDate) : null,
          orm.certificate.issuedBy,
          orm.certificate.scopeOfPractice,
          orm.certificate.signatureScanUrl,
          orm.certificate.createdAt,
          orm.certificate.updatedAt
        )
      : null;

    const assignments = orm.assignments
      ? orm.assignments.map(
          (a) =>
            new StaffAssignment(
              a.id,
              a.staffId,
              a.branchId,
              a.specialtyId,
              a.roomId,
              a.isPrimary,
              a.createdAt,
              a.updatedAt
            )
        )
      : [];

    return new Staff(
      orm.id,
      orm.fullName,
      new Date(orm.dateOfBirth),
      orm.gender,
      orm.identityNumber,
      orm.phone,
      orm.email,
      orm.address,
      orm.staffCode,
      new Date(orm.joinDate),
      orm.title,
      orm.isClinical,
      orm.isActive,
      orm.userId,
      orm.nickname,
      orm.departmentId,
      orm.createdAt,
      orm.updatedAt,
      certificate,
      assignments
    );
  }

  private toOrm(domain: Staff): StaffOrmEntity {
    const orm = new StaffOrmEntity();
    orm.id = domain.id;
    orm.fullName = domain.fullName;
    orm.dateOfBirth = domain.dateOfBirth;
    orm.gender = domain.gender;
    orm.identityNumber = domain.identityNumber;
    orm.phone = domain.phone;
    orm.email = domain.email;
    orm.address = domain.address;
    orm.staffCode = domain.staffCode;
    orm.joinDate = domain.joinDate;
    orm.title = domain.title;
    orm.isClinical = domain.isClinical;
    orm.isActive = domain.isActive;
    orm.userId = domain.userId;
    orm.nickname = domain.nickname;
    orm.departmentId = domain.departmentId;
    if (domain.createdAt) orm.createdAt = domain.createdAt;
    if (domain.updatedAt) orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
