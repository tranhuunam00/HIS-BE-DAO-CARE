import { AppDataSource } from '../data-source';
import { PermissionOrmEntity } from '../../../modules/auth/infrastructure/database/permission.entity';
import { RoleOrmEntity } from '../../../modules/auth/infrastructure/database/role.entity';
import { UserOrmEntity } from '../../../modules/auth/infrastructure/database/user.entity';
import { OrganizationOrmEntity } from '../../../modules/org/infrastructure/database/organization.entity';
import { BranchOrmEntity } from '../../../modules/org/infrastructure/database/branch.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Starting database seeding...');
  await AppDataSource.initialize();

  const permissionRepository = AppDataSource.getRepository(PermissionOrmEntity);
  const roleRepository = AppDataSource.getRepository(RoleOrmEntity);
  const userRepository = AppDataSource.getRepository(UserOrmEntity);
  const orgRepository = AppDataSource.getRepository(OrganizationOrmEntity);
  const branchRepository = AppDataSource.getRepository(BranchOrmEntity);

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
        ['org:read', 'branch:read', 'user:read'].includes(p.name)
      );
    }

    role = await roleRepository.save(role);
    dbRoles[r.name] = role;
    console.log(`+ Processed Role: ${r.name}`);
  }

  // 3. Seed Default Admin User
  const adminEmail = 'admin@hisdaocare.com';
  const existingAdmin = await userRepository.findOneBy({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Admin@HIS2026!', 10);
    const adminUser = userRepository.create({
      email: adminEmail,
      passwordHash: passwordHash,
      isActive: true,
      roleId: dbRoles['ADMIN'].id,
    });
    await userRepository.save(adminUser);
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
    await branchRepository.save(branch);
    console.log(`+ Created default Branch: ${branch.name}`);
  } else {
    console.log(`~ Branch ${branchCode} already exists.`);
  }

  await AppDataSource.destroy();
  console.log('✅ Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
