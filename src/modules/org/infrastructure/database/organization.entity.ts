import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BranchOrmEntity } from './branch.entity';

@Entity({ name: 'organizations' })
export class OrganizationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'short_name', type: 'varchar', nullable: true })
  shortName: string | null;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'logo_url', type: 'varchar', nullable: true })
  logoUrl: string | null;

  @Column({ name: 'tax_code', type: 'varchar', nullable: true })
  taxCode: string | null;

  @Column({ name: 'operating_license', type: 'varchar', nullable: true })
  operatingLicense: string | null;

  @Column({ name: 'legal_representative', type: 'varchar', nullable: true })
  legalRepresentative: string | null;

  @Column({ type: 'varchar', nullable: true })
  hotline: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  website: string | null;

  @Column({ type: 'varchar', nullable: true })
  address: string | null;

  @OneToMany(() => BranchOrmEntity, (branch) => branch.organization)
  branches: BranchOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
