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
import { DepartmentOrmEntity } from '../../../modules/org/infrastructure/database/department.entity';
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
  console.log('🌱 Starting database seeding...');
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
  const departmentRepository = AppDataSource.getRepository(DepartmentOrmEntity);
  const shiftRepository = AppDataSource.getRepository(ShiftOrmEntity);
  const templateRepository = AppDataSource.getRepository(StaffScheduleTemplateOrmEntity);
  const patientRepository = AppDataSource.getRepository(PatientOrmEntity);
  const appointmentRepository = AppDataSource.getRepository(AppointmentOrmEntity);
  const visitRepository = AppDataSource.getRepository(PatientVisitOrmEntity);


  // 1. Seed Permissions
  const permissionsList = [
    { name: 'org:read', description: 'Xem thông tin tổ chức' },
    { name: 'org:write', description: 'Cấu hình thông tin tổ chức' },
    { name: 'branch:create', description: 'Tạo cơ sở/chi nhánh' },
    { name: 'branch:update', description: 'Cập nhật cơ sở/chi nhánh' },
    { name: 'branch:read', description: 'Xem danh sách cơ sở/chi nhánh' },
    { name: 'user:create', description: 'Tạo tài khoản người dùng' },
    { name: 'user:update', description: 'Cập nhật tài khoản người dùng' },
    { name: 'user:read', description: 'Xem danh sách tài khoản' },
    { name: 'role:write', description: 'Quản lý vai trò và phân quyền' },
    
    // Room Permissions
    { name: 'room:read', description: 'Xem danh sách/chi tiết phòng khám' },
    { name: 'room:write', description: 'Tạo/Cập nhật phòng khám' },

    // Resource Permissions
    { name: 'resource:read', description: 'Xem danh sách/chi tiết tài nguyên phòng' },
    { name: 'resource:write', description: 'Tạo/Cập nhật tài nguyên phòng' },

    // Staff Permissions
    { name: 'staff:read', description: 'Xem danh sách/chi tiết nhân sự' },
    { name: 'staff:write', description: 'Tạo/Cập nhật nhân sự' },

    // Medical - Specialty Permissions
    { name: 'specialty:read', description: 'Xem danh mục chuyên khoa' },
    { name: 'specialty:write', description: 'Quản lý danh mục chuyên khoa' },

    // Medical - Service Permissions
    { name: 'service:read', description: 'Xem danh mục dịch vụ y tế' },
    { name: 'service:write', description: 'Quản lý danh mục dịch vụ y tế' },

    // Medical - ICD-10 Permissions
    { name: 'icd10:read', description: 'Xem danh mục ICD-10' },
    { name: 'icd10:write', description: 'Quản lý danh mục ICD-10' },

    // Medical - Medication Permissions
    { name: 'medication:read', description: 'Xem danh mục thuốc' },
    { name: 'medication:write', description: 'Quản lý danh mục thuốc' },

    // Schedule Permissions
    { name: 'schedule:read', description: 'Xem lịch làm việc nhân viên' },
    { name: 'schedule:update', description: 'Cập nhật lịch làm việc tuần (Template)' },
    { name: 'schedule:update-daily', description: 'Điều chỉnh lịch làm việc ngày (Override)' },
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
    { name: AUTH_ROLE_NAME.ADMIN, description: 'Quản trị viên toàn hệ thống' },
    { name: AUTH_ROLE_NAME.DOCTOR, description: 'Bác sĩ lâm sàng' },
    { name: AUTH_ROLE_NAME.RECEPTION, description: 'Lễ tân tiếp đón' },
    { name: AUTH_ROLE_NAME.NURSE, description: 'Điều dưỡng viên' },
    { name: AUTH_ROLE_NAME.TECHNICIAN, description: 'Kỹ thuật viên' },
    { name: PATIENT_ROLE_NAME, description: PATIENT_ROLE_DESCRIPTION },
    { name: AUTH_ROLE_NAME.ACCOUNTANT, description: 'Kế toán / Thu ngân phòng khám' },
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
      name: 'Hệ thống Phòng khám DAO CARE',
      shortName: 'DAO CARE',
      code: orgCode,
      taxCode: '0102030405',
      legalRepresentative: 'Trần Hữu Nam',
      hotline: '19001234',
      email: 'contact@daocare.vn',
      address: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
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
      name: 'Cơ sở Hà Nội - Hai Bà Trưng',
      code: branchCode,
      type: BRANCH_TYPE.CLINIC,
      technicalDirector: 'BS. Trần Hữu Nam',
      hotline: '024777888',
      email: 'hbt@daocare.vn',
      province: 'Hà Nội',
      district: 'Hai Bà Trưng',
      addressDetail: 'Số 1 Đại Cồ Việt',
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

  // ─── 6. Seed Departments ────────────────────────────────────────────────────
  const departmentsData = [
    { code: 'DEPT_KB', name: 'Khoa Khám Bệnh', description: 'Đón tiếp, phân loại và khám bệnh ban đầu' },
    { code: 'DEPT_NOI', name: 'Khoa Nội tổng hợp', description: 'Khám và điều trị các bệnh lý nội khoa tổng quát' },
    { code: 'DEPT_NGOAI', name: 'Khoa Ngoại tổng hợp', description: 'Khám, tiểu phẫu và can thiệp ngoại khoa' },
    { code: 'DEPT_SAN', name: 'Khoa Phụ Sản', description: 'Khám thai, theo dõi thai kỳ và bệnh lý phụ khoa' },
    { code: 'DEPT_NHI', name: 'Khoa Nhi', description: 'Khám và điều trị bệnh nhi khoa' },
    { code: 'DEPT_XN', name: 'Khoa Xét Nghiệm', description: 'Thực hiện các xét nghiệm huyết học, sinh hóa, nước tiểu' },
    { code: 'DEPT_CDHA', name: 'Khoa Chẩn Đoán Hình Ảnh', description: 'Siêu âm, X-quang, CT, MRI' },
    { code: 'DEPT_LT', name: 'Bộ phận Lễ tân & Đón tiếp', description: 'Đón tiếp khách hàng, làm thủ tục hành chính' },
  ];

  const dbDepts: Record<string, DepartmentOrmEntity> = {};
  for (const deptData of departmentsData) {
    let dept = await departmentRepository.findOneBy({ code: deptData.code });
    if (!dept) {
      dept = departmentRepository.create({
        ...deptData,
        branchId: branch.id,
        isActive: true,
      });
      dept = await departmentRepository.save(dept);
      console.log(`+ Created Department: ${dept.name}`);
    } else {
      if (!dept.branchId) {
        dept.branchId = branch.id;
        dept = await departmentRepository.save(dept);
      }
      console.log(`~ Department ${deptData.code} already exists.`);
    }
    dbDepts[deptData.code] = dept;
  }

  // ─── 7. Seed Shifts ──────────────────────────────────────────────────────────
  const shiftsData = [
    { name: 'Ca sáng', startTime: '07:30', endTime: '11:30' },
    { name: 'Ca chiều', startTime: '13:30', endTime: '17:30' },
    { name: 'Ca tối', startTime: '18:00', endTime: '21:00' },
    { name: 'Ca hành chính', startTime: '08:00', endTime: '17:00' },
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

  // ─── 8. Seed Rooms ───────────────────────────────────────────────────────────
  const roomsList = [
    { code: 'PK101', name: 'Phòng khám Nội 101', type: ROOM_TYPE.CLINIC, floor: 'Tầng 1' },
    { code: 'PK102', name: 'Phòng Cận Lâm Sàng Siêu Âm', type: ROOM_TYPE.IMAGING, floor: 'Tầng 1' },
    { code: 'PK103', name: 'Phòng khám Sản Phụ khoa 103', type: ROOM_TYPE.CLINIC, floor: 'Tầng 1' },
    { code: 'PK104', name: 'Phòng khám Nhi 104', type: ROOM_TYPE.CLINIC, floor: 'Tầng 1' },
    { code: 'PK105', name: 'Quầy Lễ Tân & Tiếp Đón', type: ROOM_TYPE.CLINIC, floor: 'Tầng 1' },
    { code: 'PK106', name: 'Phòng Xét Nghiệm Trung Tâm', type: ROOM_TYPE.IMAGING, floor: 'Tầng 1' }
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

  // ─── 9. Seed Resources ────────────────────────────────────────────────────────
  const resourcesList = [
    { code: 'G01', name: 'Ghế khám bệnh đa năng 01', type: 'CHAIR', roomCode: 'PK101' },
    { code: 'G02', name: 'Ghế khám bệnh đa năng 02', type: 'CHAIR', roomCode: 'PK101' },
    { code: 'TB01', name: 'Máy siêu âm 4D Mindray 01', type: 'EQUIPMENT', roomCode: 'PK102' },
    { code: 'G03', name: 'Bàn khám sản chuyên dụng', type: 'CHAIR', roomCode: 'PK103' },
    { code: 'G04', name: 'Giường khám nhi khoa hình thú', type: 'BED', roomCode: 'PK104' },
    { code: 'TB02', name: 'Máy phân tích huyết học tự động', type: 'EQUIPMENT', roomCode: 'PK106' }
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

  // ─── 10. Seed Staff & User accounts ──────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Staff@HIS2026!', PASSWORD_HASH_ROUNDS);

  const staffDataList = [
    {
      staffCode: 'NV0001',
      fullName: 'BS. Trần Hữu Nam',
      dateOfBirth: '1988-06-15',
      gender: PATIENT_GENDER.MALE,
      identityNumber: '037088123456',
      phone: '0988888999',
      email: 'namth@hisdaocare.com',
      address: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      joinDate: '2025-01-01',
      title: STAFF_TITLE.DOCTOR,
      isClinical: true,
      nickname: 'BS Nam TH',
      deptCode: 'DEPT_NOI',
      roomCode: 'PK101',
      cert: {
        certificateNumber: '012345/BYT-CCHN',
        scopeOfPractice: 'Khám bệnh, chữa bệnh chuyên khoa Nội',
      },
      userEmail: 'admin@hisdaocare.com', // uses existing admin user
      useExistingAdmin: true,
      templateShifts: ['Ca sáng', 'Ca chiều'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
      staffCode: 'NV0002',
      fullName: 'ThS.BS. Nguyễn Thị Mai',
      dateOfBirth: '1990-04-20',
      gender: PATIENT_GENDER.FEMALE,
      identityNumber: '037090222333',
      phone: '0987111222',
      email: 'maitn@hisdaocare.com',
      address: 'Giải Phóng, Hai Bà Trưng, Hà Nội',
      joinDate: '2025-03-01',
      title: STAFF_TITLE.DOCTOR,
      isClinical: true,
      nickname: 'BS Mai NT',
      deptCode: 'DEPT_SAN',
      roomCode: 'PK103',
      cert: {
        certificateNumber: '034567/BYT-CCHN',
        scopeOfPractice: 'Khám bệnh, chữa bệnh chuyên khoa Sản phụ khoa',
      },
      userEmail: 'maitn@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.DOCTOR,
      templateShifts: ['Ca sáng', 'Ca chiều'],
      templateDays: ['Monday', 'Wednesday', 'Friday']
    },
    {
      staffCode: 'NV0003',
      fullName: 'BSCKI. Lê Hoàng Long',
      dateOfBirth: '1985-09-12',
      gender: PATIENT_GENDER.MALE,
      identityNumber: '037085333444',
      phone: '0987333444',
      email: 'longlh@hisdaocare.com',
      address: 'Lò Đúc, Hai Bà Trưng, Hà Nội',
      joinDate: '2025-02-15',
      title: STAFF_TITLE.DOCTOR,
      isClinical: true,
      nickname: 'BS Long LH',
      deptCode: 'DEPT_NHI',
      roomCode: 'PK104',
      cert: {
        certificateNumber: '056789/BYT-CCHN',
        scopeOfPractice: 'Khám bệnh, chữa bệnh chuyên khoa Nhi',
      },
      userEmail: 'longlh@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.DOCTOR,
      templateShifts: ['Ca sáng', 'Ca chiều'],
      templateDays: ['Tuesday', 'Thursday', 'Saturday']
    },
    {
      staffCode: 'NV0004',
      fullName: 'BS. Phạm Minh Đức',
      dateOfBirth: '1987-11-30',
      gender: PATIENT_GENDER.MALE,
      identityNumber: '037087444555',
      phone: '0987444555',
      email: 'duchm@hisdaocare.com',
      address: 'Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội',
      joinDate: '2025-05-01',
      title: STAFF_TITLE.DOCTOR,
      isClinical: true,
      nickname: 'BS Đức PM',
      deptCode: 'DEPT_NGOAI',
      roomCode: 'PK101',
      cert: {
        certificateNumber: '078901/BYT-CCHN',
        scopeOfPractice: 'Khám bệnh, chữa bệnh chuyên khoa Ngoại',
      },
      userEmail: 'duchm@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.DOCTOR,
      templateShifts: ['Ca chiều', 'Ca tối'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
      staffCode: 'NV0005',
      fullName: 'BS. Vũ Thị Hồng',
      dateOfBirth: '1992-02-05',
      gender: PATIENT_GENDER.FEMALE,
      identityNumber: '037092555666',
      phone: '0987555666',
      email: 'hongvt@hisdaocare.com',
      address: 'Bạch Mai, Hai Bà Trưng, Hà Nội',
      joinDate: '2025-06-01',
      title: STAFF_TITLE.DOCTOR,
      isClinical: true,
      nickname: 'BS Hồng VT',
      deptCode: 'DEPT_KB',
      roomCode: 'PK101',
      cert: {
        certificateNumber: '090123/BYT-CCHN',
        scopeOfPractice: 'Khám bệnh, chữa bệnh đa khoa',
      },
      userEmail: 'hongvt@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.DOCTOR,
      templateShifts: ['Ca sáng', 'Ca chiều'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
      staffCode: 'NV0006',
      fullName: 'ĐD. Nguyễn Văn Hải',
      dateOfBirth: '1995-08-18',
      gender: PATIENT_GENDER.MALE,
      identityNumber: '037095666777',
      phone: '0987666777',
      email: 'hainv@hisdaocare.com',
      address: 'Minh Khai, Hai Bà Trưng, Hà Nội',
      joinDate: '2025-01-10',
      title: STAFF_TITLE.NURSE,
      isClinical: true,
      deptCode: 'DEPT_NOI',
      roomCode: 'PK101',
      userEmail: 'hainv@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.NURSE,
      templateShifts: ['Ca hành chính'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
      staffCode: 'NV0007',
      fullName: 'ĐD. Trần Thị Thu',
      dateOfBirth: '1997-03-25',
      gender: PATIENT_GENDER.FEMALE,
      identityNumber: '037097777888',
      phone: '0987777888',
      email: 'thutt@hisdaocare.com',
      address: 'Kim Ngưu, Hai Bà Trưng, Hà Nội',
      joinDate: '2025-03-15',
      title: STAFF_TITLE.NURSE,
      isClinical: true,
      deptCode: 'DEPT_SAN',
      roomCode: 'PK103',
      userEmail: 'thutt@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.NURSE,
      templateShifts: ['Ca hành chính'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
      staffCode: 'NV0008',
      fullName: 'KTV. Lê Minh Quân',
      dateOfBirth: '1993-07-30',
      gender: PATIENT_GENDER.MALE,
      identityNumber: '037093888999',
      phone: '0987888999',
      email: 'quanlm@hisdaocare.com',
      address: 'Trương Định, Hai Bà Trưng, Hà Nội',
      joinDate: '2025-02-01',
      title: STAFF_TITLE.TECHNICIAN,
      isClinical: true,
      deptCode: 'DEPT_CDHA',
      roomCode: 'PK102',
      userEmail: 'quanlm@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.TECHNICIAN,
      templateShifts: ['Ca sáng', 'Ca chiều'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    {
      staffCode: 'NV0009',
      fullName: 'KTV. Hoàng Thị Lan',
      dateOfBirth: '1996-05-15',
      gender: PATIENT_GENDER.FEMALE,
      identityNumber: '037096999000',
      phone: '0987999000',
      email: 'lanht@hisdaocare.com',
      address: 'Đại La, Hai Bà Trưng, Hà Nội',
      joinDate: '2025-04-10',
      title: STAFF_TITLE.TECHNICIAN,
      isClinical: true,
      deptCode: 'DEPT_XN',
      roomCode: 'PK106',
      userEmail: 'lanht@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.TECHNICIAN,
      templateShifts: ['Ca hành chính'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
      staffCode: 'NV0010',
      fullName: 'LT. Phạm Ngọc Ánh',
      dateOfBirth: '1998-10-10',
      gender: PATIENT_GENDER.FEMALE,
      identityNumber: '037098000111',
      phone: '0987000111',
      email: 'anhpn@hisdaocare.com',
      address: 'Tương Mai, Hoàng Mai, Hà Nội',
      joinDate: '2025-01-05',
      title: STAFF_TITLE.RECEPTIONIST,
      isClinical: false,
      deptCode: 'DEPT_LT',
      roomCode: 'PK105',
      userEmail: 'anhpn@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.RECEPTION,
      templateShifts: ['Ca sáng'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    {
      staffCode: 'NV0011',
      fullName: 'LT. Nguyễn Thùy Linh',
      dateOfBirth: '1999-12-12',
      gender: PATIENT_GENDER.FEMALE,
      identityNumber: '037099111222',
      phone: '0987111222',
      email: 'linhnt@hisdaocare.com',
      address: 'Mai Động, Hoàng Mai, Hà Nội',
      joinDate: '2025-02-20',
      title: STAFF_TITLE.RECEPTIONIST,
      isClinical: false,
      deptCode: 'DEPT_LT',
      roomCode: 'PK105',
      userEmail: 'linhnt@hisdaocare.com',
      roleName: AUTH_ROLE_NAME.RECEPTION,
      templateShifts: ['Ca chiều'],
      templateDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
  ];

  for (const item of staffDataList) {
    const dept = dbDepts[item.deptCode];
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
      isClinical: item.isClinical,
      isActive: true,
      nickname: item.nickname || null,
      departmentId: dept ? dept.id : null,
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
    if (item.cert && item.isClinical && item.title === STAFF_TITLE.DOCTOR) {
      let cert = await certRepository.findOneBy({ staffId: staff.id });
      if (!cert) {
        cert = certRepository.create({
          staffId: staff.id,
          certificateNumber: item.cert.certificateNumber,
          issuedDate: new Date('2020-01-01'),
          issuedBy: 'Bộ Y Tế',
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

  // ─── 9. Seed Specialties ───────────────────────────────────────────────────
  const specialtiesList = [
    { code: 'NOI', name: 'Nội khoa' },
    { code: 'NGOAI', name: 'Ngoại khoa' },
    { code: 'SAN', name: 'Sản phụ khoa' },
    { code: 'NHI', name: 'Nhi khoa' },
    { code: 'TMH', name: 'Tai Mũi Họng' },
    { code: 'RANGHAM', name: 'Răng Hàm Mặt' },
    { code: 'TIMMACH', name: 'Tim mạch' },
    { code: 'HOHAP', name: 'Hô hấp' },
    { code: 'NOITIET', name: 'Nội tiết' },
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

  // ─── 10. Seed Services ─────────────────────────────────────────────────────
  const servicesList = [
    // --- KHÁM BỆNH ---
    { code: 'DV_KN_NOI', name: 'Khám Nội tổng quát', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NOI', duration: 20, insuranceCode: '01.105', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KN_TIMMACH', name: 'Khám Tim mạch', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'TIMMACH', duration: 30, insuranceCode: '01.201', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KN_NHI', name: 'Khám Nhi khoa', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NHI', duration: 20, insuranceCode: '01.301', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KSK_TQ', name: 'Khám sức khỏe tổng quát', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NOI', duration: 30, insuranceCode: '01.001', listedPrice: 300000, insurancePrice: 220000, vipPrice: 450000 },
    { code: 'DV_KDK', name: 'Khám định kỳ', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NOI', duration: 20, insuranceCode: '01.002', listedPrice: 150000, insurancePrice: 100000, vipPrice: 250000 },
    { code: 'DV_KN_NHI_TQ', name: 'Khám nhi tổng quát', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NHI', duration: 20, insuranceCode: '01.302', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KTT_NHI', name: 'Khám tăng trưởng trẻ em', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NHI', duration: 30, insuranceCode: '01.303', listedPrice: 250000, insurancePrice: 180000, vipPrice: 400000 },
    { code: 'DV_KN_HOHAP', name: 'Khám Hô hấp', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'HOHAP', duration: 20, insuranceCode: '01.202', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KN_NOITIET', name: 'Khám Nội tiết', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NOITIET', duration: 20, insuranceCode: '01.203', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KN_NGOAI_TQ', name: 'Khám Ngoại tổng quát', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NGOAI', duration: 20, insuranceCode: '01.106', listedPrice: 150000, insurancePrice: 100000, vipPrice: 250000 },
    { code: 'DV_KN_CHINH_HINH', name: 'Khám Chấn thương chỉnh hình', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'NGOAI', duration: 20, insuranceCode: '01.107', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_KN_TMH', name: 'Khám Tai Mũi Họng', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'TMH', duration: 20, insuranceCode: '01.405', listedPrice: 150000, insurancePrice: 110000, vipPrice: 250000 },
    { code: 'DV_KN_NHA_TQ', name: 'Khám nha tổng quát', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'RANGHAM', duration: 20, insuranceCode: '01.401', listedPrice: 100000, insurancePrice: 70000, vipPrice: 200000 },
    { code: 'DV_NHA_CHINH', name: 'Chỉnh nha', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'RANGHAM', duration: 40, insuranceCode: '01.402', listedPrice: 500000, insurancePrice: 400000, vipPrice: 800000 },
    { code: 'DV_NHA_IMPLANT', name: 'Cấy ghép Implant', category: SERVICE_CATEGORY.EXAMINATION, specialty: 'RANGHAM', duration: 60, insuranceCode: '01.403', listedPrice: 1500000, insurancePrice: 1200000, vipPrice: 2500000 },

    // --- XÉT NGHIỆM ---
    // Huyết học
    { code: 'DV_XN_CBC', name: 'Tổng phân tích tế bào máu ngoại vi - CBC', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.002', listedPrice: 80000, insurancePrice: 60000, vipPrice: 120000 },
    { code: 'DV_XN_DONGMAU', name: 'Đông máu cơ bản PT/APTT/INR', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.003', listedPrice: 120000, insurancePrice: 90000, vipPrice: 180000 },
    // Sinh hóa
    { code: 'DV_XN_GAN_AST', name: 'Định lượng AST - SGOT', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.004', listedPrice: 50000, insurancePrice: 40000, vipPrice: 80000 },
    { code: 'DV_XN_GAN_ALT', name: 'Định lượng ALT - SGPT', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.005', listedPrice: 50000, insurancePrice: 40000, vipPrice: 80000 },
    { code: 'DV_XN_GAN_GGT', name: 'Định lượng GGT', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.006', listedPrice: 60000, insurancePrice: 45000, vipPrice: 90000 },
    { code: 'DV_XN_GAN_BILI', name: 'Định lượng Bilirubin toàn phần', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.007', listedPrice: 50000, insurancePrice: 38000, vipPrice: 80000 },
    { code: 'DV_XN_URE', name: 'Định lượng Ure', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.008', listedPrice: 45000, insurancePrice: 35000, vipPrice: 70000 },
    { code: 'DV_XN_CREATININ', name: 'Định lượng Creatinin', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.009', listedPrice: 45000, insurancePrice: 35000, vipPrice: 70000 },
    { code: 'DV_XN_EGFR', name: 'Định lượng mức lọc cầu thận - eGFR', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.016', listedPrice: 50000, insurancePrice: 40000, vipPrice: 80000 },
    { code: 'DV_XN_GLUCOSE', name: 'Định lượng Glucose máu', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.010', listedPrice: 40000, insurancePrice: 30000, vipPrice: 60000 },
    { code: 'DV_XN_HBA1C', name: 'Định lượng HbA1c', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.011', listedPrice: 150000, insurancePrice: 120000, vipPrice: 220000 },
    { code: 'DV_XN_CHOL', name: 'Định lượng Cholesterol toàn phần', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.012', listedPrice: 50000, insurancePrice: 40000, vipPrice: 80000 },
    { code: 'DV_XN_TRIGLY', name: 'Định lượng Triglycerid', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.013', listedPrice: 50000, insurancePrice: 40000, vipPrice: 80000 },
    { code: 'DV_XN_HDL', name: 'Định lượng HDL-Cholesterol', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.017', listedPrice: 60000, insurancePrice: 45000, vipPrice: 90000 },
    { code: 'DV_XN_LDL', name: 'Định lượng LDL-Cholesterol', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.018', listedPrice: 60000, insurancePrice: 45000, vipPrice: 90000 },
    { code: 'DV_XN_URIC', name: 'Định lượng Acid Uric', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.014', listedPrice: 50000, insurancePrice: 40000, vipPrice: 80000 },
    // Miễn dịch
    { code: 'DV_XN_CRP', name: 'Định lượng CRP (C-Reactive Protein)', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.019', listedPrice: 120000, insurancePrice: 90000, vipPrice: 180000 },
    { code: 'DV_XN_PCT', name: 'Định lượng Procalcitonin', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 10, insuranceCode: 'XN.020', listedPrice: 350000, insurancePrice: 280000, vipPrice: 500000 },
    { code: 'DV_XN_TSH', name: 'Định lượng TSH', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 10, insuranceCode: 'XN.021', listedPrice: 100000, insurancePrice: 80000, vipPrice: 150000 },
    { code: 'DV_XN_FT3', name: 'Định lượng FT3', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 10, insuranceCode: 'XN.022', listedPrice: 100000, insurancePrice: 80000, vipPrice: 150000 },
    { code: 'DV_XN_FT4', name: 'Định lượng FT4', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 10, insuranceCode: 'XN.023', listedPrice: 100000, insurancePrice: 80000, vipPrice: 150000 },
    // Nước tiểu / Vi sinh
    { code: 'DV_XN_NUOCTIEU_10', name: 'Tổng phân tích nước tiểu 10 thông số', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 5, insuranceCode: 'XN.015', listedPrice: 60000, insurancePrice: 45000, vipPrice: 90000 },
    { code: 'DV_XN_CAY_NUOCTIEU', name: 'Cấy nước tiểu tìm vi khuẩn & Kháng sinh đồ', category: SERVICE_CATEGORY.LAB_TEST, specialty: 'NOI', duration: 120, insuranceCode: 'XN.024', listedPrice: 250000, insurancePrice: 180000, vipPrice: 350000 },

    // --- CHẨN ĐOÁN HÌNH ẢNH ---
    // X-quang
    { code: 'DV_XQ_NGUC', name: 'X-quang ngực thẳng', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 10, insuranceCode: 'XQ.001', listedPrice: 120000, insurancePrice: 90000, vipPrice: 180000 },
    { code: 'DV_XQ_NGUC_NGHIENG', name: 'X-quang ngực nghiêng', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 10, insuranceCode: 'XQ.004', listedPrice: 120000, insurancePrice: 90000, vipPrice: 180000 },
    { code: 'DV_XQ_COTSONG_CO', name: 'X-quang cột sống cổ', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 10, insuranceCode: 'XQ.002', listedPrice: 140000, insurancePrice: 110000, vipPrice: 200000 },
    { code: 'DV_XQ_COTSONG_NGUC', name: 'X-quang cột sống ngực', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 10, insuranceCode: 'XQ.005', listedPrice: 140000, insurancePrice: 110000, vipPrice: 200000 },
    { code: 'DV_XQ_COTSONG_TL', name: 'X-quang cột sống thắt lưng', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 10, insuranceCode: 'XQ.003', listedPrice: 140000, insurancePrice: 110000, vipPrice: 200000 },
    { code: 'DV_XQ_COTAY', name: 'X-quang cổ tay', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 10, insuranceCode: 'XQ.006', listedPrice: 120000, insurancePrice: 90000, vipPrice: 180000 },
    { code: 'DV_XQ_COCHAN', name: 'X-quang cổ chân', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 10, insuranceCode: 'XQ.007', listedPrice: 120000, insurancePrice: 90000, vipPrice: 180000 },
    { code: 'DV_XQ_PANO', name: 'X-quang răng Panorama (Toàn cảnh)', category: SERVICE_CATEGORY.IMAGING, specialty: 'RANGHAM', duration: 15, insuranceCode: 'XQ.008', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_XQ_CEPHALO', name: 'X-quang răng Cephalometric', category: SERVICE_CATEGORY.IMAGING, specialty: 'RANGHAM', duration: 15, insuranceCode: 'XQ.009', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_XQ_BITEWING', name: 'X-quang răng Bitewing (Cánh cắn)', category: SERVICE_CATEGORY.IMAGING, specialty: 'RANGHAM', duration: 10, insuranceCode: 'XQ.010', listedPrice: 80000, insurancePrice: 60000, vipPrice: 120000 },
    { code: 'DV_XQ_PERIAPICAL', name: 'X-quang răng quanh chóp (Periapical)', category: SERVICE_CATEGORY.IMAGING, specialty: 'RANGHAM', duration: 10, insuranceCode: 'XQ.011', listedPrice: 50000, insurancePrice: 35000, vipPrice: 80000 },
    // Siêu âm
    { code: 'DV_SIEAM_BNG', name: 'Siêu âm bụng tổng quát', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 20, insuranceCode: '35.01', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_SA_GAN_MAT', name: 'Siêu âm gan mật chuyên sâu', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 15, insuranceCode: 'SA.004', listedPrice: 150000, insurancePrice: 110000, vipPrice: 220000 },
    { code: 'DV_SA_THAN_TIETNIEU', name: 'Siêu âm thận tiết niệu', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 15, insuranceCode: 'SA.005', listedPrice: 150000, insurancePrice: 110000, vipPrice: 220000 },
    { code: 'DV_SA_GIAP', name: 'Siêu âm tuyến giáp', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 15, insuranceCode: 'SA.001', listedPrice: 150000, insurancePrice: 110000, vipPrice: 220000 },
    { code: 'DV_SA_VU', name: 'Siêu âm vú hai bên', category: SERVICE_CATEGORY.IMAGING, specialty: 'SAN', duration: 15, insuranceCode: 'SA.002', listedPrice: 180000, insurancePrice: 130000, vipPrice: 270000 },
    { code: 'DV_SA_TIM', name: 'Siêu âm tim Doppler màu', category: SERVICE_CATEGORY.IMAGING, specialty: 'TIMMACH', duration: 30, insuranceCode: 'SA.003', listedPrice: 350000, insurancePrice: 280000, vipPrice: 500000 },
    { code: 'DV_SA_THAI', name: 'Siêu âm thai Doppler màu', category: SERVICE_CATEGORY.IMAGING, specialty: 'SAN', duration: 25, insuranceCode: 'SA.006', listedPrice: 250000, insurancePrice: 180000, vipPrice: 380000 },
    { code: 'DV_SA_PHU_KHOA', name: 'Siêu âm phụ khoa (Đầu dò âm đạo)', category: SERVICE_CATEGORY.IMAGING, specialty: 'SAN', duration: 20, insuranceCode: 'SA.007', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    // CT
    { code: 'DV_CT_SO_NAO', name: 'Chụp CT sọ não không cản quang', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 20, insuranceCode: 'CT.001', listedPrice: 800000, insurancePrice: 600000, vipPrice: 1200000 },
    { code: 'DV_CT_XOANG', name: 'Chụp CT xoang', category: SERVICE_CATEGORY.IMAGING, specialty: 'TMH', duration: 20, insuranceCode: 'CT.002', listedPrice: 800000, insurancePrice: 600000, vipPrice: 1200000 },
    { code: 'DV_CT_NGUC', name: 'Chụp CT lồng ngực', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 25, insuranceCode: 'CT.003', listedPrice: 1200000, insurancePrice: 900000, vipPrice: 1800000 },
    { code: 'DV_CT_BUNG', name: 'Chụp CT ổ bụng', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 25, insuranceCode: 'CT.004', listedPrice: 1200000, insurancePrice: 900000, vipPrice: 1800000 },
    { code: 'DV_CTA_NAO', name: 'Chụp CTA mạch máu não', category: SERVICE_CATEGORY.IMAGING, specialty: 'TIMMACH', duration: 30, insuranceCode: 'CT.005', listedPrice: 1800000, insurancePrice: 1400000, vipPrice: 2500000 },
    { code: 'DV_CTA_VANH', name: 'Chụp CTA động mạch vành', category: SERVICE_CATEGORY.IMAGING, specialty: 'TIMMACH', duration: 40, insuranceCode: 'CT.006', listedPrice: 2200000, insurancePrice: 1700000, vipPrice: 3000000 },
    // MRI
    { code: 'DV_MRI_NAO', name: 'Chụp MRI sọ não không cản từ', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 30, insuranceCode: 'MR.001', listedPrice: 1800000, insurancePrice: 1400000, vipPrice: 2500000 },
    { code: 'DV_MRI_CS_CO', name: 'Chụp MRI cột sống cổ', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 30, insuranceCode: 'MR.002', listedPrice: 1800000, insurancePrice: 1400000, vipPrice: 2500000 },
    { code: 'DV_MRI_CS_TL', name: 'Chụp MRI cột sống thắt lưng', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 30, insuranceCode: 'MR.003', listedPrice: 1800000, insurancePrice: 1400000, vipPrice: 2500000 },
    { code: 'DV_MRI_KHOP_GOI', name: 'Chụp MRI khớp gối', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 30, insuranceCode: 'MR.004', listedPrice: 2000000, insurancePrice: 1500000, vipPrice: 2800000 },
    { code: 'DV_MRI_KHOP_VAI', name: 'Chụp MRI khớp vai', category: SERVICE_CATEGORY.IMAGING, specialty: 'NGOAI', duration: 30, insuranceCode: 'MR.005', listedPrice: 2000000, insurancePrice: 1500000, vipPrice: 2800000 },
    { code: 'DV_MRI_GAN', name: 'Chụp MRI gan chuyên sâu', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 35, insuranceCode: 'MR.006', listedPrice: 2200000, insurancePrice: 1700000, vipPrice: 3000000 },
    { code: 'DV_MRI_TUY', name: 'Chụp MRI tụy', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 35, insuranceCode: 'MR.007', listedPrice: 2200000, insurancePrice: 1700000, vipPrice: 3000000 },
    // Nội soi
    { code: 'DV_NS_DADA_Y', name: 'Nội soi dạ dày ống mềm', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 20, insuranceCode: 'NS.001', listedPrice: 600000, insurancePrice: 450000, vipPrice: 900000 },
    { code: 'DV_NS_DAITRANG', name: 'Nội soi đại tràng ống mềm', category: SERVICE_CATEGORY.IMAGING, specialty: 'NOI', duration: 30, insuranceCode: 'NS.002', listedPrice: 900000, insurancePrice: 700000, vipPrice: 1300000 },
    { code: 'DV_NS_TMH', name: 'Nội soi tai mũi họng', category: SERVICE_CATEGORY.IMAGING, specialty: 'TMH', duration: 15, insuranceCode: 'NS.003', listedPrice: 200000, insurancePrice: 160000, vipPrice: 300000 },

    // --- THĂM DÒ CHỨC NĂNG ---
    { code: 'DV_TDCN_ECG', name: 'Điện tim thường (ECG 12 chuyển đạo)', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'TIMMACH', duration: 15, insuranceCode: 'TD.001', listedPrice: 100000, insurancePrice: 75000, vipPrice: 150000 },
    { code: 'DV_TDCN_HOLTER24', name: 'Điện tim Holter 24 giờ', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'TIMMACH', duration: 30, insuranceCode: 'TD.002', listedPrice: 500000, insurancePrice: 400000, vipPrice: 750000 },
    { code: 'DV_TDCN_HOLTER48', name: 'Điện tim Holter 48 giờ', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'TIMMACH', duration: 30, insuranceCode: 'TD.003', listedPrice: 800000, insurancePrice: 650000, vipPrice: 1100000 },
    { code: 'DV_TDCN_HOLTER_HA', name: 'Theo dõi huyết áp liên tục 24 giờ (Holter huyết áp)', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'TIMMACH', duration: 30, insuranceCode: 'TD.004', listedPrice: 400000, insurancePrice: 320000, vipPrice: 600000 },
    { code: 'DV_TDCN_SPIRO', name: 'Đo chức năng thông khí phổi (Hô hấp ký)', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'HOHAP', duration: 20, insuranceCode: 'TD.005', listedPrice: 150000, insurancePrice: 110000, vipPrice: 220000 },
    { code: 'DV_TDCN_POLY', name: 'Đo đa ký hô hấp chẩn đoán ngưng thở khi ngủ', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'HOHAP', duration: 40, insuranceCode: 'TD.006', listedPrice: 1200000, insurancePrice: 900000, vipPrice: 1800000 },
    { code: 'DV_TDCN_PSG', name: 'Đo đa ký giấc ngủ (Polysomnography)', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'HOHAP', duration: 60, insuranceCode: 'TD.007', listedPrice: 2000000, insurancePrice: 1500000, vipPrice: 3000000 },
    { code: 'DV_TDCN_EEG', name: 'Điện não đồ (EEG)', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NOI', duration: 30, insuranceCode: 'TD.008', listedPrice: 200000, insurancePrice: 150000, vipPrice: 300000 },
    { code: 'DV_TDCN_EMG', name: 'Điện cơ và tốc độ dẫn truyền thần kinh (EMG)', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NOI', duration: 30, insuranceCode: 'TD.009', listedPrice: 300000, insurancePrice: 220000, vipPrice: 450000 },

    // --- THỦ THUẬT ---
    { code: 'DV_TT_LAYCAORANG', name: 'Lấy cao răng và đánh bóng', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'RANGHAM', duration: 30, insuranceCode: 'TT.001', listedPrice: 150000, insurancePrice: 100000, vipPrice: 250000 },
    { code: 'DV_TT_NHORANG_SUA', name: 'Nhổ răng sữa bôi/tê', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'RANGHAM', duration: 15, insuranceCode: 'TT.002', listedPrice: 50000, insurancePrice: 30000, vipPrice: 100000 },
    { code: 'DV_TT_NHORANG_KHON', name: 'Nhổ răng khôn mọc lệch', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'RANGHAM', duration: 45, insuranceCode: 'TT.003', listedPrice: 1000000, insurancePrice: 800000, vipPrice: 1500000 },
    { code: 'DV_TT_TRAMRANG', name: 'Trám răng thẩm mỹ Composite', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'RANGHAM', duration: 20, insuranceCode: 'TT.004', listedPrice: 200000, insurancePrice: 150000, vipPrice: 350000 },
    { code: 'DV_TT_NOISOI_TMH', name: 'Nội soi Tai Mũi Họng ống cứng', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'TMH', duration: 15, insuranceCode: 'TT.005', listedPrice: 200000, insurancePrice: 160000, vipPrice: 300000 },
    { code: 'DV_TT_HUTDICH_MUI', name: 'Hút dịch mũi bằng máy', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'TMH', duration: 10, insuranceCode: 'TT.006', listedPrice: 50000, insurancePrice: 35000, vipPrice: 100000 },
    { code: 'DV_TT_KHAUVT', name: 'Khâu vết thương phần mềm dưới 5cm', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NGOAI', duration: 30, insuranceCode: 'TT.007', listedPrice: 300000, insurancePrice: 220000, vipPrice: 500000 },
    { code: 'DV_TT_CATCHI', name: 'Cắt chỉ vết thương', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NGOAI', duration: 10, insuranceCode: 'TT.008', listedPrice: 50000, insurancePrice: 30000, vipPrice: 100000 },
    { code: 'DV_TT_CAT_NOTRUOI', name: 'Cắt nốt ruồi bằng Laser/Tiểu phẫu', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NGOAI', duration: 20, insuranceCode: 'TT.009', listedPrice: 200000, insurancePrice: 150000, vipPrice: 350000 },
    { code: 'DV_TT_SINHTHIET_DA', name: 'Sinh thiết da chẩn đoán u/bệnh lý', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NGOAI', duration: 30, insuranceCode: 'TT.010', listedPrice: 400000, insurancePrice: 300000, vipPrice: 600000 },
    { code: 'DV_TT_CAT_NANGBA', name: 'Tiểu phẫu cắt nang bã/u bã đậu', category: SERVICE_CATEGORY.PROCEDURE, specialty: 'NGOAI', duration: 30, insuranceCode: 'TT.011', listedPrice: 500000, insurancePrice: 380000, vipPrice: 750000 },

    // --- PHẦN PHẪU THUẬT & CAN THIỆP ---
    { code: 'DV_PT_CAT_U', name: 'Phẫu thuật cắt u lành phần mềm lớn', category: SERVICE_CATEGORY.SURGERY, specialty: 'NGOAI', duration: 60, insuranceCode: 'PT.001', listedPrice: 2000000, insurancePrice: 1600000, vipPrice: 3500000 },
    { code: 'DV_PT_THOATVI', name: 'Phẫu thuật khâu/tái tạo thoát vị bẹn', category: SERVICE_CATEGORY.SURGERY, specialty: 'NGOAI', duration: 90, insuranceCode: 'PT.002', listedPrice: 4000000, insurancePrice: 3200000, vipPrice: 6000000 },
    { code: 'DV_PT_KETHOP_XUONG', name: 'Phẫu thuật kết hợp xương chi', category: SERVICE_CATEGORY.SURGERY, specialty: 'NGOAI', duration: 120, insuranceCode: 'PT.003', listedPrice: 6000000, insurancePrice: 4800000, vipPrice: 9000000 },
    { code: 'DV_PT_STENT', name: 'Can thiệp nong & đặt Stent động mạch vành', category: SERVICE_CATEGORY.SURGERY, specialty: 'TIMMACH', duration: 90, insuranceCode: 'PT.004', listedPrice: 15000000, insurancePrice: 12000000, vipPrice: 22000000 },
    { code: 'DV_PT_NS_PHEQUAN', name: 'Nội soi phế quản sinh thiết/can thiệp', category: SERVICE_CATEGORY.SURGERY, specialty: 'HOHAP', duration: 45, insuranceCode: 'PT.005', listedPrice: 1500000, insurancePrice: 1100000, vipPrice: 2500000 },
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

  // ─── 11. Seed ICD-10 ───────────────────────────────────────────────────────
  const icd10List = [
    { code: 'J06', name: 'Nhiễm trùng hô hấp trên cấp tính', nameEn: 'Acute upper respiratory infections', specialty: 'NOI' },
    { code: 'K29', name: 'Viêm dạ dày và tá tràng', nameEn: 'Gastritis and duodenitis', specialty: 'NOI' },
    { code: 'I10', name: 'Tăng huyết áp nguyên phát', nameEn: 'Essential hypertension', specialty: 'TIMMACH' },
    { code: 'E11', name: 'Đái tháo đường týp 2', nameEn: 'Type 2 diabetes mellitus', specialty: 'NOI' },
    { code: 'J18', name: 'Viêm phổi không đặc hiệu', nameEn: 'Pneumonia, unspecified organism', specialty: 'NOI' },
    { code: 'H66', name: 'Viêm tai giữa có mủ và các thể liên quan', nameEn: 'Suppurative and unspecified otitis media', specialty: 'TMH' },
    { code: 'K02', name: 'Sâu răng', nameEn: 'Dental caries', specialty: 'RANGHAM' },
    { code: 'P07', name: 'Rối loạn liên quan đến thai kỳ ngắn và trọng lượng thấp khi sinh', nameEn: 'Disorders related to short gestation', specialty: 'SAN' },
    { code: 'A09', name: 'Tiêu chảy và viêm dạ dày ruột', nameEn: 'Diarrhoea and gastroenteritis', specialty: 'NHI' },
    { code: 'G43', name: 'Đau nửa đầu', nameEn: 'Migraine', specialty: 'NOI' },
    
    // Expanded ICD-10 Codes
    { code: 'Z00', name: 'Khám sức khỏe tổng quát', nameEn: 'General examination and investigation of persons without complaint or reported diagnosis', specialty: 'NOI' },
    { code: 'Z01', name: 'Khám chuyên khoa định kỳ', nameEn: 'Other special examinations and investigations of persons without complaint or reported diagnosis', specialty: 'NOI' },
    { code: 'M17', name: 'Thoái hóa khớp gối', nameEn: 'Gonarthrosis [arthrosis of knee]', specialty: 'NGOAI' },
    { code: 'K05', name: 'Viêm lợi và bệnh nha chu', nameEn: 'Gingivitis and periodontal diseases', specialty: 'RANGHAM' },
    { code: 'J30', name: 'Viêm mũi dị ứng và vận mạch', nameEn: 'Vasomotor and allergic rhinitis', specialty: 'TMH' },
    { code: 'I15', name: 'Tăng huyết áp thứ phát', nameEn: 'Secondary hypertension', specialty: 'TIMMACH' },
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

  // ─── 12. Seed Medications ──────────────────────────────────────────────────
  const medicationsList = [
    {
      code: 'TH_PARACET_500',
      nationalCode: 'VD-12345-12',
      name: 'Paracetamol 500mg',
      activeIngredient: 'Paracetamol',
      concentration: '500mg',
      unit: 'Viên',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '4000mg/ngày',
      groupName: 'Giảm đau - Hạ sốt',
    },
    {
      code: 'TH_AMOX_500',
      nationalCode: 'VD-23456-14',
      name: 'Amoxicillin 500mg',
      activeIngredient: 'Amoxicillin',
      concentration: '500mg',
      unit: 'Viên nang',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '3000mg/ngày',
      groupName: 'Kháng sinh',
    },
    {
      code: 'TH_OMEPRA_20',
      nationalCode: 'VD-34567-15',
      name: 'Omeprazole 20mg',
      activeIngredient: 'Omeprazole',
      concentration: '20mg',
      unit: 'Viên',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '40mg/ngày',
      groupName: 'Tiêu hóa - Dạ dày',
    },
    {
      code: 'TH_AMLO_5',
      nationalCode: 'VD-45678-16',
      name: 'Amlodipine 5mg',
      activeIngredient: 'Amlodipine besylate',
      concentration: '5mg',
      unit: 'Viên',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '10mg/ngày',
      groupName: 'Tim mạch - Huyết áp',
    },
    {
      code: 'TH_METFORM_500',
      nationalCode: 'VD-56789-17',
      name: 'Metformin 500mg',
      activeIngredient: 'Metformin hydrochloride',
      concentration: '500mg',
      unit: 'Viên',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '2000mg/ngày',
      groupName: 'Nội tiết - Đái tháo đường',
    },

    // Expanded Medications
    {
      code: 'TH_CEFU_500',
      nationalCode: 'VD-67890-18',
      name: 'Cefuroxime 500mg',
      activeIngredient: 'Cefuroxime',
      concentration: '500mg',
      unit: 'Viên',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '1000mg/ngày',
      groupName: 'Kháng sinh',
    },
    {
      code: 'TH_AUG_1G',
      nationalCode: 'VN-12345-20',
      name: 'Augmentin 1g',
      activeIngredient: 'Amoxicillin + Clavulanic acid',
      concentration: '1000mg',
      unit: 'Viên',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '2000mg/ngày',
      groupName: 'Kháng sinh',
    },
    {
      code: 'TH_IBU_400',
      nationalCode: 'VD-78901-19',
      name: 'Ibuprofen 400mg',
      activeIngredient: 'Ibuprofen',
      concentration: '400mg',
      unit: 'Viên',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '1200mg/ngày',
      groupName: 'Giảm đau - Kháng viêm',
    },
    {
      code: 'TH_PARACET_SUI',
      nationalCode: 'VD-89012-20',
      name: 'Efferalgan 500mg (Sủi)',
      activeIngredient: 'Paracetamol',
      concentration: '500mg',
      unit: 'Viên sủi',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '4000mg/ngày',
      groupName: 'Giảm đau - Hạ sốt',
    },
    {
      code: 'TH_PRED_5',
      nationalCode: 'VD-90123-21',
      name: 'Prednisolone 5mg',
      activeIngredient: 'Prednisolone',
      concentration: '5mg',
      unit: 'Viên',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '60mg/ngày',
      groupName: 'Kháng viêm Steroid',
    },
    {
      code: 'TH_METH_16',
      nationalCode: 'VD-01234-22',
      name: 'Medrol 16mg',
      activeIngredient: 'Methylprednisolone',
      concentration: '16mg',
      unit: 'Viên',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '64mg/ngày',
      groupName: 'Kháng viêm Steroid',
    },
    {
      code: 'TH_ESO_40',
      nationalCode: 'VN-23456-22',
      name: 'Nexium 40mg',
      activeIngredient: 'Esomeprazole',
      concentration: '40mg',
      unit: 'Viên',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '40mg/ngày',
      groupName: 'Tiêu hóa - Dạ dày',
    },
    {
      code: 'TH_ENA_5',
      nationalCode: 'VD-34567-23',
      name: 'Enalapril 5mg',
      activeIngredient: 'Enalapril',
      concentration: '5mg',
      unit: 'Viên',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '40mg/ngày',
      groupName: 'Tim mạch - Huyết áp',
    },
    {
      code: 'TH_GLI_60',
      nationalCode: 'VN-45678-24',
      name: 'Diamicron MR 60mg',
      activeIngredient: 'Gliclazide',
      concentration: '60mg',
      unit: 'Viên',
      usageUnit: 'mg',
      routeOfAdministration: MEDICATION_ROUTE.ORAL,
      maxDosePerDay: '120mg/ngày',
      groupName: 'Nội tiết - Đái tháo đường',
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
  console.log('🌱 Seeding Form Templates...');
  const formTemplateRepository = AppDataSource.getRepository(FormTemplateOrmEntity);
  const formTemplatesList = [
    {
      name: 'Mẫu hóa đơn thanh toán chi phí',
      code: 'INVOICE_TEMPLATE',
      type: FORM_TEMPLATE_TYPE.PRINT_TEMPLATE,
      category: FORM_TEMPLATE_CATEGORY.INVOICE,
      htmlContent: `<div class="print-container" style="font-family: 'Inter', sans-serif; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 20px; box-sizing: border-box; background: white;">
  <div class="header" style="display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px;">
    <div>
      <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #059669;">{{organizationName}}</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563; font-weight: 500;">{{branchName}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Địa chỉ: {{branchAddress}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Hotline: {{branchHotline}}</p>
    </div>
    <div style="text-align: right;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #111827;">HÓA ĐƠN THANH TOÁN</h3>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #ef4444; font-weight: 600;">Số: {{invoiceCode}}</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">Ngày: {{dateTime}}</p>
    </div>
  </div>

  <div class="patient-info" style="margin-bottom: 20px; font-size: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
    <div><strong>Họ tên bệnh nhân:</strong> <span style="text-transform: uppercase; font-weight: 600;">{{patientName}}</span></div>
    <div><strong>Mã bệnh nhân:</strong> {{patientCode}}</div>
    <div><strong>Ngày sinh:</strong> {{patientDob}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <strong>Giới tính:</strong> {{patientGender}}</div>
    <div><strong>Số điện thoại:</strong> {{patientPhone}}</div>
    <div style="grid-column: span 2;"><strong>Địa chỉ:</strong> {{patientAddress}}</div>
  </div>

  <table class="services-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
    <thead>
      <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb; text-align: left;">
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 40px; text-align: center;">STT</th>
        <th style="padding: 8px; font-weight: 600; color: #374151;">Tên dịch vụ</th>
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 60px; text-align: center;">SL</th>
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 100px; text-align: right;">Đơn giá (đ)</th>
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 120px; text-align: right;">Thành tiền (đ)</th>
      </tr>
    </thead>
    <tbody>
      {{serviceRows}}
    </tbody>
  </table>

  <div class="summary" style="margin-left: auto; width: 300px; font-size: 13px; margin-bottom: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
      <span>Tổng chi phí:</span>
      <span style="font-weight: 600;">{{totalAmount}} đ</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
      <span>Miễn giảm/BHYT:</span>
      <span style="font-weight: 600; color: #10b981;">- {{discountAmount}} đ</span>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; border-top: 1px dashed #d1d5db; padding-top: 6px; margin-top: 6px;">
      <span style="color: #059669;">Thực thu:</span>
      <span style="color: #059669;">{{payableAmount}} đ</span>
    </div>
  </div>

  <div style="font-size: 12px; font-style: italic; margin-bottom: 30px;">
    <strong>Bằng chữ:</strong> {{amountInWords}}
  </div>

  <div class="footer-signatures" style="display: flex; justify-content: space-between; text-align: center; font-size: 13px; margin-top: 40px; padding: 0 40px;">
    <div>
      <strong>Người nộp tiền</strong><br>
      <span style="font-size: 11px; color: #6b7280;">(Ký, ghi rõ họ tên)</span>
      <div style="height: 60px;"></div>
    </div>
    <div>
      <strong>Thu ngân</strong><br>
      <span style="font-size: 11px; color: #6b7280;">(Ký, đóng dấu)</span>
      <div style="height: 60px;"></div>
      <strong style="color: #111827;">{{cashierName}}</strong>
    </div>
  </div>
</div>`,
      description: 'Mẫu hóa đơn chi phí dịch vụ khám chữa bệnh của phòng khám',
      isActive: true,
    },
    {
      name: 'Mẫu đơn thuốc điện tử',
      code: 'PRESCRIPTION_TEMPLATE',
      type: FORM_TEMPLATE_TYPE.PRINT_TEMPLATE,
      category: FORM_TEMPLATE_CATEGORY.PRESCRIPTION,
      htmlContent: `<div class="print-container" style="font-family: 'Inter', sans-serif; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 20px; box-sizing: border-box; background: white;">
  <div class="header" style="display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px;">
    <div>
      <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #059669;">{{organizationName}}</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563; font-weight: 500;">{{branchName}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Địa chỉ: {{branchAddress}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Điện thoại: {{branchHotline}}</p>
    </div>
    <div style="text-align: right;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">ĐƠN THUỐC ĐIỆN TỬ</h3>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Mã đơn: DT-{{patientCode}}</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">Ngày kê: {{dateTime}}</p>
    </div>
  </div>

  <div class="patient-info" style="margin-bottom: 15px; font-size: 13px; display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 8px;">
    <div style="grid-column: span 1;"><strong>Họ tên:</strong> <span style="text-transform: uppercase; font-weight: 600;">{{patientName}}</span></div>
    <div><strong>Tuổi/Năm sinh:</strong> {{patientDob}}</div>
    <div><strong>Giới tính:</strong> {{patientGender}}</div>
    <div style="grid-column: span 1;"><strong>SĐT:</strong> {{patientPhone}}</div>
    <div style="grid-column: span 2;"><strong>Địa chỉ:</strong> {{patientAddress}}</div>
    <div style="grid-column: span 3; border-top: 1px dashed #e5e7eb; padding-top: 8px; margin-top: 4px;"><strong>Chẩn đoán:</strong> {{diagnosis}}</div>
  </div>

  <div style="font-size: 14px; font-weight: 700; color: #059669; margin: 15px 0 8px 0; border-bottom: 1px solid #10b981; padding-bottom: 4px;">CHỈ ĐỊNH DÙNG THUỐC</div>
  <table class="medications-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
    <thead>
      <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; text-align: left;">
        <th style="padding: 6px 8px; font-weight: 600; color: #374151; width: 40px; text-align: center;">STT</th>
        <th style="padding: 6px 8px; font-weight: 600; color: #374151;">Tên thuốc, Hàm lượng, Đường dùng</th>
        <th style="padding: 6px 8px; font-weight: 600; color: #374151; width: 80px; text-align: center;">Số lượng</th>
      </tr>
    </thead>
    <tbody>
      {{medicationRows}}
    </tbody>
  </table>

  <div style="font-size: 12px; color: #4b5563; line-height: 1.5; margin-bottom: 35px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
    <strong>Lời dặn của bác sĩ:</strong> Uống thuốc đúng giờ, đúng liều. Tránh ăn đồ cay nóng, nhiều dầu mỡ. Tái khám sau 7 ngày hoặc khi có dấu hiệu bất thường. Mang theo đơn thuốc này khi tái khám.
  </div>

  <div class="footer-signatures" style="display: flex; justify-content: flex-end; text-align: center; font-size: 13px;">
    <div style="width: 250px;">
      <p style="margin: 0; font-size: 11px; color: #6b7280;">Hà Nội, ngày {{dateTime}}</p>
      <strong style="display: block; margin-top: 5px;">Bác sĩ điều trị</strong>
      <span style="font-size: 11px; color: #6b7280;">(Ký, ghi rõ họ tên)</span>
      <div style="height: 70px;"></div>
      <strong style="color: #111827;">{{doctorName}}</strong>
    </div>
  </div>
</div>`,
      description: 'Mẫu đơn thuốc điện tử chuẩn quy định Bộ Y Tế',
      isActive: true,
    },
    {
      name: 'Mẫu phiếu kết quả xét nghiệm',
      code: 'LAB_RESULT_TEMPLATE',
      type: FORM_TEMPLATE_TYPE.PRINT_TEMPLATE,
      category: FORM_TEMPLATE_CATEGORY.LAB_RESULT,
      htmlContent: `<div class="print-container" style="font-family: 'Inter', sans-serif; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 20px; box-sizing: border-box; background: white;">
  <div class="header" style="display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px;">
    <div>
      <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #059669;">{{organizationName}}</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563; font-weight: 500;">{{branchName}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Địa chỉ: {{branchAddress}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Điện thoại: {{branchHotline}}</p>
    </div>
    <div style="text-align: right;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">PHIẾU KẾT QUẢ XÉT NGHIỆM</h3>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Mã KQ: XN-{{patientCode}}</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">Ngày XN: {{dateTime}}</p>
    </div>
  </div>

  <div class="patient-info" style="margin-bottom: 20px; font-size: 13px; display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 8px;">
    <div><strong>Bệnh nhân:</strong> <span style="text-transform: uppercase; font-weight: 600;">{{patientName}}</span></div>
    <div><strong>Năm sinh:</strong> {{patientDob}}</div>
    <div><strong>Giới tính:</strong> {{patientGender}}</div>
    <div><strong>SĐT:</strong> {{patientPhone}}</div>
    <div style="grid-column: span 2;"><strong>Chỉ định bởi:</strong> {{doctorName}}</div>
    <div style="grid-column: span 3; border-top: 1px dashed #e5e7eb; padding-top: 8px; margin-top: 4px;"><strong>Chẩn đoán lâm sàng:</strong> {{diagnosis}}</div>
  </div>

  <table class="results-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
    <thead>
      <tr style="background-color: #f3f4f6; border-bottom: 2px solid #e5e7eb; text-align: left;">
        <th style="padding: 8px; font-weight: 600; color: #374151;">Tên xét nghiệm</th>
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 120px; text-align: center;">Kết quả</th>
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 100px; text-align: center;">Đơn vị</th>
        <th style="padding: 8px; font-weight: 600; color: #374151; width: 150px; text-align: center;">Trị số bình thường</th>
      </tr>
    </thead>
    <tbody>
      {{labResultRows}}
    </tbody>
  </table>

  <div style="font-size: 12px; color: #6b7280; font-style: italic; margin-bottom: 30px;">
    * Chú thích: Các giá trị in đậm/màu đỏ nằm ngoài khoảng tham chiếu bình thường.
  </div>

  <div class="footer-signatures" style="display: flex; justify-content: space-between; text-align: center; font-size: 13px; margin-top: 30px;">
    <div>
      <p style="margin: 0; font-size: 11px; color: #6b7280;">&nbsp;</p>
      <strong>Bác sĩ chỉ định</strong>
      <div style="height: 60px;"></div>
      <strong>{{doctorName}}</strong>
    </div>
    <div>
      <p style="margin: 0; font-size: 11px; color: #6b7280;">Hà Nội, {{dateTime}}</p>
      <strong>Kỹ thuật viên phòng Xét nghiệm</strong>
      <div style="height: 60px;"></div>
      <strong>KTV. Nguyễn Văn Huy</strong>
    </div>
  </div>
</div>`,
      description: 'Mẫu kết quả xét nghiệm sinh hóa / huyết học thông thường',
      isActive: true,
    },
    {
      name: 'Mẫu phiếu kết quả siêu âm',
      code: 'ULTRASOUND_RESULT_TEMPLATE',
      type: FORM_TEMPLATE_TYPE.PRINT_TEMPLATE,
      category: FORM_TEMPLATE_CATEGORY.ULTRASOUND_RESULT,
      htmlContent: `<div class="print-container" style="font-family: 'Inter', sans-serif; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 20px; box-sizing: border-box; background: white;">
  <div class="header" style="display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 20px;">
    <div>
      <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #059669;">{{organizationName}}</h2>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563; font-weight: 500;">{{branchName}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Địa chỉ: {{branchAddress}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Điện thoại: {{branchHotline}}</p>
    </div>
    <div style="text-align: right;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">PHIẾU KẾT QUẢ SIÊU ÂM</h3>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Mã KQ: SA-{{patientCode}}</p>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">Ngày SA: {{dateTime}}</p>
    </div>
  </div>

  <div class="patient-info" style="margin-bottom: 20px; font-size: 13px; display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 8px;">
    <div><strong>Bệnh nhân:</strong> <span style="text-transform: uppercase; font-weight: 600;">{{patientName}}</span></div>
    <div><strong>Năm sinh:</strong> {{patientDob}}</div>
    <div><strong>Giới tính:</strong> {{patientGender}}</div>
    <div><strong>SĐT:</strong> {{patientPhone}}</div>
    <div style="grid-column: span 2;"><strong>Bác sĩ chỉ định:</strong> {{doctorName}}</div>
    <div style="grid-column: span 3; border-top: 1px dashed #e5e7eb; padding-top: 8px; margin-top: 4px;"><strong>Chẩn đoán lâm sàng:</strong> {{diagnosis}}</div>
  </div>

  <div style="font-size: 14px; font-weight: 700; color: #059669; margin: 15px 0 8px 0; border-bottom: 1px solid #10b981; padding-bottom: 4px;">MÔ TẢ CHI TIẾT KẾT QUẢ</div>
  <div style="font-size: 13px; line-height: 1.6; color: #1f2937; margin-bottom: 20px; white-space: pre-line;">
    {{ultrasoundResult}}
  </div>

  <div style="font-size: 14px; font-weight: 700; color: #059669; margin: 15px 0 8px 0; border-bottom: 1px solid #10b981; padding-bottom: 4px;">KẾT LUẬN</div>
  <div style="font-size: 14px; font-weight: 700; color: #ef4444; margin-bottom: 25px;">
    {{ultrasoundConclusion}}
  </div>

  <div class="footer-signatures" style="display: flex; justify-content: space-between; text-align: center; font-size: 13px; margin-top: 30px;">
    <div>
      <p style="margin: 0; font-size: 11px; color: #6b7280;">&nbsp;</p>
      <strong>Bác sĩ chỉ định</strong>
      <div style="height: 60px;"></div>
      <strong>{{doctorName}}</strong>
    </div>
    <div>
      <p style="margin: 0; font-size: 11px; color: #6b7280;">Hà Nội, {{dateTime}}</p>
      <strong>Bác sĩ Siêu âm</strong>
      <div style="height: 60px;"></div>
      <strong>BS. Nguyễn Thị Vân</strong>
    </div>
  </div>
</div>`,
      description: 'Mẫu kết quả siêu âm ổ bụng / siêu âm tổng quát',
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
  console.log('🌱 Seeding Patient, Appointment & Visit data...');
  const patientDataList = [
    {
      patientCode: 'BN-2026-0001',
      fullName: 'Trần Quốc Bảo',
      dob: '1988-08-15',
      gender: PATIENT_GENDER.MALE,
      phone: '0905123456',
      email: 'baotq@gmail.com',
      address: '72 Nguyễn Chí Thanh, Láng Thượng, Đống Đa, Hà Nội',
      cccd: '037088998811',
    },
    {
      patientCode: 'BN-2026-0002',
      fullName: 'Nguyễn Thị Kim Chi',
      dob: '1995-10-12',
      gender: PATIENT_GENDER.FEMALE,
      phone: '0988223344',
      email: 'chintk@gmail.com',
      address: '15 Cầu Giấy, Láng Thượng, Đống Đa, Hà Nội',
      cccd: '035200002532',
    },
    {
      patientCode: 'BN-2026-0003',
      fullName: 'Phạm Minh Hoàng',
      dob: '2012-05-20',
      gender: PATIENT_GENDER.MALE,
      phone: '0977112233',
      email: null,
      address: '120 Minh Khai, Hai Bà Trưng, Hà Nội',
      cccd: '037012003456',
      guardianName: 'Phạm Minh Hải',
      guardianPhone: '0977112234',
      guardianRelation: 'Bố',
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
  const serviceKhamNoi = await serviceRepository.findOneBy({ name: 'Khám nội tổng quát' }) || await serviceRepository.findOne({ where: {} });

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
        notes: 'Khám dạ dày định kỳ',
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
        notes: 'Tư vấn sức khỏe sản phụ',
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
        notes: 'Khám ho, sốt nhẹ ở trẻ em',
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

    // Seed Visits (Lượt khám bệnh nhân)
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
        reason: 'Đau dạ dày, đầy hơi chướng bụng',
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
        reason: 'Khám ho và sốt ở trẻ em',
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
        reason: 'Đau dạ dày, đầy bụng khó tiêu kéo dài',
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
        reason: 'Ho khan, đau họng, sốt nhẹ vào chiều tối',
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
        reason: 'Định kỳ kiểm tra huyết áp và tim mạch',
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
  console.log('✅ Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
