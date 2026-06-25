import { AppDataSource } from './src/infrastructure/database/data-source';
import { UserOrmEntity } from './src/modules/auth/infrastructure/database/user.entity';
import { RoleOrmEntity } from './src/modules/auth/infrastructure/database/role.entity';

async function main() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();
  
  const userRepo = AppDataSource.getRepository(UserOrmEntity);
  const roleRepo = AppDataSource.getRepository(RoleOrmEntity);
  
  const email = 'admin@hisdaocare.com';
  const user = await userRepo.findOneBy({ email });
  
  if (user) {
    console.log('--- USER DATA ---');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('RoleId:', user.roleId);
    console.log('IsActive:', user.isActive);
    
    const role = await roleRepo.findOne({
      where: { id: user.roleId },
      relations: { permissions: true }
    });
    
    if (role) {
      console.log('--- ROLE DATA ---');
      console.log('Role Name:', role.name);
      console.log('Permissions Count:', role.permissions?.length || 0);
    }
  }

  // Inspect and Fix PATIENT role
  console.log('\n--- INSPECTING PATIENT ROLE ---');
  let patientRole = await roleRepo.findOne({
    where: { name: 'PATIENT' },
    relations: { permissions: true }
  });

  if (!patientRole) {
    console.log('PATIENT role not found. Creating one...');
    patientRole = roleRepo.create({
      name: 'PATIENT',
      description: 'Vai trò mặc định cho bệnh nhân đăng nhập bằng Google',
      permissions: []
    });
    patientRole = await roleRepo.save(patientRole);
  }

  console.log('PATIENT Role ID:', patientRole.id);
  console.log('Current Permissions Count:', patientRole.permissions?.length || 0);
  console.log('Current Permissions:', patientRole.permissions?.map(p => p.name));

  const permRepo = AppDataSource.getRepository('PermissionOrmEntity');
  const requiredPermNames = [
    'branch:read',
    'specialty:read',
    'service:read',
    'staff:read',
    'org:read',
    'org:write'
  ];

  console.log('Assigning permissions to PATIENT role...');
  const allPermissions = await permRepo.find() as any[];
  const requiredPerms = allPermissions.filter(p => requiredPermNames.includes(p.name));
  
  patientRole.permissions = requiredPerms;
  await roleRepo.save(patientRole);
  console.log('PATIENT role updated successfully!');
  console.log('New Permissions Count:', patientRole.permissions.length);
  console.log('New Permissions:', patientRole.permissions.map(p => p.name));
  
  await AppDataSource.destroy();
}

main().catch(console.error);
