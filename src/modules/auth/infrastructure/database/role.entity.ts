import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { PermissionOrmEntity } from './permission.entity';
import { UserOrmEntity } from './user.entity';

@Entity({ name: 'roles' })
export class RoleOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g. 'ADMIN', 'DOCTOR', 'RECEPTION', 'NURSE'

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => PermissionOrmEntity, (permission) => permission.roles, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: PermissionOrmEntity[];

  @OneToMany(() => UserOrmEntity, (user) => user.role)
  users: UserOrmEntity[];
}
