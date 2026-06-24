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
    { name: 'ADMIN', description: 'Quản trị viên toàn hệ thống' },
    { name: 'DOCTOR', description: 'Bác sĩ lâm sàng' },
    { name: 'RECEPTION', description: 'Lễ tân tiếp đón' },
    { name: 'NURSE', description: 'Điều dưỡng viên' },
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
    if (r.name === 'ADMIN') {
      role.permissions = dbPermissions;
    } else if (r.name === 'DOCTOR') {
      role.permissions = dbPermissions.filter((p) =>
        ['org:read', 'branch:read', 'user:read', 'room:read', 'resource:read', 'staff:read'].includes(p.name)
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
    const passwordHash = await bcrypt.hash('Admin@HIS2026!', 10);
    adminUser = userRepository.create({
      email: adminEmail,
      username: 'admin',
      passwordHash: passwordHash,
      isActive: true,
      roleId: dbRoles['ADMIN'].id,
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
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      country: 'VN',
      defaultCurrency: 'VND',
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
      type: 'CLINIC',
      technicalDirector: 'BS. Trần Hữu Nam',
      hotline: '024777888',
      email: 'hbt@daocare.vn',
      province: 'Hà Nội',
      district: 'Hai Bà Trưng',
      addressDetail: 'Số 1 Đại Cồ Việt',
      latitude: 21.006326,
      longitude: 105.843132,
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
    adminUser.branchScopeMode = 'ALL';
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

  // 6. Seed Rooms
  const room1Code = 'PK101';
  let room1 = await roomRepository.findOneBy({ code: room1Code });
  if (!room1) {
    room1 = roomRepository.create({
      branchId: branch.id,
      name: 'Phòng khám Nội 101',
      code: room1Code,
      type: 'CLINIC',
      floor: 'Tầng 1',
      capacity: 2,
      isActive: true,
    });
    room1 = await roomRepository.save(room1);
    console.log(`+ Created Room: ${room1.name}`);
  }

  const room2Code = 'PK102';
  let room2 = await roomRepository.findOneBy({ code: room2Code });
  if (!room2) {
    room2 = roomRepository.create({
      branchId: branch.id,
      name: 'Phòng Cận Lâm Sàng Siêu Âm',
      code: room2Code,
      type: 'IMAGING',
      floor: 'Tầng 1',
      capacity: 1,
      isActive: true,
    });
    room2 = await roomRepository.save(room2);
    console.log(`+ Created Room: ${room2.name}`);
  }

  // 7. Seed Resources
  const res1Code = 'G01';
  let res1 = await resourceRepository.findOneBy({ code: res1Code });
  if (!res1) {
    res1 = resourceRepository.create({
      roomId: room1.id,
      name: 'Ghế khám bệnh đa năng',
      code: res1Code,
      type: 'CHAIR',
      isActive: true,
    });
    await resourceRepository.save(res1);
    console.log(`+ Created Resource: ${res1.name}`);
  }

  const res2Code = 'TB01';
  let res2 = await resourceRepository.findOneBy({ code: res2Code });
  if (!res2) {
    res2 = resourceRepository.create({
      roomId: room2.id,
      name: 'Máy siêu âm 4D Mindray',
      code: res2Code,
      type: 'EQUIPMENT',
      isActive: true,
    });
    await resourceRepository.save(res2);
    console.log(`+ Created Resource: ${res2.name}`);
  }

  // 8. Seed Staff
  const staffCode = 'NV0001';
  let staff = await staffRepository.findOneBy({ staffCode });
  if (!staff) {
    staff = staffRepository.create({
      fullName: 'BS. Trần Hữu Nam',
      dateOfBirth: new Date('1988-06-15'),
      gender: 'MALE',
      identityNumber: '037088123456',
      phone: '0988888999',
      email: 'namth@hisdaocare.com',
      address: 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      staffCode,
      joinDate: new Date('2025-01-01'),
      title: 'DOCTOR',
      isClinical: true,
      isActive: true,
      userId: adminUser.id,
    });
    staff = await staffRepository.save(staff);
    console.log(`+ Created Staff profile: ${staff.fullName}`);

    // Seed Certificate
    const cert = certRepository.create({
      staffId: staff.id,
      certificateNumber: '012345/BYT-CCHN',
      issuedDate: new Date('2020-01-01'),
      issuedBy: 'Bộ Y Tế',
      scopeOfPractice: 'Khám bệnh, chữa bệnh chuyên khoa Nội',
      signatureScanUrl: null,
    });
    await certRepository.save(cert);
    console.log(`+ Created Practicing Certificate for: ${staff.fullName}`);

    // Seed Assignment
    const assign = assignmentRepository.create({
      staffId: staff.id,
      branchId: branch.id,
      roomId: room1.id,
      isPrimary: true,
    });
    await assignmentRepository.save(assign);
    console.log(`+ Created Branch Assignment for: ${staff.fullName}`);
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
    { code: 'DV_KN_NOI', name: 'Khám Nội tổng quát', category: 'EXAMINATION', specialty: 'NOI', duration: 20, insuranceCode: '01.105', listedPrice: 200000, insurancePrice: 150000 },
    { code: 'DV_KN_TIMMACH', name: 'Khám Tim mạch', category: 'EXAMINATION', specialty: 'TIMMACH', duration: 30, insuranceCode: '01.201', listedPrice: 200000, insurancePrice: 150000 },
    { code: 'DV_SIEAM_BNG', name: 'Siêu âm bụng tổng quát', category: 'IMAGING', specialty: 'NOI', duration: 20, insuranceCode: '35.01', listedPrice: 200000, insurancePrice: 150000 },
    { code: 'DV_XN_MAUCT', name: 'Xét nghiệm máu tổng quát', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.001', listedPrice: 200000, insurancePrice: 150000 },
    { code: 'DV_KN_NHI', name: 'Khám Nhi khoa', category: 'EXAMINATION', specialty: 'NHI', duration: 20, insuranceCode: '01.301', listedPrice: 200000, insurancePrice: 150000 },
    
    // Expanded Examination services
    { code: 'DV_KSK_TQ', name: 'Khám sức khỏe tổng quát', category: 'EXAMINATION', specialty: 'NOI', duration: 30, insuranceCode: '01.001', listedPrice: 300000, insurancePrice: 220000 },
    { code: 'DV_KDK', name: 'Khám định kỳ', category: 'EXAMINATION', specialty: 'NOI', duration: 20, insuranceCode: '01.002', listedPrice: 150000, insurancePrice: 100000 },
    { code: 'DV_KN_NHI_TQ', name: 'Khám nhi tổng quát', category: 'EXAMINATION', specialty: 'NHI', duration: 20, insuranceCode: '01.302', listedPrice: 200000, insurancePrice: 150000 },
    { code: 'DV_KTT_NHI', name: 'Khám tăng trưởng trẻ em', category: 'EXAMINATION', specialty: 'NHI', duration: 30, insuranceCode: '01.303', listedPrice: 250000, insurancePrice: 180000 },
    { code: 'DV_KN_HOHAP', name: 'Khám Hô hấp', category: 'EXAMINATION', specialty: 'HOHAP', duration: 20, insuranceCode: '01.202', listedPrice: 200000, insurancePrice: 150000 },
    { code: 'DV_KN_NOITIET', name: 'Khám Nội tiết', category: 'EXAMINATION', specialty: 'NOITIET', duration: 20, insuranceCode: '01.203', listedPrice: 200000, insurancePrice: 150000 },
    { code: 'DV_KN_NGOAI_TQ', name: 'Khám Ngoại tổng quát', category: 'EXAMINATION', specialty: 'NGOAI', duration: 20, insuranceCode: '01.106', listedPrice: 150000, insurancePrice: 100000 },
    { code: 'DV_KN_CHINH_HINH', name: 'Khám Chấn thương chỉnh hình', category: 'EXAMINATION', specialty: 'NGOAI', duration: 20, insuranceCode: '01.107', listedPrice: 200000, insurancePrice: 150000 },
    { code: 'DV_KN_NHA_TQ', name: 'Khám nha tổng quát', category: 'EXAMINATION', specialty: 'RANGHAM', duration: 20, insuranceCode: '01.401', listedPrice: 100000, insurancePrice: 70000 },
    { code: 'DV_NHA_CHINH', name: 'Chỉnh nha', category: 'EXAMINATION', specialty: 'RANGHAM', duration: 40, insuranceCode: '01.402', listedPrice: 500000, insurancePrice: 400000 },
    { code: 'DV_NHA_IMPLANT', name: 'Cấy ghép Implant', category: 'EXAMINATION', specialty: 'RANGHAM', duration: 60, insuranceCode: '01.403', listedPrice: 1500000, insurancePrice: 1200000 },
    
    // Expanded Lab Test services
    { code: 'DV_XN_CBC', name: 'Tổng phân tích tế bào máu ngoại vi - CBC', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.002', listedPrice: 80000, insurancePrice: 60000 },
    { code: 'DV_XN_DONGMAU', name: 'Đông máu cơ bản PT/APTT/INR', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.003', listedPrice: 120000, insurancePrice: 90000 },
    { code: 'DV_XN_GAN_AST', name: 'Định lượng AST - SGOT', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.004', listedPrice: 50000, insurancePrice: 40000 },
    { code: 'DV_XN_GAN_ALT', name: 'Định lượng ALT - SGPT', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.005', listedPrice: 50000, insurancePrice: 40000 },
    { code: 'DV_XN_GAN_GGT', name: 'Định lượng GGT', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.006', listedPrice: 60000, insurancePrice: 45000 },
    { code: 'DV_XN_GAN_BILI', name: 'Định lượng Bilirubin toàn phần', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.007', listedPrice: 50000, insurancePrice: 38000 },
    { code: 'DV_XN_URE', name: 'Định lượng Ure', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.008', listedPrice: 45000, insurancePrice: 35000 },
    { code: 'DV_XN_CREATININ', name: 'Định lượng Creatinin', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.009', listedPrice: 45000, insurancePrice: 35000 },
    { code: 'DV_XN_GLUCOSE', name: 'Định lượng Glucose máu', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.010', listedPrice: 40000, insurancePrice: 30000 },
    { code: 'DV_XN_HBA1C', name: 'Định lượng HbA1c', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.011', listedPrice: 150000, insurancePrice: 120000 },
    { code: 'DV_XN_CHOL', name: 'Định lượng Cholesterol toàn phần', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.012', listedPrice: 50000, insurancePrice: 40000 },
    { code: 'DV_XN_TRIGLY', name: 'Định lượng Triglycerid', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.013', listedPrice: 50000, insurancePrice: 40000 },
    { code: 'DV_XN_URIC', name: 'Định lượng Acid Uric', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.014', listedPrice: 50000, insurancePrice: 40000 },
    { code: 'DV_XN_NUOCTIEU_10', name: 'Tổng phân tích nước tiểu 10 thông số', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.015', listedPrice: 60000, insurancePrice: 45000 },
    
    // Expanded Imaging services
    { code: 'DV_SA_GIAP', name: 'Siêu âm tuyến giáp', category: 'IMAGING', specialty: 'NOI', duration: 15, insuranceCode: 'SA.001', listedPrice: 150000, insurancePrice: 110000 },
    { code: 'DV_SA_VU', name: 'Siêu âm vú hai bên', category: 'IMAGING', specialty: 'SAN', duration: 15, insuranceCode: 'SA.002', listedPrice: 180000, insurancePrice: 130000 },
    { code: 'DV_SA_TIM', name: 'Siêu âm tim Doppler màu', category: 'IMAGING', specialty: 'TIMMACH', duration: 30, insuranceCode: 'SA.003', listedPrice: 350000, insurancePrice: 280000 },
    { code: 'DV_XQ_NGUC', name: 'X-quang ngực thẳng', category: 'IMAGING', specialty: 'NOI', duration: 10, insuranceCode: 'XQ.001', listedPrice: 120000, insurancePrice: 90000 },
    { code: 'DV_XQ_COTSONG_CO', name: 'X-quang cột sống cổ', category: 'IMAGING', specialty: 'NGOAI', duration: 10, insuranceCode: 'XQ.002', listedPrice: 140000, insurancePrice: 110000 },
    { code: 'DV_XQ_COTSONG_TL', name: 'X-quang cột sống thắt lưng', category: 'IMAGING', specialty: 'NGOAI', duration: 10, insuranceCode: 'XQ.003', listedPrice: 140000, insurancePrice: 110000 },

    // Expanded Procedure services
    { code: 'DV_TT_LAYCAORANG', name: 'Lấy cao răng và đánh bóng', category: 'PROCEDURE', specialty: 'RANGHAM', duration: 30, insuranceCode: 'TT.001', listedPrice: 150000, insurancePrice: 100000 },
    { code: 'DV_TT_NHORANG_SUA', name: 'Nhổ răng sữa bôi/tê', category: 'PROCEDURE', specialty: 'RANGHAM', duration: 15, insuranceCode: 'TT.002', listedPrice: 50000, insurancePrice: 30000 },
    { code: 'DV_TT_NHORANG_KHON', name: 'Nhổ răng khôn mọc lệch', category: 'PROCEDURE', specialty: 'RANGHAM', duration: 45, insuranceCode: 'TT.003', listedPrice: 1000000, insurancePrice: 800000 },
    { code: 'DV_TT_TRAMRANG', name: 'Trám răng thẩm mỹ Composite', category: 'PROCEDURE', specialty: 'RANGHAM', duration: 20, insuranceCode: 'TT.004', listedPrice: 200000, insurancePrice: 150000 },
    { code: 'DV_TT_NOISOI_TMH', name: 'Nội soi Tai Mũi Họng ống cứng', category: 'PROCEDURE', specialty: 'TMH', duration: 15, insuranceCode: 'TT.005', listedPrice: 200000, insurancePrice: 160000 },
    { code: 'DV_TT_HUTDICH_MUI', name: 'Hút dịch mũi bằng máy', category: 'PROCEDURE', specialty: 'TMH', duration: 10, insuranceCode: 'TT.006', listedPrice: 50000, insurancePrice: 35000 },
    { code: 'DV_TT_KHAUVT', name: 'Khâu vết thương phần mềm dưới 5cm', category: 'PROCEDURE', specialty: 'NGOAI', duration: 30, insuranceCode: 'TT.007', listedPrice: 300000, insurancePrice: 220000 },
    { code: 'DV_TT_CATCHI', name: 'Cắt chỉ vết thương', category: 'PROCEDURE', specialty: 'NGOAI', duration: 10, insuranceCode: 'TT.008', listedPrice: 50000, insurancePrice: 30000 },
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

      // Seed 2 price tiers (LISTED + INSURANCE)
      const listedPrice = servicePriceRepository.create({
        serviceId: service.id,
        priceType: 'LISTED',
        amount: sv.listedPrice ?? 200000,
        vatRate: 5,
        effectiveDate: new Date('2026-01-01'),
      });
      await servicePriceRepository.save(listedPrice);

      const insurancePrice = servicePriceRepository.create({
        serviceId: service.id,
        priceType: 'INSURANCE',
        amount: sv.insurancePrice ?? 150000,
        vatRate: 0,
        effectiveDate: new Date('2026-01-01'),
      });
      await servicePriceRepository.save(insurancePrice);
      console.log(`  + Seeded prices for: ${sv.name}`);
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
      routeOfAdministration: 'ORAL',
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
      routeOfAdministration: 'ORAL',
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
      routeOfAdministration: 'ORAL',
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
      routeOfAdministration: 'ORAL',
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
      routeOfAdministration: 'ORAL',
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
      routeOfAdministration: 'ORAL',
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
      routeOfAdministration: 'ORAL',
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
      routeOfAdministration: 'ORAL',
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
      routeOfAdministration: 'ORAL',
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
      routeOfAdministration: 'ORAL',
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
      routeOfAdministration: 'ORAL',
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
      routeOfAdministration: 'ORAL',
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
      routeOfAdministration: 'ORAL',
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
      routeOfAdministration: 'ORAL',
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

  await AppDataSource.destroy();
  console.log('✅ Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
