import { AppDataSource } from '../data-source';
import { PermissionOrmEntity } from '../../../modules/auth/infrastructure/database/permission.entity';
import { RoleOrmEntity } from '../../../modules/auth/infrastructure/database/role.entity';
import { UserOrmEntity } from '../../../modules/auth/infrastructure/database/user.entity';
import { LoginTimeWindowOrmEntity } from '../../../modules/auth/infrastructure/database/login-time-window.entity';
import { UserBranchScopeOrmEntity } from '../../../modules/auth/infrastructure/database/user-branch-scope.entity';
import { OrganizationOrmEntity } from '../../../modules/org/infrastructure/database/organization.entity';
import { BranchOrmEntity } from '../../../modules/org/infrastructure/database/branch.entity';
import { RoomOrmEntity } from '../../../modules/org/infrastructure/database/room.entity';
import { ResourceOrmEntity } from '../../../modules/org/infrastructure/database/resource.entity';
import { StaffOrmEntity } from '../../../modules/org/infrastructure/database/staff.entity';
import { PracticingCertificateOrmEntity } from '../../../modules/org/infrastructure/database/practicing-certificate.entity';
import { StaffAssignmentOrmEntity } from '../../../modules/org/infrastructure/database/staff-assignment.entity';
import { SpecialtyOrmEntity } from '../../../modules/medical/infrastructure/database/specialty.entity';
import { ServiceOrmEntity } from '../../../modules/medical/infrastructure/database/service.entity';
import { ServicePriceOrmEntity } from '../../../modules/medical/infrastructure/database/service-price.entity';
import { Icd10OrmEntity } from '../../../modules/medical/infrastructure/database/icd10.entity';
import { MedicationOrmEntity } from '../../../modules/medical/infrastructure/database/medication.entity';
import { ShiftOrmEntity } from '../../../modules/engine/infrastructure/database/shift.entity';
import { StaffScheduleTemplateOrmEntity } from '../../../modules/engine/infrastructure/database/staff-schedule-template.entity';
import { FormTemplateOrmEntity } from '../../../modules/forms/infrastructure/database/form-template.entity';
import { PatientOrmEntity } from '../../../modules/reception/infrastructure/database/patient.entity';
import { AppointmentOrmEntity } from '../../../modules/reception/infrastructure/database/appointment.entity';
import { PatientVisitOrmEntity } from '../../../modules/reception/infrastructure/database/patient-visit.entity';
import {
  AUTH_ROLE_NAME,
  BranchScopeMode,
  PATIENT_ROLE_DESCRIPTION,
  PATIENT_ROLE_NAME,
  PASSWORD_HASH_ROUNDS,
} from '../../../modules/auth/domain/constants/auth.constants';
import {
  APPOINTMENT_STATUS,
  BRANCH_TYPE,
  FORM_TEMPLATE_CATEGORY,
  FORM_TEMPLATE_TYPE,
  MEDICATION_ROUTE,
  PATIENT_GENDER,
  PATIENT_VISIT_STATUS,
  ROOM_TYPE,
  SERVICE_CATEGORY,
  SERVICE_PRICE_TYPE,
  STAFF_TITLE,
} from '../../../common/constants/workflow.constants';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('ðŸŒ± Starting database seeding...');
  await AppDataSource.initialize();

  const permissionRepository = AppDataSource.getRepository(PermissionOrmEntity);
  const roleRepository = AppDataSource.getRepository(RoleOrmEntity);
  const userRepository = AppDataSource.getRepository(UserOrmEntity);
  const loginTimeWindowRepository = AppDataSource.getRepository(LoginTimeWindowOrmEntity);
  const userBranchScopeRepository = AppDataSource.getRepository(UserBranchScopeOrmEntity);
  const orgRepository = AppDataSource.getRepository(OrganizationOrmEntity);
  const branchRepository = AppDataSource.getRepository(BranchOrmEntity);
  const roomRepository = AppDataSource.getRepository(RoomOrmEntity);
  const resourceRepository = AppDataSource.getRepository(ResourceOrmEntity);
  const staffRepository = AppDataSource.getRepository(StaffOrmEntity);
  const certRepository = AppDataSource.getRepository(PracticingCertificateOrmEntity);
  const assignmentRepository = AppDataSource.getRepository(StaffAssignmentOrmEntity);
  const specialtyRepository = AppDataSource.getRepository(SpecialtyOrmEntity);
  const serviceRepository = AppDataSource.getRepository(ServiceOrmEntity);
  const servicePriceRepository = AppDataSource.getRepository(ServicePriceOrmEntity);
  const icd10Repository = AppDataSource.getRepository(Icd10OrmEntity);
  const medicationRepository = AppDataSource.getRepository(MedicationOrmEntity);
  const shiftRepository = AppDataSource.getRepository(ShiftOrmEntity);
  const templateRepository = AppDataSource.getRepository(StaffScheduleTemplateOrmEntity);
  const patientRepository = AppDataSource.getRepository(PatientOrmEntity);
  const appointmentRepository = AppDataSource.getRepository(AppointmentOrmEntity);
  const visitRepository = AppDataSource.getRepository(PatientVisitOrmEntity);


  // 1. Seed Permissions
  const permissionsList = [
    { name: 'org:read', description: 'Xem thÃ´ng tin tá»• chá»©c' },
    { name: 'org:write', description: 'Cáº¥u hÃ¬nh thÃ´ng tin tá»• chá»©c' },
    { name: 'branch:create', description: 'Táº¡o cÆ¡ sá»Ÿ/chi nhÃ¡nh' },
    { name: 'branch:update', description: 'Cáº­p nháº­t cÆ¡ sá»Ÿ/chi nhÃ¡nh' },
    { name: 'branch:read', description: 'Xem danh sÃ¡ch cÆ¡ sá»Ÿ/chi nhÃ¡nh' },
    { name: 'user:create', description: 'Táº¡o tÃ i khoáº£n ngÆ°á»i dÃ¹ng' },
    { name: 'user:update', description: 'Cáº­p nháº­t tÃ i khoáº£n ngÆ°á»i dÃ¹ng' },
    { name: 'user:read', description: 'Xem danh sÃ¡ch tÃ i khoáº£n' },
    { name: 'role:write', description: 'Quáº£n lÃ½ vai trÃ² vÃ  phÃ¢n quyá»n' },
    
    // Room Permissions
    { name: 'room:read', description: 'Xem danh sÃ¡ch/chi tiáº¿t phÃ²ng khÃ¡m' },
    { name: 'room:write', description: 'Táº¡o/Cáº­p nháº­t phÃ²ng khÃ¡m' },

    // Resource Permissions
    { name: 'resource:read', description: 'Xem danh sÃ¡ch/chi tiáº¿t tÃ i nguyÃªn phÃ²ng' },
    { name: 'resource:write', description: 'Táº¡o/Cáº­p nháº­t tÃ i nguyÃªn phÃ²ng' },

    // Staff Permissions
    { name: 'staff:read', description: 'Xem danh sÃ¡ch/chi tiáº¿t nhÃ¢n sá»±' },
    { name: 'staff:write', description: 'Táº¡o/Cáº­p nháº­t nhÃ¢n sá»±' },

    // Medical - Specialty Permissions
    { name: 'specialty:read', description: 'Xem danh má»¥c chuyÃªn khoa' },
    { name: 'specialty:write', description: 'Quáº£n lÃ½ danh má»¥c chuyÃªn khoa' },

    // Medical - Service Permissions
    { name: 'service:read', description: 'Xem danh má»¥c dá»‹ch vá»¥ y táº¿' },
    { name: 'service:write', description: 'Quáº£n lÃ½ danh má»¥c dá»‹ch vá»¥ y táº¿' },

    // Medical - ICD-10 Permissions
    { name: 'icd10:read', description: 'Xem danh má»¥c ICD-10' },
    { name: 'icd10:write', description: 'Quáº£n lÃ½ danh má»¥c ICD-10' },

    // Medical - Medication Permissions
    { name: 'medication:read', description: 'Xem danh má»¥c thuá»‘c' },
    { name: 'medication:write', description: 'Quáº£n lÃ½ danh má»¥c thuá»‘c' },

    // Schedule Permissions
    { name: 'schedule:read', description: 'Xem lá»‹ch lÃ m viá»‡c nhÃ¢n viÃªn' },
    { name: 'schedule:update', description: 'Cáº­p nháº­t lá»‹ch lÃ m viá»‡c tuáº§n (Template)' },
    { name: 'schedule:update-daily', description: 'Äiá»u chá»‰nh lá»‹ch lÃ m viá»‡c ngÃ y (Override)' },
  ];

  const dbPermissions: PermissionOrmEntity[] = [];
  for (const p of permissionsList) {
    let perm = await permissionRepository.findOneBy({ name: p.name });
    if (!perm) {
      perm = permissionRepository.create(p);
      perm = await permissionRepository.save(perm);
      console.log(`+ Created Permission: ${p.name}`);
    }
    dbPermissions.push(perm);
  }

  // 2. Seed Roles
  const rolesList = [
    { name: AUTH_ROLE_NAME.ADMIN, description: 'Quáº£n trá»‹ viÃªn toÃ n há»‡ thá»‘ng' },
    { name: AUTH_ROLE_NAME.DOCTOR, description: 'BÃ¡c sÄ© lÃ¢m sÃ ng' },
    { name: AUTH_ROLE_NAME.RECEPTION, description: 'Lá»… tÃ¢n tiáº¿p Ä‘Ã³n' },
    { name: AUTH_ROLE_NAME.NURSE, description: 'Äiá»u dÆ°á»¡ng viÃªn' },
    { name: AUTH_ROLE_NAME.TECHNICIAN, description: 'Ká»¹ thuáº­t viÃªn' },
    { name: PATIENT_ROLE_NAME, description: PATIENT_ROLE_DESCRIPTION },
    { name: AUTH_ROLE_NAME.ACCOUNTANT, description: 'Káº¿ toÃ¡n / Thu ngÃ¢n phÃ²ng khÃ¡m' },
  ];

  const dbRoles: Record<string, RoleOrmEntity> = {};
  for (const r of rolesList) {
    let role = await roleRepository.findOne({
      where: { name: r.name },
      relations: { permissions: true },
    });

    if (!role) {
      role = roleRepository.create({
        name: r.name,
        description: r.description,
        permissions: [],
      });
    }

    // Assign all permissions to ADMIN
    if (r.name === AUTH_ROLE_NAME.ADMIN) {
      role.permissions = dbPermissions;
    } else if ([AUTH_ROLE_NAME.DOCTOR, AUTH_ROLE_NAME.NURSE, AUTH_ROLE_NAME.TECHNICIAN, AUTH_ROLE_NAME.RECEPTION, AUTH_ROLE_NAME.ACCOUNTANT].includes(r.name as any)) {
      role.permissions = dbPermissions.filter((p) =>
        ['org:read', 'branch:read', 'user:read', 'room:read', 'resource:read', 'staff:read', 'schedule:read'].includes(p.name)
      );
    } else if (r.name === PATIENT_ROLE_NAME) {
      role.permissions = dbPermissions.filter((p) =>
        ['branch:read', 'specialty:read', 'service:read', 'staff:read', 'org:read', 'org:write'].includes(p.name)
      );
    }

    role = await roleRepository.save(role);
    dbRoles[r.name] = role;
    console.log(`+ Processed Role: ${r.name}`);
  }

  // 3. Seed Default Admin User
  const adminEmail = 'admin@hisdaocare.com';
  let adminUser = await userRepository.findOneBy({ email: adminEmail });
  if (!adminUser) {
    const passwordHash = await bcrypt.hash('Admin@HIS2026!', PASSWORD_HASH_ROUNDS);
    adminUser = userRepository.create({
      email: adminEmail,
      username: 'admin',
      passwordHash: passwordHash,
      isActive: true,
      roleId: dbRoles[AUTH_ROLE_NAME.ADMIN].id,
      bypassIpRestriction: true,
      failedLoginCount: 0,
    });
    adminUser = await userRepository.save(adminUser);
    console.log(`+ Created default Admin User: ${adminEmail} / Admin@HIS2026!`);
  } else {
    console.log(`~ Admin user ${adminEmail} already exists.`);
  }

  // 4. Seed Default Organization
  const orgCode = 'DAO_CARE';
  let org = await orgRepository.findOneBy({ code: orgCode });
  if (!org) {
    org = orgRepository.create({
      name: 'Há»‡ thá»‘ng PhÃ²ng khÃ¡m DAO CARE',
      shortName: 'DAO CARE',
      code: orgCode,
      taxCode: '0102030405',
      legalRepresentative: 'Tráº§n Há»¯u Nam',
      hotline: '19001234',
      email: 'contact@daocare.vn',
      address: 'Sá»‘ 1 Äáº¡i Cá»“ Viá»‡t, Hai BÃ  TrÆ°ng, HÃ  Ná»™i',
    });
    org = await orgRepository.save(org);
    console.log(`+ Created default Organization: ${org.name}`);
  } else {
    console.log(`~ Organization ${orgCode} already exists.`);
  }

  // 5. Seed Default Branch
  const branchCode = 'CN_HBT_HN';
  let branch = await branchRepository.findOneBy({ code: branchCode });
  if (!branch) {
    branch = branchRepository.create({
      organizationId: org.id,
      name: 'CÆ¡ sá»Ÿ HÃ  Ná»™i - Hai BÃ  TrÆ°ng',
      code: branchCode,
      type: BRANCH_TYPE.CLINIC,
      technicalDirector: 'BS. Tráº§n Há»¯u Nam',
      hotline: '024777888',
      email: 'hbt@daocare.vn',
      province: 'HÃ  Ná»™i',
      district: 'Hai BÃ  TrÆ°ng',
      addressDetail: 'Sá»‘ 1 Äáº¡i Cá»“ Viá»‡t',
      googleMapUrl: 'https://maps.app.goo.gl/tW53Jk8pLgJ6e1nE8',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      openTime: '08:00',
      closeTime: '20:00',
    });
    branch = await branchRepository.save(branch);
    console.log(`+ Created default Branch: ${branch.name}`);
  } else {
    console.log(`~ Branch ${branchCode} already exists.`);
  }

  let defaultWindow = await loginTimeWindowRepository.findOneBy({ name: '6 AM - 9 PM' });
  if (!defaultWindow) {
    defaultWindow = loginTimeWindowRepository.create({
      name: '6 AM - 9 PM',
      startTime: '06:00',
      endTime: '21:00',
      isActive: true,
    });
    await loginTimeWindowRepository.save(defaultWindow);
    console.log('+ Created Login Time Window: 6 AM - 9 PM');
  }

  if (!adminUser.defaultBranchId) {
    adminUser.defaultBranchId = branch.id;
    adminUser.branchScopeMode = BranchScopeMode.ALL;
    adminUser.bypassIpRestriction = true;
    adminUser = await userRepository.save(adminUser);
  }

  const adminBranchScope = await userBranchScopeRepository.findOneBy({
    userId: adminUser.id,
    branchId: branch.id,
  });
  if (!adminBranchScope) {
    await userBranchScopeRepository.save(userBranchScopeRepository.create({
      userId: adminUser.id,
      branchId: branch.id,
    }));
    console.log('+ Created Admin Branch Scope');
  }


  // â”€â”€â”€ 6. Seed Shifts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const shiftsData = [
    { name: 'Ca sÃ¡ng', startTime: '07:30', endTime: '11:30' },
    { name: 'Ca chiá»u', startTime: '13:30', endTime: '17:30' },
    { name: 'Ca tá»‘i', startTime: '18:00', endTime: '21:00' },
    { name: 'Ca hÃ nh chÃ­nh', startTime: '08:00', endTime: '17:00' },
  ];

  const dbShifts: Record<string, ShiftOrmEntity> = {};
  for (const shiftData of shiftsData) {
    let shift = await shiftRepository.findOneBy({ name: shiftData.name });
    if (!shift) {
      shift = shiftRepository.create({
        ...shiftData,
        isActive: true,
      });
      shift = await shiftRepository.save(shift);
      console.log(`+ Created Shift: ${shift.name}`);
    } else {
      console.log(`~ Shift ${shiftData.name} already exists.`);
    }
    dbShifts[shiftData.name] = shift;
  }

  // â”€â”€â”€ 8. Seed Rooms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const roomsList = [
    { code: 'PK101', name: 'PhÃ²ng khÃ¡m Ná»™i 101', type: ROOM_TYPE.CLINIC, floor: 'Táº§ng 1' },
    { code: 'PK102', name: 'PhÃ²ng Cáº­n LÃ¢m SÃ ng SiÃªu Ã‚m', type: ROOM_TYPE.IMAGING, floor: 'Táº§ng 1' },
    { code: 'PK103', name: 'PhÃ²ng khÃ¡m Sáº£n Phá»¥ khoa 103', type: ROOM_TYPE.CLINIC, floor: 'Táº§ng 1' },
    { code: 'PK104', name: 'PhÃ²ng khÃ¡m Nhi 104', type: ROOM_TYPE.CLINIC, floor: 'Táº§ng 1' },
    { code: 'PK105', name: 'Quáº§y Lá»… TÃ¢n & Tiáº¿p ÄÃ³n', type: ROOM_TYPE.CLINIC, floor: 'Táº§ng 1' },
    { code: 'PK106', name: 'PhÃ²ng XÃ©t Nghiá»‡m Trung TÃ¢m', type: ROOM_TYPE.IMAGING, floor: 'Táº§ng 1' }
  ];

  const dbRooms: Record<string, RoomOrmEntity> = {};
  for (const r of roomsList) {
    let room = await roomRepository.findOneBy({ code: r.code });
    if (!room) {
      room = roomRepository.create({
        ...r,
        branchId: branch.id,
        isActive: true,
      });
      room = await roomRepository.save(room);
      console.log(`+ Created Room: ${room.name}`);
    } else {
      console.log(`~ Room ${r.code} already exists.`);
    }
    dbRooms[r.code] = room;
  }

  // â”€â”€â”€ 9. Seed Resources â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const resourcesList = [
    { code: 'G01', name: 'Gháº¿ khÃ¡m bá»‡nh Ä‘a nÄƒng 01', type: 'CHAIR', roomCode: 'PK101' },
    { code: 'G02', name: 'Gháº¿ khÃ¡m bá»‡nh Ä‘a nÄƒng 02', type: 'CHAIR', roomCode: 'PK101' },
    { code: 'TB01', name: 'MÃ¡y siÃªu Ã¢m 4D Mindray 01', type: 'EQUIPMENT', roomCode: 'PK102' },
    { code: 'G03', name: 'BÃ n khÃ¡m sáº£n chuyÃªn dá»¥ng', type: 'CHAIR', roomCode: 'PK103' },
    { code: 'G04', name: 'GiÆ°á»ng khÃ¡m nhi khoa hÃ¬nh thÃº', type: 'BED', roomCode: 'PK104' },
    { code: 'TB02', name: 'MÃ¡y phÃ¢n tÃ­ch huyáº¿t há»c tá»± Ä‘á»™ng', type: 'EQUIPMENT', roomCode: 'PK106' }
  ];

  for (const res of resourcesList) {
    let existing = await resourceRepository.findOneBy({ code: res.code });
    if (!existing) {
      const room = dbRooms[res.roomCode];
      if (room) {
        existing = resourceRepository.create({
          roomId: room.id,
          name: res.name,
          code: res.code,
          type: res.type,
          isActive: true,
        });
        await resourceRepository.save(existing);
        console.log(`+ Created Resource: ${existing.name}`);
      }
    }
  }

  // â”€â”€â”€ 10. Seed Staff & User accounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const passwordHash = await bcrypt.hash('Staff@HIS2026!', PASSWORD_HASH_ROUNDS);

  const staffDataList = [
    {
      staffCode: 'NV0001',
      fullName: 'BS. Tráº§n Há»¯u Nam',
      dateOfBirth: '1988-06-15',
      gender: PATIENT_GENDER.MALE,
      identityNumber: '037088123456',
      phone: '0988888999',
      email: 'namth@hisdaocare.com',
      address: 'Sá»‘ 1 Äáº¡i Cá»“ Viá»‡t, Hai BÃ  TrÆ°ng, HÃ  Ná»™i',
      joinDate: '2025-01-01',
      title: STAFF_TITLE.DOCTOR,
      nickname: 'BS Nam TH',
      roomCode: 'PK101',
      cert: {
        certificateNumber: '012345/BYT-CCHN',
        scopeOfPractice: 'KhÃ¡m bá»‡nh, chá»¯a bá»‡nh chuyÃªn khoa Ná»™i',
      },
      userEmail: 'admin@hisdaocare.com', // uses existing admin user
      useExistingAdmin: true,
      templateShifts: ['Ca sÃ¡ng', 'Ca chiá»u'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
      staffCode: 'NV0002',
      fullName: 'ThS.BS. Nguyá»…n Thá»‹ Mai',
      dateOfBirth: '1990-04-20',
      gender: PATIENT_GENDER.FEMALE,
      identityNumber: '037090222333',
      phone: '0987111222',
      email: 'maitn@hisdaocare.com',
      address: 'Giáº£i PhÃ³ng, Hai BÃ  TrÆ°ng, HÃ  Ná»™i',
      joinDate: '2025-03-01',
      title: STAFF_TITLE.DOCTOR,
      nickname: 'BS Mai NT',
      roomCode: 'PK103',
      cert: {
        certificateNumber: '034567/BYT-CCHN',
        scopeOfPractice: 'KhÃ¡m bá»‡nh, chá»¯a bá»‡nh chuyÃªn khoa Sáº£n phá»¥ khoa',
      },
      userEmail: 'maitn@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.DOCTOR,
      templateShifts: ['Ca sÃ¡ng', 'Ca chiá»u'],
      templateDays: ['Monday', 'Wednesday', 'Friday']
    },
    {
      staffCode: 'NV0003',
      fullName: 'BSCKI. LÃª HoÃ ng Long',
      dateOfBirth: '1985-09-12',
      gender: PATIENT_GENDER.MALE,
      identityNumber: '037085333444',
      phone: '0987333444',
      email: 'longlh@hisdaocare.com',
      address: 'LÃ² ÄÃºc, Hai BÃ  TrÆ°ng, HÃ  Ná»™i',
      joinDate: '2025-02-15',
      title: STAFF_TITLE.DOCTOR,
      nickname: 'BS Long LH',
      roomCode: 'PK104',
      cert: {
        certificateNumber: '056789/BYT-CCHN',
        scopeOfPractice: 'KhÃ¡m bá»‡nh, chá»¯a bá»‡nh chuyÃªn khoa Nhi',
      },
      userEmail: 'longlh@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.DOCTOR,
      templateShifts: ['Ca sÃ¡ng', 'Ca chiá»u'],
      templateDays: ['Tuesday', 'Thursday', 'Saturday']
    },
    {
      staffCode: 'NV0004',
      fullName: 'BS. Pháº¡m Minh Äá»©c',
      dateOfBirth: '1987-11-30',
      gender: PATIENT_GENDER.MALE,
      identityNumber: '037087444555',
      phone: '0987444555',
      email: 'duchm@hisdaocare.com',
      address: 'Tráº§n Äáº¡i NghÄ©a, Hai BÃ  TrÆ°ng, HÃ  Ná»™i',
      joinDate: '2025-05-01',
      title: STAFF_TITLE.DOCTOR,
      nickname: 'BS Äá»©c PM',
      roomCode: 'PK101',
      cert: {
        certificateNumber: '078901/BYT-CCHN',
        scopeOfPractice: 'KhÃ¡m bá»‡nh, chá»¯a bá»‡nh chuyÃªn khoa Ngoáº¡i',
      },
      userEmail: 'duchm@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.DOCTOR,
      templateShifts: ['Ca chiá»u', 'Ca tá»‘i'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
      staffCode: 'NV0005',
      fullName: 'BS. VÅ© Thá»‹ Há»“ng',
      dateOfBirth: '1992-02-05',
      gender: PATIENT_GENDER.FEMALE,
      identityNumber: '037092555666',
      phone: '0987555666',
      email: 'hongvt@hisdaocare.com',
      address: 'Báº¡ch Mai, Hai BÃ  TrÆ°ng, HÃ  Ná»™i',
      joinDate: '2025-06-01',
      title: STAFF_TITLE.DOCTOR,
      nickname: 'BS Há»“ng VT',
      roomCode: 'PK101',
      cert: {
        certificateNumber: '090123/BYT-CCHN',
        scopeOfPractice: 'KhÃ¡m bá»‡nh, chá»¯a bá»‡nh Ä‘a khoa',
      },
      userEmail: 'hongvt@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.DOCTOR,
      templateShifts: ['Ca sÃ¡ng', 'Ca chiá»u'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
      staffCode: 'NV0006',
      fullName: 'ÄD. Nguyá»…n VÄƒn Háº£i',
      dateOfBirth: '1995-08-18',
      gender: PATIENT_GENDER.MALE,
      identityNumber: '037095666777',
      phone: '0987666777',
      email: 'hainv@hisdaocare.com',
      address: 'Minh Khai, Hai BÃ  TrÆ°ng, HÃ  Ná»™i',
      joinDate: '2025-01-10',
      title: STAFF_TITLE.NURSE,
      roomCode: 'PK101',
      userEmail: 'hainv@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.NURSE,
      templateShifts: ['Ca hÃ nh chÃ­nh'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
      staffCode: 'NV0007',
      fullName: 'ÄD. Tráº§n Thá»‹ Thu',
      dateOfBirth: '1997-03-25',
      gender: PATIENT_GENDER.FEMALE,
      identityNumber: '037097777888',
      phone: '0987777888',
      email: 'thutt@hisdaocare.com',
      address: 'Kim NgÆ°u, Hai BÃ  TrÆ°ng, HÃ  Ná»™i',
      joinDate: '2025-03-15',
      title: STAFF_TITLE.NURSE,
      roomCode: 'PK103',
      userEmail: 'thutt@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.NURSE,
      templateShifts: ['Ca hÃ nh chÃ­nh'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
      staffCode: 'NV0008',
      fullName: 'KTV. LÃª Minh QuÃ¢n',
      dateOfBirth: '1993-07-30',
      gender: PATIENT_GENDER.MALE,
      identityNumber: '037093888999',
      phone: '0987888999',
      email: 'quanlm@hisdaocare.com',
      address: 'TrÆ°Æ¡ng Äá»‹nh, Hai BÃ  TrÆ°ng, HÃ  Ná»™i',
      joinDate: '2025-02-01',
      title: STAFF_TITLE.TECHNICIAN,
      roomCode: 'PK102',
      userEmail: 'quanlm@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.TECHNICIAN,
      templateShifts: ['Ca sÃ¡ng', 'Ca chiá»u'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    {
      staffCode: 'NV0009',
      fullName: 'KTV. HoÃ ng Thá»‹ Lan',
      dateOfBirth: '1996-05-15',
      gender: PATIENT_GENDER.FEMALE,
      identityNumber: '037096999000',
      phone: '0987999000',
      email: 'lanht@hisdaocare.com',
      address: 'Äáº¡i La, Hai BÃ  TrÆ°ng, HÃ  Ná»™i',
      joinDate: '2025-04-10',
      title: STAFF_TITLE.TECHNICIAN,
      roomCode: 'PK106',
      userEmail: 'lanht@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.TECHNICIAN,
      templateShifts: ['Ca hÃ nh chÃ­nh'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
      staffCode: 'NV0010',
      fullName: 'LT. Pháº¡m Ngá»c Ãnh',
      dateOfBirth: '1998-10-10',
      gender: PATIENT_GENDER.FEMALE,
      identityNumber: '037098000111',
      phone: '0987000111',
      email: 'anhpn@hisdaocare.com',
      address: 'TÆ°Æ¡ng Mai, HoÃ ng Mai, HÃ  Ná»™i',
      joinDate: '2025-01-05',
      title: STAFF_TITLE.RECEPTIONIST,
      roomCode: 'PK105',
      userEmail: 'anhpn@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.RECEPTION,
      templateShifts: ['Ca sÃ¡ng'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    {
      staffCode: 'NV0011',
      fullName: 'LT. Nguyá»…n ThÃ¹y Linh',
      dateOfBirth: '1999-12-12',
      gender: PATIENT_GENDER.FEMALE,
      identityNumber: '037099111222',
      phone: '0987111222',
      email: 'linhnt@hisdaocare.com',
      address: 'Mai Äá»™ng, HoÃ ng Mai, HÃ  Ná»™i',
      joinDate: '2025-02-20',
      title: STAFF_TITLE.RECEPTIONIST,
      roomCode: 'PK105',
      userEmail: 'linhnt@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.RECEPTION,
      templateShifts: ['Ca chiá»u'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
  ];

  for (const item of staffDataList) {
    const room = dbRooms[item.roomCode];

    // Find existing or create new Staff profile
    let staff = await staffRepository.findOneBy({ staffCode: item.staffCode });
    const staffFields = {
      fullName: item.fullName,
      dateOfBirth: new Date(item.dateOfBirth),
      gender: item.gender,
      identityNumber: item.identityNumber,
      phone: item.phone,
      email: item.email,
      address: item.address,
      staffCode: item.staffCode,
      joinDate: new Date(item.joinDate),
      title: item.title,
      isActive: true,
      nickname: item.nickname || null,
    };

    if (!staff) {
      staff = staffRepository.create(staffFields);
    } else {
      Object.assign(staff, staffFields);
    }
    staff = await staffRepository.save(staff);
    console.log(`+ Processed Staff profile: ${staff.fullName} (${staff.staffCode})`);

    // Assign User account
    let user = await userRepository.findOneBy({ email: item.userEmail });
    if (!user && !item.useExistingAdmin) {
      const username = item.userEmail.split('@')[0];
      const role = dbRoles[item.roleName || AUTH_ROLE_NAME.NURSE];
      user = userRepository.create({
        email: item.userEmail,
        username,
        passwordHash,
        isActive: true,
        roleId: role ? role.id : dbRoles[AUTH_ROLE_NAME.NURSE].id,
        bypassIpRestriction: false,
        failedLoginCount: 0,
        defaultBranchId: branch.id,
        branchScopeMode: BranchScopeMode.SPECIFIC,
      });
      user = await userRepository.save(user);

      // Create branch scope
      await userBranchScopeRepository.save(userBranchScopeRepository.create({
        userId: user.id,
        branchId: branch.id,
      }));
      console.log(`+ Created User Account for ${item.fullName}: ${item.userEmail}`);
    }

    if (user && staff.userId !== user.id) {
      staff.userId = user.id;
      staff = await staffRepository.save(staff);
    }

    // Seed Practicing Certificate if clinical doctor
    if (item.cert && item.title === STAFF_TITLE.DOCTOR) {
      let cert = await certRepository.findOneBy({ staffId: staff.id });
      if (!cert) {
        cert = certRepository.create({
          staffId: staff.id,
          certificateNumber: item.cert.certificateNumber,
          issuedDate: new Date('2020-01-01'),
          issuedBy: 'Bá»™ Y Táº¿',
          scopeOfPractice: item.cert.scopeOfPractice,
          signatureScanUrl: null,
        });
        await certRepository.save(cert);
        console.log(`+ Created Certificate for: ${staff.fullName}`);
      }
    }

    // Seed Branch & Room Assignments
    let assign = await assignmentRepository.findOneBy({ staffId: staff.id, branchId: branch.id });
    if (!assign) {
      assign = assignmentRepository.create({
        staffId: staff.id,
        branchId: branch.id,
        roomId: room ? room.id : null,
        isPrimary: true,
      });
      await assignmentRepository.save(assign);
      console.log(`+ Created Assignment for ${staff.fullName} to branch ${branch.name}`);
    } else if (room && assign.roomId !== room.id) {
      assign.roomId = room.id;
      await assignmentRepository.save(assign);
    }

    // Seed default weekly schedule templates
    const existingTemplates = await templateRepository.findBy({ staffId: staff.id });
    if (existingTemplates.length === 0) {
      const templatesToSave: StaffScheduleTemplateOrmEntity[] = [];
      for (const day of item.templateDays) {
        for (const shiftName of item.templateShifts) {
          const shift = dbShifts[shiftName];
          if (shift) {
            templatesToSave.push(
              templateRepository.create({
                staffId: staff.id,
                branchId: branch.id,
                dayOfWeek: day,
                shiftId: shift.id,
                effectiveDate: '2026-06-01',
              })
            );
          }
        }
      }
      if (templatesToSave.length > 0) {
        await templateRepository.save(templatesToSave);
        console.log(`+ Seeded weekly schedule templates for ${staff.fullName}`);
      }
    }
  }

  // â”€â”€â”€ 9. Seed Specialties â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const specialtiesList = [
    { code: 'NOI', name: 'Ná»™i khoa' },
    { code: 'NGOAI', name: 'Ngoáº¡i khoa' },
    { code: 'SAN', name: 'Sáº£n phá»¥ khoa' },
    { code: 'NHI', name: 'Nhi khoa' },
    { code: 'TMH', name: 'Tai MÅ©i Há»ng' },
    { code: 'RANGHAM', name: 'RÄƒng HÃ m Máº·t' },
    { code: 'TIMMACH', name: 'Tim máº¡ch' },
    { code: 'HOHAP', name: 'HÃ´ háº¥p' },
    { code: 'NOITIET', name: 'Ná»™i tiáº¿t' },
  ];

  const dbSpecialties: Record<string, SpecialtyOrmEntity> = {};
  for (const s of specialtiesList) {
    let sp = await specialtyRepository.findOneBy({ code: s.code });
    if (!sp) {
      sp = specialtyRepository.create({ ...s, isActive: true });
      sp = await specialtyRepository.save(sp);
      console.log(`+ Created Specialty: ${s.name}`);
    }
    dbSpecialties[s.code] = sp;
  }

  // â”€â”€â”€ 10. Seed Services â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const servicesList = [
    // --- KHÃM Bá»†NH ---
    { code: 'DV_KN_NOI', name: 'KhÃ¡m Ná»™i tá»•ng quÃ¡t', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NOI', duration: 20, insuranceCode: '01.105', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KN_TIMMACH', name: 'KhÃ¡m Tim máº¡ch', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'TIMMACH', duration: 30, insuranceCode: '01.201', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KN_NHI', name: 'KhÃ¡m Nhi khoa', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NHI', duration: 20, insuranceCode: '01.301', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KSK_TQ', name: 'KhÃ¡m sá»©c khá»e tá»•ng quÃ¡t', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NOI', duration: 30, insuranceCode: '01.001', listedPrice: 300000, insurancePrice: 220000, vipPrice: 450000 },
    { code: 'DV_KDK', name: 'KhÃ¡m Ä‘á»‹nh ká»³', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NOI', duration: 20, insuranceCode: '01.002', listedPrice: 150000, insurancePrice: 100000, vipPrice: 250000 },
    { code: 'DV_KN_NHI_TQ', name: 'KhÃ¡m nhi tá»•ng quÃ¡t', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NHI', duration: 20, insuranceCode: '01.302', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KTT_NHI', name: 'KhÃ¡m tÄƒng trÆ°á»Ÿng tráº» em', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NHI', duration: 30, insuranceCode: '01.303', listedPrice: 250000, insurancePrice: 180000, vipPrice: 400000 },
    { code: 'DV_KN_HOHAP', name: 'KhÃ¡m HÃ´ háº¥p', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'HOHAP', duration: 20, insuranceCode: '01.202', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KN_NOITIET', name: 'KhÃ¡m Ná»™i tiáº¿t', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NOITIET', duration: 20, insuranceCode: '01.203', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KN_NGOAI_TQ', name: 'KhÃ¡m Ngoáº¡i tá»•ng quÃ¡t', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NGOAI', duration: 20, insuranceCode: '01.106', listedPrice: 150000, insurancePrice: 100000, vipPrice: 250000 },
    { code: 'DV_KN_CHINH_HINH', name: 'KhÃ¡m Cháº¥n thÆ°Æ¡ng chá»‰nh hÃ¬nh', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NGOAI', duration: 20, insuranceCode: '01.107', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KN_TMH', name: 'KhÃ¡m Tai MÅ©i Há»ng', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'TMH', duration: 20, insuranceCode: '01.405', listedPrice: 150000, insurancePrice: 110000, vipPrice: 250000 },
    { code: 'DV_KN_NHA_TQ', name: 'KhÃ¡m nha tá»•ng quÃ¡t', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'RANGHAM', duration: 20, insuranceCode: '01.401', listedPrice: 100000, insurancePrice: 70000, vipPrice: 200000 },
    { code: 'DV_NHA_CHINH', name: 'Chá»‰nh nha', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'RANGHAM', duration: 40, insuranceCode: '01.402', listedPrice: 500000, insurancePrice: 400000, vipPrice: 800000 },
    { code: 'DV_NHA_IMPLANT', name: 'Cáº¥y ghÃ©p Implant', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'RANGHAM', duration: 60, insuranceCode: '01.403', listedPrice: 1500000, insurancePrice: 1200000, vipPrice: 2500000 },

    // --- XÃ‰T NGHIá»†M ---
    // Huyáº¿t há»c
    { code: 'DV_XN_CBC', name: 'Tá»•ng phÃ¢n tÃ­ch táº¿ bÃ o mÃ¡u ngoáº¡i vi - CBC', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.002', listedPrice: 80000, insurancePrice: 60000, vipPrice: 120000 },
    { code: 'DV_XN_DONGMAU', name: 'ÄÃ´ng mÃ¡u cÆ¡ báº£n PT/APTT/INR', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.003', listedPrice: 120000, insurancePrice: 90000, vipPrice: 180000 },
    // Sinh hÃ³a
    { code: 'DV_XN_GAN_AST', name: 'Äá»‹nh lÆ°á»£ng AST - SGOT', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.004', listedPrice: 50000, insurancePrice: 40000, vipPrice: 80000 },
    { code: 'DV_XN_GAN_ALT', name: 'Äá»‹nh lÆ°á»£ng ALT - SGPT', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.005', listedPrice: 50000, insurancePrice: 40000, vipPrice: 80000 },
    { code: 'DV_XN_GAN_GGT', name: 'Äá»‹nh lÆ°á»£ng GGT', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.006', listedPrice: 60000, insurancePrice: 45000, vipPrice: 90000 },
    { code: 'DV_XN_GAN_BILI', name: 'Äá»‹nh lÆ°á»£ng Bilirubin toÃ n pháº§n', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.007', listedPrice: 50000, insurancePrice: 38000, vipPrice: 80000 },
    { code: 'DV_XN_URE', name: 'Äá»‹nh lÆ°á»£ng Ure', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.008', listedPrice: 45000, insurancePrice: 35000, vipPrice: 70000 },
    { code: 'DV_XN_CREATININ', name: 'Äá»‹nh lÆ°á»£ng Creatinin', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.009', listedPrice: 45000, insurancePrice: 35000, vipPrice: 70000 },
    { code: 'DV_XN_EGFR', name: 'Äá»‹nh lÆ°á»£ng má»©c lá»c cáº§u tháº­n - eGFR', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.016', listedPrice: 50000, insurancePrice: 40000, vipPrice: 80000 },
    { code: 'DV_XN_GLUCOSE', name: 'Äá»‹nh lÆ°á»£ng Glucose mÃ¡u', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.010', listedPrice: 40000, insurancePrice: 30000, vipPrice: 60000 },
    { code: 'DV_XN_HBA1C', name: 'Äá»‹nh lÆ°á»£ng HbA1c', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.011', listedPrice: 150000, insurancePrice: 120000, vipPrice: 220000 },
    { code: 'DV_XN_CHOL', name: 'Äá»‹nh lÆ°á»£ng Cholesterol toÃ n pháº§n', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.012', listedPrice: 50000, insurancePrice: 40000, vipPrice: 80000 },
    { code: 'DV_XN_TRIGLY', name: 'Äá»‹nh lÆ°á»£ng Triglycerid', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.013', listedPrice: 50000, insurancePrice: 40000, vipPrice: 80000 },
    { code: 'DV_XN_HDL', name: 'Äá»‹nh lÆ°á»£ng HDL-Cholesterol', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.017', listedPrice: 60000, insurancePrice: 45000, vipPrice: 90000 },
    { code: 'DV_XN_LDL', name: 'Äá»‹nh lÆ°á»£ng LDL-Cholesterol', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.018', listedPrice: 60000, insurancePrice: 45000, vipPrice: 90000 },
    { code: 'DV_XN_URIC', name: 'Äá»‹nh lÆ°á»£ng Acid Uric', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.014', listedPrice: 50000, insurancePrice: 40000, vipPrice: 80000 },
    // Miá»…n dá»‹ch
    { code: 'DV_XN_CRP', name: 'Äá»‹nh lÆ°á»£ng CRP (C-Reactive Protein)', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.019', listedPrice: 120000, insurancePrice: 90000, vipPrice: 180000 },
    { code: 'DV_XN_PCT', name: 'Äá»‹nh lÆ°á»£ng Procalcitonin', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 10, insuranceCode: 'XN.020', listedPrice: 350000, insurancePrice: 280000, vipPrice: 500000 },
    { code: 'DV_XN_TSH', name: 'Äá»‹nh lÆ°á»£ng TSH', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 10, insuranceCode: 'XN.021', listedPrice: 100000, insurancePrice: 80000, vipPrice: 150000 },
    { code: 'DV_XN_FT3', name: 'Äá»‹nh lÆ°á»£ng FT3', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 10, insuranceCode: 'XN.022', listedPrice: 100000, insurancePrice: 80000, vipPrice: 150000 },
    { code: 'DV_XN_FT4', name: 'Äá»‹nh lÆ°á»£ng FT4', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 10, insuranceCode: 'XN.023', listedPrice: 100000, insurancePrice: 80000, vipPrice: 150000 },
    // NÆ°á»›c tiá»ƒu / Vi sinh
    { code: 'DV_XN_NUOCTIEU_10', name: 'Tá»•ng phÃ¢n tÃ­ch nÆ°á»›c tiá»ƒu 10 thÃ´ng sá»‘', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.015', listedPrice: 60000, insurancePrice: 45000, vipPrice: 90000 },
    { code: 'DV_XN_CAY_NUOCTIEU', name: 'Cáº¥y nÆ°á»›c tiá»ƒu tÃ¬m vi khuáº©n & KhÃ¡ng sinh Ä‘á»“', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 120, insuranceCode: 'XN.024', listedPrice: 250000, insurancePrice: 180000, vipPrice: 350000 },

    // --- CHáº¨N ÄOÃN HÃŒNH áº¢NH ---
    // X-quang
    { code: 'DV_XQ_NGUC', name: 'X-quang ngá»±c tháº³ng', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 10, insuranceCode: 'XQ.001', listedPrice: 120000, insurancePrice: 90000, vipPrice: 180000 },
    { code: 'DV_XQ_NGUC_NGHIENG', name: 'X-quang ngá»±c nghiÃªng', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 10, insuranceCode: 'XQ.004', listedPrice: 120000, insurancePrice: 90000, vipPrice: 180000 },
    { code: 'DV_XQ_COTSONG_CO', name: 'X-quang cá»™t sá»‘ng cá»•', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 10, insuranceCode: 'XQ.002', listedPrice: 140000, insurancePrice: 110000, vipPrice: 200000 },
    { code: 'DV_XQ_COTSONG_NGUC', name: 'X-quang cá»™t sá»‘ng ngá»±c', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 10, insuranceCode: 'XQ.005', listedPrice: 140000, insurancePrice: 110000, vipPrice: 200000 },
    { code: 'DV_XQ_COTSONG_TL', name: 'X-quang cá»™t sá»‘ng tháº¯t lÆ°ng', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 10, insuranceCode: 'XQ.003', listedPrice: 140000, insurancePrice: 110000, vipPrice: 200000 },
    { code: 'DV_XQ_COTAY', name: 'X-quang cá»• tay', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 10, insuranceCode: 'XQ.006', listedPrice: 120000, insurancePrice: 90000, vipPrice: 180000 },
    { code: 'DV_XQ_COCHAN', name: 'X-quang cá»• chÃ¢n', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 10, insuranceCode: 'XQ.007', listedPrice: 120000, insurancePrice: 90000, vipPrice: 180000 },
    { code: 'DV_XQ_PANO', name: 'X-quang rÄƒng Panorama (ToÃ n cáº£nh)', category: SERVICE_CATEGORY.IMAGING, specialty: 'RANGHAM', duration: 15, insuranceCode: 'XQ.008', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_XQ_CEPHALO', name: 'X-quang rÄƒng Cephalometric', category: SERVICE_CATEGORY.IMAGING, specialty: 'RANGHAM', duration: 15, insuranceCode: 'XQ.009', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_XQ_BITEWING', name: 'X-quang rÄƒng Bitewing (CÃ¡nh cáº¯n)', category: SERVICE_CATEGORY.IMAGING, specialty: 'RANGHAM', duration: 10, insuranceCode: 'XQ.010', listedPrice: 80000, insurancePrice: 60000, vipPrice: 120000 },
    { code: 'DV_XQ_PERIAPICAL', name: 'X-quang rÄƒng quanh chÃ³p (Periapical)', category: SERVICE_CATEGORY.IMAGING, specialty: 'RANGHAM', duration: 10, insuranceCode: 'XQ.011', listedPrice: 50000, insurancePrice: 35000, vipPrice: 80000 },
    // SiÃªu Ã¢m
    { code: 'DV_SIEAM_BNG', name: 'SiÃªu Ã¢m bá»¥ng tá»•ng quÃ¡t', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 20, insuranceCode: '35.01', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_SA_GAN_MAT', name: 'SiÃªu Ã¢m gan máº­t chuyÃªn sÃ¢u', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 15, insuranceCode: 'SA.004', listedPrice: 150000, insurancePrice: 110000, vipPrice: 220000 },
    { code: 'DV_SA_THAN_TIETNIEU', name: 'SiÃªu Ã¢m tháº­n tiáº¿t niá»‡u', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 15, insuranceCode: 'SA.005', listedPrice: 150000, insurancePrice: 110000, vipPrice: 220000 },
    { code: 'DV_SA_GIAP', name: 'SiÃªu Ã¢m tuyáº¿n giÃ¡p', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 15, insuranceCode: 'SA.001', listedPrice: 150000, insurancePrice: 110000, vipPrice: 220000 },
    { code: 'DV_SA_VU', name: 'SiÃªu Ã¢m vÃº hai bÃªn', category: SERVICE_CATEGORY.IMAGING, specialty: 'SAN', duration: 15, insuranceCode: 'SA.002', listedPrice: 180000, insurancePrice: 130000, vipPrice: 270000 },
    { code: 'DV_SA_TIM', name: 'SiÃªu Ã¢m tim Doppler mÃ u', category: SERVICE_CATEGORY.IMAGING, specialty: 'TIMMACH', duration: 30, insuranceCode: 'SA.003', listedPrice: 350000, insurancePrice: 280000, vipPrice: 500000 },
    { code: 'DV_SA_THAI', name: 'SiÃªu Ã¢m thai Doppler mÃ u', category: SERVICE_CATEGORY.IMAGING, specialty: 'SAN', duration: 25, insuranceCode: 'SA.006', listedPrice: 250000, insurancePrice: 180000, vipPrice: 380000 },
    { code: 'DV_SA_PHU_KHOA', name: 'SiÃªu Ã¢m phá»¥ khoa (Äáº§u dÃ² Ã¢m Ä‘áº¡o)', category: SERVICE_CATEGORY.IMAGING, specialty: 'SAN', duration: 20, insuranceCode: 'SA.007', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    // CT
    { code: 'DV_CT_SO_NAO', name: 'Chá»¥p CT sá» nÃ£o khÃ´ng cáº£n quang', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 20, insuranceCode: 'CT.001', listedPrice: 800000, insurancePrice: 600000, vipPrice: 1200000 },
    { code: 'DV_CT_XOANG', name: 'Chá»¥p CT xoang', category: SERVICE_CATEGORY.IMAGING, specialty: 'TMH', duration: 20, insuranceCode: 'CT.002', listedPrice: 800000, insurancePrice: 600000, vipPrice: 1200000 },
    { code: 'DV_CT_NGUC', name: 'Chá»¥p CT lá»“ng ngá»±c', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 25, insuranceCode: 'CT.003', listedPrice: 1200000, insurancePrice: 900000, vipPrice: 1800000 },
    { code: 'DV_CT_BUNG', name: 'Chá»¥p CT á»• bá»¥ng', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 25, insuranceCode: 'CT.004', listedPrice: 1200000, insurancePrice: 900000, vipPrice: 1800000 },
    { code: 'DV_CTA_NAO', name: 'Chá»¥p CTA máº¡ch mÃ¡u nÃ£o', category: SERVICE_CATEGORY.IMAGING, specialty: 'TIMMACH', duration: 30, insuranceCode: 'CT.005', listedPrice: 1800000, insurancePrice: 1400000, vipPrice: 2500000 },
    { code: 'DV_CTA_VANH', name: 'Chá»¥p CTA Ä‘á»™ng máº¡ch vÃ nh', category: SERVICE_CATEGORY.IMAGING, specialty: 'TIMMACH', duration: 40, insuranceCode: 'CT.006', listedPrice: 2200000, insurancePrice: 1700000, vipPrice: 3000000 },
    // MRI
    { code: 'DV_MRI_NAO', name: 'Chá»¥p MRI sá» nÃ£o khÃ´ng cáº£n tá»«', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 30, insuranceCode: 'MR.001', listedPrice: 1800000, insurancePrice: 1400000, vipPrice: 2500000 },
    { code: 'DV_MRI_CS_CO', name: 'Chá»¥p MRI cá»™t sá»‘ng cá»•', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 30, insuranceCode: 'MR.002', listedPrice: 1800000, insurancePrice: 1400000, vipPrice: 2500000 },
    { code: 'DV_MRI_CS_TL', name: 'Chá»¥p MRI cá»™t sá»‘ng tháº¯t lÆ°ng', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 30, insuranceCode: 'MR.003', listedPrice: 1800000, insurancePrice: 1400000, vipPrice: 2500000 },
    { code: 'DV_MRI_KHOP_GOI', name: 'Chá»¥p MRI khá»›p gá»‘i', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 30, insuranceCode: 'MR.004', listedPrice: 2000000, insurancePrice: 1500000, vipPrice: 2800000 },
    { code: 'DV_MRI_KHOP_VAI', name: 'Chá»¥p MRI khá»›p vai', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 30, insuranceCode: 'MR.005', listedPrice: 2000000, insurancePrice: 1500000, vipPrice: 2800000 },
    { code: 'DV_MRI_GAN', name: 'Chá»¥p MRI gan chuyÃªn sÃ¢u', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 35, insuranceCode: 'MR.006', listedPrice: 2200000, insurancePrice: 1700000, vipPrice: 3000000 },
    { code: 'DV_MRI_TUY', name: 'Chá»¥p MRI tá»¥y', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 35, insuranceCode: 'MR.007', listedPrice: 2200000, insurancePrice: 1700000, vipPrice: 3000000 },
    // Ná»™i soi
    { code: 'DV_NS_DADA_Y', name: 'Ná»™i soi dáº¡ dÃ y á»‘ng má»m', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 20, insuranceCode: 'NS.001', listedPrice: 600000, insurancePrice: 450000, vipPrice: 900000 },
    { code: 'DV_NS_DAITRANG', name: 'Ná»™i soi Ä‘áº¡i trÃ ng á»‘ng má»m', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 30, insuranceCode: 'NS.002', listedPrice: 900000, insurancePrice: 700000, vipPrice: 1300000 },
    { code: 'DV_NS_TMH', name: 'Ná»™i soi tai mÅ©i há»ng', category: SERVICE_CATEGORY.IMAGING, specialty: 'TMH', duration: 15, insuranceCode: 'NS.003', listedPrice: 200000, insurancePrice: 160000, vipPrice: 300000 },

    // --- THÄ‚M DÃ’ CHá»¨C NÄ‚NG ---
    { code: 'DV_TDCN_ECG', name: 'Äiá»‡n tim thÆ°á»ng (ECG 12 chuyá»ƒn Ä‘áº¡o)', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'TIMMACH', duration: 15, insuranceCode: 'TD.001', listedPrice: 100000, insurancePrice: 75000, vipPrice: 150000 },
    { code: 'DV_TDCN_HOLTER24', name: 'Äiá»‡n tim Holter 24 giá»', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'TIMMACH', duration: 30, insuranceCode: 'TD.002', listedPrice: 500000, insurancePrice: 400000, vipPrice: 750000 },
    { code: 'DV_TDCN_HOLTER48', name: 'Äiá»‡n tim Holter 48 giá»', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'TIMMACH', duration: 30, insuranceCode: 'TD.003', listedPrice: 800000, insurancePrice: 650000, vipPrice: 1100000 },
    { code: 'DV_TDCN_HOLTER_HA', name: 'Theo dÃµi huyáº¿t Ã¡p liÃªn tá»¥c 24 giá» (Holter huyáº¿t Ã¡p)', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'TIMMACH', duration: 30, insuranceCode: 'TD.004', listedPrice: 400000, insurancePrice: 320000, vipPrice: 600000 },
    { code: 'DV_TDCN_SPIRO', name: 'Äo chá»©c nÄƒng thÃ´ng khÃ­ phá»•i (HÃ´ háº¥p kÃ½)', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'HOHAP', duration: 20, insuranceCode: 'TD.005', listedPrice: 150000, insurancePrice: 110000, vipPrice: 220000 },
    { code: 'DV_TDCN_POLY', name: 'Äo Ä‘a kÃ½ hÃ´ háº¥p cháº©n Ä‘oÃ¡n ngÆ°ng thá»Ÿ khi ngá»§', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'HOHAP', duration: 40, insuranceCode: 'TD.006', listedPrice: 1200000, insurancePrice: 900000, vipPrice: 1800000 },
    { code: 'DV_TDCN_PSG', name: 'Äo Ä‘a kÃ½ giáº¥c ngá»§ (Polysomnography)', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'HOHAP', duration: 60, insuranceCode: 'TD.007', listedPrice: 2000000, insurancePrice: 1500000, vipPrice: 3000000 },
    { code: 'DV_TDCN_EEG', name: 'Äiá»‡n nÃ£o Ä‘á»“ (EEG)', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NOI', duration: 30, insuranceCode: 'TD.008', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_TDCN_EMG', name: 'Äiá»‡n cÆ¡ vÃ  tá»‘c Ä‘á»™ dáº«n truyá»n tháº§n kinh (EMG)', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NOI', duration: 30, insuranceCode: 'TD.009', listedPrice: 300000, insurancePrice: 220000, vipPrice: 450000 },

    // --- THá»¦ THUáº¬T ---
    { code: 'DV_TT_LAYCAORANG', name: 'Láº¥y cao rÄƒng vÃ  Ä‘Ã¡nh bÃ³ng', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'RANGHAM', duration: 30, insuranceCode: 'TT.001', listedPrice: 150000, insurancePrice: 100000, vipPrice: 250000 },
    { code: 'DV_TT_NHORANG_SUA', name: 'Nhá»• rÄƒng sá»¯a bÃ´i/tÃª', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'RANGHAM', duration: 15, insuranceCode: 'TT.002', listedPrice: 50000, insurancePrice: 30000, vipPrice: 100000 },
    { code: 'DV_TT_NHORANG_KHON', name: 'Nhá»• rÄƒng khÃ´n má»c lá»‡ch', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'RANGHAM', duration: 45, insuranceCode: 'TT.003', listedPrice: 1000000, insurancePrice: 800000, vipPrice: 1500000 },
    { code: 'DV_TT_TRAMRANG', name: 'TrÃ¡m rÄƒng tháº©m má»¹ Composite', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'RANGHAM', duration: 20, insuranceCode: 'TT.004', listedPrice: 200000, insurancePrice: 150000, vipPrice: 350000 },
    { code: 'DV_TT_NOISOI_TMH', name: 'Ná»™i soi Tai MÅ©i Há»ng á»‘ng cá»©ng', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'TMH', duration: 15, insuranceCode: 'TT.005', listedPrice: 200000, insurancePrice: 160000, vipPrice: 300000 },
    { code: 'DV_TT_HUTDICH_MUI', name: 'HÃºt dá»‹ch mÅ©i báº±ng mÃ¡y', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'TMH', duration: 10, insuranceCode: 'TT.006', listedPrice: 50000, insurancePrice: 35000, vipPrice: 100000 },
    { code: 'DV_TT_KHAUVT', name: 'KhÃ¢u váº¿t thÆ°Æ¡ng pháº§n má»m dÆ°á»›i 5cm', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NGOAI', duration: 30, insuranceCode: 'TT.007', listedPrice: 300000, insurancePrice: 220000, vipPrice: 500000 },
    { code: 'DV_TT_CATCHI', name: 'Cáº¯t chá»‰ váº¿t thÆ°Æ¡ng', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NGOAI', duration: 10, insuranceCode: 'TT.008', listedPrice: 50000, insurancePrice: 30000, vipPrice: 100000 },
    { code: 'DV_TT_CAT_NOTRUOI', name: 'Cáº¯t ná»‘t ruá»“i báº±ng Laser/Tiá»ƒu pháº«u', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NGOAI', duration: 20, insuranceCode: 'TT.009', listedPrice: 200000, insurancePrice: 150000, vipPrice: 350000 },
    { code: 'DV_TT_SINHTHIET_DA', name: 'Sinh thiáº¿t da cháº©n Ä‘oÃ¡n u/bá»‡nh lÃ½', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NGOAI', duration: 30, insuranceCode: 'TT.010', listedPrice: 400000, insurancePrice: 300000, vipPrice: 600000 },
    { code: 'DV_TT_CAT_NANGBA', name: 'Tiá»ƒu pháº«u cáº¯t nang bÃ£/u bÃ£ Ä‘áº­u', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NGOAI', duration: 30, insuranceCode: 'TT.011', listedPrice: 500000, insurancePrice: 380000, vipPrice: 750000 },

    // --- PHáº¦N PHáºªU THUáº¬T & CAN THIá»†P ---
    { code: 'DV_PT_CAT_U', name: 'Pháº«u thuáº­t cáº¯t u lÃ nh pháº§n má»m lá»›n', category: SERVICE_CATEGORY.SURGERY, specialty: 'NGOAI', duration: 60, insuranceCode: 'PT.001', listedPrice: 2000000, insurancePrice: 1600000, vipPrice: 3500000 },
    { code: 'DV_PT_THOATVI', name: 'Pháº«u thuáº­t khÃ¢u/tÃ¡i táº¡o thoÃ¡t vá»‹ báº¹n', category: SERVICE_CATEGORY.SURGERY, specialty: 'NGOAI', duration: 90, insuranceCode: 'PT.002', listedPrice: 4000000, insurancePrice: 3200000, vipPrice: 6000000 },
    { code: 'DV_PT_KETHOP_XUONG', name: 'Pháº«u thuáº­t káº¿t há»£p xÆ°Æ¡ng chi', category: SERVICE_CATEGORY.SURGERY, specialty: 'NGOAI', duration: 120, insuranceCode: 'PT.003', listedPrice: 6000000, insurancePrice: 4800000, vipPrice: 9000000 },
    { code: 'DV_PT_STENT', name: 'Can thiá»‡p nong & Ä‘áº·t Stent Ä‘á»™ng máº¡ch vÃ nh', category: SERVICE_CATEGORY.SURGERY, specialty: 'TIMMACH', duration: 90, insuranceCode: 'PT.004', listedPrice: 15000000, insurancePrice: 12000000, vipPrice: 22000000 },
    { code: 'DV_PT_NS_PHEQUAN', name: 'Ná»™i soi pháº¿ quáº£n sinh thiáº¿t/can thiá»‡p', category: SERVICE_CATEGORY.SURGERY, specialty: 'HOHAP', duration: 45, insuranceCode: 'PT.005', listedPrice: 1500000, insurancePrice: 1100000, vipPrice: 2500000 },
  ];

  for (const sv of servicesList) {
    let service = await serviceRepository.findOneBy({ code: sv.code });
    if (!service) {
      service = serviceRepository.create({
        code: sv.code,
        name: sv.name,
        category: sv.category,
        specialtyId: dbSpecialties[sv.specialty]?.id ?? null,
        durationMinutes: sv.duration,
        insuranceCode: sv.insuranceCode,
        isActive: true,
      });
      service = await serviceRepository.save(service);
      console.log(`+ Created Service: ${sv.name}`);
    }

    // Seed/Ensure 3 price tiers (LISTED + INSURANCE + VIP)
    const priceTypes = [
      { type: SERVICE_PRICE_TYPE.LISTED, amount: sv.listedPrice ?? 200000, vat: 5 },
      { type: SERVICE_PRICE_TYPE.INSURANCE, amount: sv.insurancePrice ?? 150000, vat: 0 },
      { type: SERVICE_PRICE_TYPE.VIP, amount: sv.vipPrice ?? Math.round((sv.listedPrice ?? 200000) * 1.5), vat: 5 }
    ];

    for (const pt of priceTypes) {
      let price = await servicePriceRepository.findOneBy({
        serviceId: service.id,
        priceType: pt.type,
      });
      if (!price) {
        price = servicePriceRepository.create({
          serviceId: service.id,
          priceType: pt.type,
          amount: pt.amount,
          vatRate: pt.vat,
          effectiveDate: new Date('2026-01-01'),
        });
        await servicePriceRepository.save(price);
        console.log(`  + Seeded ${pt.type} price for: ${sv.name}`);
      }
    }
  }

  // â”€â”€â”€ 11. Seed ICD-10 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const icd10List = [
    { code: 'J06', name: 'Nhiá»…m trÃ¹ng hÃ´ háº¥p trÃªn cáº¥p tÃ­nh', nameEn: 'Acute upper respiratory infections', specialty: 'NOI' },
    { code: 'K29', name: 'ViÃªm dáº¡ dÃ y vÃ  tÃ¡ trÃ ng', nameEn: 'Gastritis and duodenitis', specialty: 'NOI' },
    { code: 'I10', name: 'TÄƒng huyáº¿t Ã¡p nguyÃªn phÃ¡t', nameEn: 'Essential hypertension', specialty: 'TIMMACH' },
    { code: 'E11', name: 'ÄÃ¡i thÃ¡o Ä‘Æ°á»ng tÃ½p 2', nameEn: 'Type 2 diabetes mellitus', specialty: 'NOI' },
    { code: 'J18', name: 'ViÃªm phá»•i khÃ´ng Ä‘áº·c hiá»‡u', nameEn: 'Pneumonia, unspecified organism', specialty: 'NOI' },
    { code: 'H66', name: 'ViÃªm tai giá»¯a cÃ³ má»§ vÃ  cÃ¡c thá»ƒ liÃªn quan', nameEn: 'Suppurative and unspecified otitis media', specialty: 'TMH' },
    { code: 'K02', name: 'SÃ¢u rÄƒng', nameEn: 'Dental caries', specialty: 'RANGHAM' },
    { code: 'P07', name: 'Rá»‘i loáº¡n liÃªn quan Ä‘áº¿n thai ká»³ ngáº¯n vÃ  trá»ng lÆ°á»£ng tháº¥p khi sinh', nameEn: 'Disorders related to short gestation', specialty: 'SAN' },
    { code: 'A09', name: 'TiÃªu cháº£y vÃ  viÃªm dáº¡ dÃ y ruá»™t', nameEn: 'Diarrhoea and gastroenteritis', specialty: 'NHI' },
    { code: 'G43', name: 'Äau ná»­a Ä‘áº§u', nameEn: 'Migraine', specialty: 'NOI' },
    
    // Expanded ICD-10 Codes
    { code: 'Z00', name: 'KhÃ¡m sá»©c khá»e tá»•ng quÃ¡t', nameEn: 'General examination and investigation of persons without complaint or reported diagnosis', specialty: 'NOI' },
    { code: 'Z01', name: 'KhÃ¡m chuyÃªn khoa Ä‘á»‹nh ká»³', nameEn: 'Other special examinations and investigations of persons without complaint or reported diagnosis', specialty: 'NOI' },
    { code: 'M17', name: 'ThoÃ¡i hÃ³a khá»›p gá»‘i', nameEn: 'Gonarthrosis [arthrosis of knee]', specialty: 'NGOAI' },
    { code: 'K05', name: 'ViÃªm lá»£i vÃ  bá»‡nh nha chu', nameEn: 'Gingivitis and periodontal diseases', specialty: 'RANGHAM' },
    { code: 'J30', name: 'ViÃªm mÅ©i dá»‹ á»©ng vÃ  váº­n máº¡ch', nameEn: 'Vasomotor and allergic rhinitis', specialty: 'TMH' },
    { code: 'I15', name: 'TÄƒng huyáº¿t Ã¡p thá»© phÃ¡t', nameEn: 'Secondary hypertension', specialty: 'TIMMACH' },
  ];

  for (const icd of icd10List) {
    const existing = await icd10Repository.findOneBy({ code: icd.code });
    if (!existing) {
      const entity = icd10Repository.create({
        code: icd.code,
        name: icd.name,
        nameEn: icd.nameEn,
        specialtyId: dbSpecialties[icd.specialty]?.id ?? null,
        isActive: true,
      });
      await icd10Repository.save(entity);
      console.log(`+ Created ICD-10: ${icd.code} - ${icd.name}`);
    }
  }

  // â”€â”€â”€ 12. Seed Medications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const medicationsList = [
    {
      code: 'TH_PARACET_500',
      nationalCode: 'VD-12345-12',
      name: 'Paracetamol 500mg',
      activeIngredient: 'Paracetamol',
      concentration: '500mg',
      unit: 'ViÃªn',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '4000mg/ngÃ y',
      groupName: 'Giáº£m Ä‘au - Háº¡ sá»‘t',
    },
    {
      code: 'TH_AMOX_500',
      nationalCode: 'VD-23456-14',
      name: 'Amoxicillin 500mg',
      activeIngredient: 'Amoxicillin',
      concentration: '500mg',
      unit: 'ViÃªn nang',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '3000mg/ngÃ y',
      groupName: 'KhÃ¡ng sinh',
    },
    {
      code: 'TH_OMEPRA_20',
      nationalCode: 'VD-34567-15',
      name: 'Omeprazole 20mg',
      activeIngredient: 'Omeprazole',
      concentration: '20mg',
      unit: 'ViÃªn',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '40mg/ngÃ y',
      groupName: 'TiÃªu hÃ³a - Dáº¡ dÃ y',
    },
    {
      code: 'TH_AMLO_5',
      nationalCode: 'VD-45678-16',
      name: 'Amlodipine 5mg',
      activeIngredient: 'Amlodipine besylate',
      concentration: '5mg',
      unit: 'ViÃªn',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '10mg/ngÃ y',
      groupName: 'Tim máº¡ch - Huyáº¿t Ã¡p',
    },
    {
      code: 'TH_METFORM_500',
      nationalCode: 'VD-56789-17',
      name: 'Metformin 500mg',
      activeIngredient: 'Metformin hydrochloride',
      concentration: '500mg',
      unit: 'ViÃªn',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '2000mg/ngÃ y',
      groupName: 'Ná»™i tiáº¿t - ÄÃ¡i thÃ¡o Ä‘Æ°á»ng',
    },

    // Expanded Medications
    {
      code: 'TH_CEFU_500',
      nationalCode: 'VD-67890-18',
      name: 'Cefuroxime 500mg',
      activeIngredient: 'Cefuroxime',
      concentration: '500mg',
      unit: 'ViÃªn',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '1000mg/ngÃ y',
      groupName: 'KhÃ¡ng sinh',
    },
    {
      code: 'TH_AUG_1G',
      nationalCode: 'VN-12345-20',
      name: 'Augmentin 1g',
      activeIngredient: 'Amoxicillin + Clavulanic acid',
      concentration: '1000mg',
      unit: 'ViÃªn',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '2000mg/ngÃ y',
      groupName: 'KhÃ¡ng sinh',
    },
    {
      code: 'TH_IBU_400',
      nationalCode: 'VD-78901-19',
      name: 'Ibuprofen 400mg',
      activeIngredient: 'Ibuprofen',
      concentration: '400mg',
      unit: 'ViÃªn',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '1200mg/ngÃ y',
      groupName: 'Giáº£m Ä‘au - KhÃ¡ng viÃªm',
    },
    {
      code: 'TH_PARACET_SUI',
      nationalCode: 'VD-89012-20',
      name: 'Efferalgan 500mg (Sá»§i)',
      activeIngredient: 'Paracetamol',
      concentration: '500mg',
      unit: 'ViÃªn sá»§i',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '4000mg/ngÃ y',
      groupName: 'Giáº£m Ä‘au - Háº¡ sá»‘t',
    },
    {
      code: 'TH_PRED_5',
      nationalCode: 'VD-90123-21',
      name: 'Prednisolone 5mg',
      activeIngredient: 'Prednisolone',
      concentration: '5mg',
      unit: 'ViÃªn',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '60mg/ngÃ y',
      groupName: 'KhÃ¡ng viÃªm Steroid',
    },
    {
      code: 'TH_METH_16',
      nationalCode: 'VD-01234-22',
      name: 'Medrol 16mg',
      activeIngredient: 'Methylprednisolone',
      concentration: '16mg',
      unit: 'ViÃªn',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '64mg/ngÃ y',
      groupName: 'KhÃ¡ng viÃªm Steroid',
    },
    {
      code: 'TH_ESO_40',
      nationalCode: 'VN-23456-22',
      name: 'Nexium 40mg',
      activeIngredient: 'Esomeprazole',
      concentration: '40mg',
      unit: 'ViÃªn',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '40mg/ngÃ y',
      groupName: 'TiÃªu hÃ³a - Dáº¡ dÃ y',
    },
    {
      code: 'TH_ENA_5',
      nationalCode: 'VD-34567-23',
      name: 'Enalapril 5mg',
      activeIngredient: 'Enalapril',
      concentration: '5mg',
      unit: 'ViÃªn',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '40mg/ngÃ y',
      groupName: 'Tim máº¡ch - Huyáº¿t Ã¡p',
    },
    {
      code: 'TH_GLI_60',
      nationalCode: 'VN-45678-24',
      name: 'Diamicron MR 60mg',
      activeIngredient: 'Gliclazide',
      concentration: '60mg',
      unit: 'ViÃªn',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '120mg/ngÃ y',
      groupName: 'Ná»™i tiáº¿t - ÄÃ¡i thÃ¡o Ä‘Æ°á»ng',
    },
  ];

  for (const med of medicationsList) {
    const existing = await medicationRepository.findOneBy({ code: med.code });
    if (!existing) {
      const entity = medicationRepository.create({ ...med, isActive: true });
      await medicationRepository.save(entity);
      console.log(`+ Created Medication: ${med.name}`);
    }
  }

  // 15. Seed Form Templates
  console.log('ðŸŒ± Seeding Form Templates...');
  const formTemplateRepository = AppDataSource.getRepository(FormTemplateOrmEntity);
  const formTemplatesList = [
    {
      name: 'Máº«u hÃ³a Ä‘Æ¡n thanh toÃ¡n chi phÃ­',
      code: 'INVOICE_TEMPLATE',
      type: FORM_TEMPLATE_TYPE.PRINT_TEMPLATE,
      category: FORM_TEMPLATE_CATEGORY.INVOICE,
      htmlContent: `<div class="print-container" style="font-family: 'Inter', sans-serif; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 20px; box-sizing: border-box; background: white;">
  <div class="header" style="display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px;">
    <div>
      <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #059669;">{{organizationName}}</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563; font-weight: 500;">{{branchName}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Äá»‹a chá»‰: {{branchAddress}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Hotline: {{branchHotline}}</p>
    </div>
    <div style="text-align: right;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #111827;">HÃ“A ÄÆ N THANH TOÃN</h3>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #ef4444; font-weight: 600;">Sá»‘: {{invoiceCode}}</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">NgÃ y: {{dateTime}}</p>
    </div>
  </div>

  <div class="patient-info" style="margin-bottom: 20px; font-size: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
    <div><strong>Há» tÃªn bá»‡nh nhÃ¢n:</strong> <span style="text-transform: uppercase; font-weight: 600;">{{patientName}}</span></div>
    <div><strong>MÃ£ bá»‡nh nhÃ¢n:</strong> {{patientCode}}</div>
    <div><strong>NgÃ y sinh:</strong> {{patientDob}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Giá»›i tÃ­nh:</strong> {{patientGender}}</div>
    <div><strong>Sá»‘ Ä‘iá»‡n thoáº¡i:</strong> {{patientPhone}}</div>
    <div style="grid-column: span 2;"><strong>Äá»‹a chá»‰:</strong> {{patientAddress}}</div>
  </div>

  <table class="services-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
    <thead>
      <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb; text-align: left;">
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 40px; text-align: center;">STT</th>
        <th style="padding: 8px; font-weight: 600; color: #374151;">TÃªn dá»‹ch vá»¥</th>
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 60px; text-align: center;">SL</th>
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 100px; text-align: right;">ÄÆ¡n giÃ¡ (Ä‘)</th>
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 120px; text-align: right;">ThÃ nh tiá»n (Ä‘)</th>
      </tr>
    </thead>
    <tbody>
      {{serviceRows}}
    </tbody>
  </table>

  <div class="summary" style="margin-left: auto; width: 300px; font-size: 13px; margin-bottom: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
      <span>Tá»•ng chi phÃ­:</span>
      <span style="font-weight: 600;">{{totalAmount}} Ä‘</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
      <span>Miá»…n giáº£m/BHYT:</span>
      <span style="font-weight: 600; color: #10b981;">- {{discountAmount}} Ä‘</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; border-top: 1px dashed #d1d5db; padding-top: 6px; margin-top: 6px;">
      <span style="color: #059669;">Thá»±c thu:</span>
      <span style="color: #059669;">{{payableAmount}} Ä‘</span>
    </div>
  </div>

  <div style="font-size: 12px; font-style: italic; margin-bottom: 30px;">
    <strong>Báº±ng chá»¯:</strong> {{amountInWords}}
  </div>

  <div class="footer-signatures" style="display: flex; justify-content: space-between; text-align: center; font-size: 13px; margin-top: 40px; padding: 0 40px;">
    <div>
      <strong>NgÆ°á»i ná»™p tiá»n</strong><br>
      <span style="font-size: 11px; color: #6b7280;">(KÃ½, ghi rÃµ há» tÃªn)</span>
      <div style="height: 60px;"></div>
    </div>
    <div>
      <strong>Thu ngÃ¢n</strong><br>
      <span style="font-size: 11px; color: #6b7280;">(KÃ½, Ä‘Ã³ng dáº¥u)</span>
      <div style="height: 60px;"></div>
      <strong style="color: #111827;">{{cashierName}}</strong>
    </div>
  </div>
</div>`,
      description: 'Máº«u hÃ³a Ä‘Æ¡n chi phÃ­ dá»‹ch vá»¥ khÃ¡m chá»¯a bá»‡nh cá»§a phÃ²ng khÃ¡m',
      isActive: true,
    },
    {
      name: 'Máº«u Ä‘Æ¡n thuá»‘c Ä‘iá»‡n tá»­',
      code: 'PRESCRIPTION_TEMPLATE',
      type: FORM_TEMPLATE_TYPE.PRINT_TEMPLATE,
      category: FORM_TEMPLATE_CATEGORY.PRESCRIPTION,
      htmlContent: `<div class="print-container" style="font-family: 'Inter', sans-serif; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 20px; box-sizing: border-box; background: white;">
  <div class="header" style="display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px;">
    <div>
      <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #059669;">{{organizationName}}</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563; font-weight: 500;">{{branchName}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Äá»‹a chá»‰: {{branchAddress}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Äiá»‡n thoáº¡i: {{branchHotline}}</p>
    </div>
    <div style="text-align: right;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">ÄÆ N THUá»C ÄIá»†N Tá»¬</h3>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">MÃ£ Ä‘Æ¡n: DT-{{patientCode}}</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">NgÃ y kÃª: {{dateTime}}</p>
    </div>
  </div>

  <div class="patient-info" style="margin-bottom: 15px; font-size: 13px; display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 8px;">
    <div style="grid-column: span 1;"><strong>Há» tÃªn:</strong> <span style="text-transform: uppercase; font-weight: 600;">{{patientName}}</span></div>
    <div><strong>Tuá»•i/NÄƒm sinh:</strong> {{patientDob}}</div>
    <div><strong>Giá»›i tÃ­nh:</strong> {{patientGender}}</div>
    <div style="grid-column: span 1;"><strong>SÄT:</strong> {{patientPhone}}</div>
    <div style="grid-column: span 2;"><strong>Äá»‹a chá»‰:</strong> {{patientAddress}}</div>
    <div style="grid-column: span 3; border-top: 1px dashed #e5e7eb; padding-top: 8px; margin-top: 4px;"><strong>Cháº©n Ä‘oÃ¡n:</strong> {{diagnosis}}</div>
  </div>

  <div style="font-size: 14px; font-weight: 700; color: #059669; margin: 15px 0 8px 0; border-bottom: 1px solid #10b981; padding-bottom: 4px;">CHá»ˆ Äá»ŠNH DÃ™NG THUá»C</div>
  <table class="medications-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
    <thead>
      <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; text-align: left;">
        <th style="padding: 6px 8px; font-weight: 600; color: #374151; width: 40px; text-align: center;">STT</th>
        <th style="padding: 6px 8px; font-weight: 600; color: #374151;">TÃªn thuá»‘c, HÃ m lÆ°á»£ng, ÄÆ°á»ng dÃ¹ng</th>
        <th style="padding: 6px 8px; font-weight: 600; color: #374151; width: 80px; text-align: center;">Sá»‘ lÆ°á»£ng</th>
      </tr>
    </thead>
    <tbody>
      {{medicationRows}}
    </tbody>
  </table>

  <div style="font-size: 12px; color: #4b5563; line-height: 1.5; margin-bottom: 35px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
    <strong>Lá»i dáº·n cá»§a bÃ¡c sÄ©:</strong> Uá»‘ng thuá»‘c Ä‘Ãºng giá», Ä‘Ãºng liá»u. TrÃ¡nh Äƒn Ä‘á»“ cay nÃ³ng, nhiá»u dáº§u má»¡. TÃ¡i khÃ¡m sau 7 ngÃ y hoáº·c khi cÃ³ dáº¥u hiá»‡u báº¥t thÆ°á»ng. Mang theo Ä‘Æ¡n thuá»‘c nÃ y khi tÃ¡i khÃ¡m.
  </div>

  <div class="footer-signatures" style="display: flex; justify-content: flex-end; text-align: center; font-size: 13px;">
    <div style="width: 250px;">
      <p style="margin: 0; font-size: 11px; color: #6b7280;">HÃ  Ná»™i, ngÃ y {{dateTime}}</p>
      <strong style="display: block; margin-top: 5px;">BÃ¡c sÄ© Ä‘iá»u trá»‹</strong>
      <span style="font-size: 11px; color: #6b7280;">(KÃ½, ghi rÃµ há» tÃªn)</span>
      <div style="height: 70px;"></div>
      <strong style="color: #111827;">{{doctorName}}</strong>
    </div>
  </div>
</div>`,
      description: 'Máº«u Ä‘Æ¡n thuá»‘c Ä‘iá»‡n tá»­ chuáº©n quy Ä‘á»‹nh Bá»™ Y Táº¿',
      isActive: true,
    },
    {
      name: 'Máº«u phiáº¿u káº¿t quáº£ xÃ©t nghiá»‡m',
      code: 'LAB_RESULT_TEMPLATE',
      type: FORM_TEMPLATE_TYPE.PRINT_TEMPLATE,
      category: FORM_TEMPLATE_CATEGORY.LAB_RESULT,
      htmlContent: `<div class="print-container" style="font-family: 'Inter', sans-serif; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 20px; box-sizing: border-box; background: white;">
  <div class="header" style="display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px;">
    <div>
      <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #059669;">{{organizationName}}</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563; font-weight: 500;">{{branchName}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Äá»‹a chá»‰: {{branchAddress}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Äiá»‡n thoáº¡i: {{branchHotline}}</p>
    </div>
    <div style="text-align: right;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">PHIáº¾U Káº¾T QUáº¢ XÃ‰T NGHIá»†M</h3>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">MÃ£ KQ: XN-{{patientCode}}</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">NgÃ y XN: {{dateTime}}</p>
    </div>
  </div>

  <div class="patient-info" style="margin-bottom: 20px; font-size: 13px; display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 8px;">
    <div><strong>Bá»‡nh nhÃ¢n:</strong> <span style="text-transform: uppercase; font-weight: 600;">{{patientName}}</span></div>
    <div><strong>NÄƒm sinh:</strong> {{patientDob}}</div>
    <div><strong>Giá»›i tÃ­nh:</strong> {{patientGender}}</div>
    <div><strong>SÄT:</strong> {{patientPhone}}</div>
    <div style="grid-column: span 2;"><strong>Chá»‰ Ä‘á»‹nh bá»Ÿi:</strong> {{doctorName}}</div>
    <div style="grid-column: span 3; border-top: 1px dashed #e5e7eb; padding-top: 8px; margin-top: 4px;"><strong>Cháº©n Ä‘oÃ¡n lÃ¢m sÃ ng:</strong> {{diagnosis}}</div>
  </div>

  <table class="results-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
    <thead>
      <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb; text-align: left;">
        <th style="padding: 8px; font-weight: 600; color: #374151;">TÃªn xÃ©t nghiá»‡m</th>
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 120px; text-align: center;">Káº¿t quáº£</th>
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 100px; text-align: center;">ÄÆ¡n vá»‹</th>
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 150px; text-align: center;">Trá»‹ sá»‘ bÃ¬nh thÆ°á»ng</th>
      </tr>
    </thead>
    <tbody>
      {{labResultRows}}
    </tbody>
  </table>

  <div style="font-size: 12px; color: #6b7280; font-style: italic; margin-bottom: 30px;">
    * ChÃº thÃ­ch: CÃ¡c giÃ¡ trá»‹ in Ä‘áº­m/mÃ u Ä‘á» náº±m ngoÃ i khoáº£ng tham chiáº¿u bÃ¬nh thÆ°á»ng.
  </div>

  <div class="footer-signatures" style="display: flex; justify-content: space-between; text-align: center; font-size: 13px; margin-top: 30px;">
    <div>
      <p style="margin: 0; font-size: 11px; color: #6b7280;">&nbsp;</p>
      <strong>BÃ¡c sÄ© chá»‰ Ä‘á»‹nh</strong>
      <div style="height: 60px;"></div>
      <strong>{{doctorName}}</strong>
    </div>
    <div>
      <p style="margin: 0; font-size: 11px; color: #6b7280;">HÃ  Ná»™i, {{dateTime}}</p>
      <strong>Ká»¹ thuáº­t viÃªn phÃ²ng XÃ©t nghiá»‡m</strong>
      <div style="height: 60px;"></div>
      <strong>KTV. Nguyá»…n VÄƒn Huy</strong>
    </div>
  </div>
</div>`,
      description: 'Máº«u káº¿t quáº£ xÃ©t nghiá»‡m sinh hÃ³a / huyáº¿t há»c thÃ´ng thÆ°á»ng',
      isActive: true,
    },
    {
      name: 'Máº«u phiáº¿u káº¿t quáº£ siÃªu Ã¢m',
      code: 'ULTRASOUND_RESULT_TEMPLATE',
      type: FORM_TEMPLATE_TYPE.PRINT_TEMPLATE,
      category: FORM_TEMPLATE_CATEGORY.ULTRASOUND_RESULT,
      htmlContent: `<div class="print-container" style="font-family: 'Inter', sans-serif; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 20px; box-sizing: border-box; background: white;">
  <div class="header" style="display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px;">
    <div>
      <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #059669;">{{organizationName}}</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563; font-weight: 500;">{{branchName}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Äá»‹a chá»‰: {{branchAddress}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Äiá»‡n thoáº¡i: {{branchHotline}}</p>
    </div>
    <div style="text-align: right;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">PHIáº¾U Káº¾T QUáº¢ SIÃŠU Ã‚M</h3>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">MÃ£ KQ: SA-{{patientCode}}</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">NgÃ y SA: {{dateTime}}</p>
    </div>
  </div>

  <div class="patient-info" style="margin-bottom: 20px; font-size: 13px; display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 8px;">
    <div><strong>Bá»‡nh nhÃ¢n:</strong> <span style="text-transform: uppercase; font-weight: 600;">{{patientName}}</span></div>
    <div><strong>NÄƒm sinh:</strong> {{patientDob}}</div>
    <div><strong>Giá»›i tÃ­nh:</strong> {{patientGender}}</div>
    <div><strong>SÄT:</strong> {{patientPhone}}</div>
    <div style="grid-column: span 2;"><strong>BÃ¡c sÄ© chá»‰ Ä‘á»‹nh:</strong> {{doctorName}}</div>
    <div style="grid-column: span 3; border-top: 1px dashed #e5e7eb; padding-top: 8px; margin-top: 4px;"><strong>Cháº©n Ä‘oÃ¡n lÃ¢m sÃ ng:</strong> {{diagnosis}}</div>
  </div>

  <div style="font-size: 14px; font-weight: 700; color: #059669; margin: 15px 0 8px 0; border-bottom: 1px solid #10b981; padding-bottom: 4px;">MÃ” Táº¢ CHI TIáº¾T Káº¾T QUáº¢</div>
  <div style="font-size: 13px; line-height: 1.6; color: #1f2937; margin-bottom: 20px; white-space: pre-line;">
    {{ultrasoundResult}}
  </div>

  <div style="font-size: 14px; font-weight: 700; color: #059669; margin: 15px 0 8px 0; border-bottom: 1px solid #10b981; padding-bottom: 4px;">Káº¾T LUáº¬N</div>
  <div style="font-size: 14px; font-weight: 700; color: #ef4444; margin-bottom: 25px;">
    {{ultrasoundConclusion}}
  </div>

  <div class="footer-signatures" style="display: flex; justify-content: space-between; text-align: center; font-size: 13px; margin-top: 30px;">
    <div>
      <p style="margin: 0; font-size: 11px; color: #6b7280;">&nbsp;</p>
      <strong>BÃ¡c sÄ© chá»‰ Ä‘á»‹nh</strong>
      <div style="height: 60px;"></div>
      <strong>{{doctorName}}</strong>
    </div>
    <div>
      <p style="margin: 0; font-size: 11px; color: #6b7280;">HÃ  Ná»™i, {{dateTime}}</p>
      <strong>BÃ¡c sÄ© SiÃªu Ã¢m</strong>
      <div style="height: 60px;"></div>
      <strong>BS. Nguyá»…n Thá»‹ VÃ¢n</strong>
    </div>
  </div>
</div>`,
      description: 'Máº«u káº¿t quáº£ siÃªu Ã¢m á»• bá»¥ng / siÃªu Ã¢m tá»•ng quÃ¡t',
      isActive: true,
    },
  ];

  for (const template of formTemplatesList) {
    const existing = await formTemplateRepository.findOneBy({ code: template.code });
    if (!existing) {
      const entity = formTemplateRepository.create(template);
      await formTemplateRepository.save(entity);
      console.log(`+ Created Form Template: ${template.name}`);
    }
  }

  // 16. Seed Patients, Appointments & Visits
  console.log('ðŸŒ± Seeding Patient, Appointment & Visit data...');
  const patientDataList = [
    {
      patientCode: 'BN-2026-0001',
      fullName: 'Tráº§n Quá»‘c Báº£o',
      dob: '1988-08-15',
      gender: PATIENT_GENDER.MALE,
      phone: '0905123456',
      email: 'baotq@gmail.com',
      address: '72 Nguyá»…n ChÃ­ Thanh, LÃ¡ng ThÆ°á»£ng, Äá»‘ng Äa, HÃ  Ná»™i',
      cccd: '037088998811',
    },
    {
      patientCode: 'BN-2026-0002',
      fullName: 'Nguyá»…n Thá»‹ Kim Chi',
      dob: '1995-10-12',
      gender: PATIENT_GENDER.FEMALE,
      phone: '0988223344',
      email: 'chintk@gmail.com',
      address: '15 Cáº§u Giáº¥y, LÃ¡ng ThÆ°á»£ng, Äá»‘ng Äa, HÃ  Ná»™i',
      cccd: '035200002532',
    },
    {
      patientCode: 'BN-2026-0003',
      fullName: 'Pháº¡m Minh HoÃ ng',
      dob: '2012-05-20',
      gender: PATIENT_GENDER.MALE,
      phone: '0977112233',
      email: null,
      address: '120 Minh Khai, Hai BÃ  TrÆ°ng, HÃ  Ná»™i',
      cccd: '037012003456',
      guardianName: 'Pháº¡m Minh Háº£i',
      guardianPhone: '0977112234',
      guardianRelation: 'Bá»‘',
    },
  ];

  const dbPatients: Record<string, PatientOrmEntity> = {};
  for (const patientData of patientDataList) {
    let p = await patientRepository.findOneBy({ phone: patientData.phone });
    if (!p) {
      p = patientRepository.create(patientData);
      p = await patientRepository.save(p);
      console.log(`+ Created Patient: ${p.fullName}`);
    }
    dbPatients[p.phone] = p;
  }

  // Lookup IDs needed for appointments/visits
  const defaultBranch = await branchRepository.findOneBy({ code: 'CN_HBT_HN' });
  const docNam = await staffRepository.findOneBy({ staffCode: 'NV0001' });
  const docMai = await staffRepository.findOneBy({ staffCode: 'NV0002' });
  const room101 = await roomRepository.findOneBy({ code: 'PK101' });
  const serviceKhamNoi = await serviceRepository.findOneBy({ name: 'KhÃ¡m ná»™i tá»•ng quÃ¡t' }) || await serviceRepository.findOne({ where: {} });

  if (defaultBranch && docNam && docMai && room101) {
    const todayStr = new Date().toISOString().split('T')[0];

    // Seed Appointments
    const appointmentsList = [
      {
        appointmentCode: 'LH260624-0001',
        patientId: dbPatients['0905123456'].id,
        branchId: defaultBranch.id,
        doctorId: docNam.id,
        roomId: room101.id,
        serviceId: serviceKhamNoi?.id || null,
        appointmentDate: todayStr,
        startTime: '09:00',
        endTime: '09:30',
        status: APPOINTMENT_STATUS.CHECKED_IN,
        notes: 'KhÃ¡m dáº¡ dÃ y Ä‘á»‹nh ká»³',
      },
      {
        appointmentCode: 'LH260624-0002',
        patientId: dbPatients['0988223344'].id,
        branchId: defaultBranch.id,
        doctorId: docMai.id,
        roomId: room101.id,
        serviceId: serviceKhamNoi?.id || null,
        appointmentDate: todayStr,
        startTime: '10:00',
        endTime: '10:30',
        status: APPOINTMENT_STATUS.BOOKED,
        notes: 'TÆ° váº¥n sá»©c khá»e sáº£n phá»¥',
      },
      {
        appointmentCode: 'LH260624-0003',
        patientId: dbPatients['0977112233'].id,
        branchId: defaultBranch.id,
        doctorId: docNam.id,
        roomId: room101.id,
        serviceId: serviceKhamNoi?.id || null,
        appointmentDate: todayStr,
        startTime: '14:00',
        endTime: '14:30',
        status: APPOINTMENT_STATUS.CONFIRMED,
        notes: 'KhÃ¡m ho, sá»‘t nháº¹ á»Ÿ tráº» em',
      },
    ];

    const dbAppointments: Record<string, AppointmentOrmEntity> = {};
    for (const appData of appointmentsList) {
      let app = await appointmentRepository.findOneBy({ appointmentCode: appData.appointmentCode });
      if (!app) {
        app = appointmentRepository.create(appData);
        app = await appointmentRepository.save(app);
        console.log(`+ Created Appointment: ${app.appointmentCode}`);
      }
      dbAppointments[app.appointmentCode] = app;
    }

    // Seed Visits (LÆ°á»£t khÃ¡m bá»‡nh nhÃ¢n)
    const visitsList = [
      {
        visitCode: 'LK260624-0001',
        patientId: dbPatients['0905123456'].id,
        branchId: defaultBranch.id,
        appointmentId: dbAppointments['LH260624-0001'].id,
        currentRoomId: room101.id,
        currentDoctorId: docNam.id,
        queueNumber: 1,
        status: PATIENT_VISIT_STATUS.WAITING,
        reason: 'Äau dáº¡ dÃ y, Ä‘áº§y hÆ¡i chÆ°á»›ng bá»¥ng',
        pulse: 78,
        bloodPressure: '120/80',
        temperature: 36.6,
        weight: 65.5,
        height: 170.0,
      },
      {
        visitCode: 'LK260624-0002',
        patientId: dbPatients['0977112233'].id,
        branchId: defaultBranch.id,
        appointmentId: dbAppointments['LH260624-0003'].id,
        currentRoomId: room101.id,
        currentDoctorId: docNam.id,
        queueNumber: 2,
        status: PATIENT_VISIT_STATUS.IN_CLINICAL_EXAM,
        reason: 'KhÃ¡m ho vÃ  sá»‘t á»Ÿ tráº» em',
        pulse: 90,
        bloodPressure: '110/70',
        temperature: 38.2,
        weight: 22.0,
        height: 115.0,
      },
      {
        visitCode: 'LK260515-0001',
        patientId: dbPatients['0905123456'].id,
        branchId: defaultBranch.id,
        appointmentId: null,
        currentRoomId: room101.id,
        currentDoctorId: docNam.id,
        queueNumber: 10,
        status: PATIENT_VISIT_STATUS.COMPLETED,
        reason: 'Äau dáº¡ dÃ y, Ä‘áº§y bá»¥ng khÃ³ tiÃªu kÃ©o dÃ i',
        pulse: 80,
        bloodPressure: '125/80',
        temperature: 36.8,
        weight: 65.5,
        height: 170.0,
      },
      {
        visitCode: 'LK260420-0001',
        patientId: dbPatients['0905123456'].id,
        branchId: defaultBranch.id,
        appointmentId: null,
        currentRoomId: room101.id,
        currentDoctorId: docNam.id,
        queueNumber: 12,
        status: PATIENT_VISIT_STATUS.COMPLETED,
        reason: 'Ho khan, Ä‘au há»ng, sá»‘t nháº¹ vÃ o chiá»u tá»‘i',
        pulse: 84,
        bloodPressure: '120/75',
        temperature: 37.4,
        weight: 66.0,
        height: 170.0,
      },
      {
        visitCode: 'LK260522-0001',
        patientId: dbPatients['0988223344'].id,
        branchId: defaultBranch.id,
        appointmentId: null,
        currentRoomId: room101.id,
        currentDoctorId: docMai.id,
        queueNumber: 8,
        status: PATIENT_VISIT_STATUS.COMPLETED,
        reason: 'Äá»‹nh ká»³ kiá»ƒm tra huyáº¿t Ã¡p vÃ  tim máº¡ch',
        pulse: 72,
        bloodPressure: '135/85',
        temperature: 36.5,
        weight: 54.0,
        height: 158.0,
      },
    ];

    for (const visitData of visitsList) {
      let visit = await visitRepository.findOneBy({ visitCode: visitData.visitCode });
      if (!visit) {
        visit = visitRepository.create(visitData);
        await visitRepository.save(visit);
        console.log(`+ Created Patient Visit: ${visit.visitCode} (STT ${visit.queueNumber})`);
      }
    }
  }

  await AppDataSource.destroy();
  console.log('âœ… Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('âŒ Seeding failed:', err);
  process.exit(1);
});
