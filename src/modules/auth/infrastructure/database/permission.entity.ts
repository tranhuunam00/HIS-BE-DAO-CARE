import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { RoleOrmEntity } from './role.entity';

@Entity({ name: 'permissions' })
export class PermissionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g. 'user:create', 'user:read'

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => RoleOrmEntity, (role) => role.permissions)
  roles: RoleOrmEntity[];
}
