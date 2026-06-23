import { AppDataSource } from '../data-source';
import { PermissionOrmEntity } from '../../../modules/auth/infrastructure/database/permission.entity';
import { RoleOrmEntity } from '../../../modules/auth/infrastructure/database/role.entity';
import { UserOrmEntity } from '../../../modules/auth/infrastructure/database/user.entity';
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
      passwordHash: passwordHash,
      isActive: true,
      roleId: dbRoles['ADMIN'].id,
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
    { code: 'DV_KN_NOI', name: 'Khám Nội tổng quát', category: 'EXAMINATION', specialty: 'NOI', duration: 20, insuranceCode: '01.105' },
    { code: 'DV_KN_TIMMACH', name: 'Khám Tim mạch', category: 'EXAMINATION', specialty: 'TIMMACH', duration: 30, insuranceCode: '01.201' },
    { code: 'DV_SIEAM_BNG', name: 'Siêu âm bụng tổng quát', category: 'IMAGING', specialty: 'NOI', duration: 20, insuranceCode: '35.01' },
    { code: 'DV_XN_MAUCT', name: 'Xét nghiệm máu tổng quát', category: 'LAB_TEST', specialty: 'NOI', duration: 5, insuranceCode: 'XN.001' },
    { code: 'DV_KN_NHI', name: 'Khám Nhi khoa', category: 'EXAMINATION', specialty: 'NHI', duration: 20, insuranceCode: '01.301' },
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
        amount: 200000,
        vatRate: 5,
        effectiveDate: new Date('2026-01-01'),
      });
      await servicePriceRepository.save(listedPrice);

      const insurancePrice = servicePriceRepository.create({
        serviceId: service.id,
        priceType: 'INSURANCE',
        amount: 150000,
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
