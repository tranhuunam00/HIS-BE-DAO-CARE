import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStaffAvatarAndAcademicFields1782750000000 implements MigrationInterface {
  name = 'AddStaffAvatarAndAcademicFields1782750000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "his"."staff" ADD COLUMN "avatar_url" character varying`);
    await queryRunner.query(`ALTER TABLE "his"."staff" ADD COLUMN "academic_title" character varying`);
    await queryRunner.query(`ALTER TABLE "his"."staff" ADD COLUMN "degree" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "his"."staff" DROP COLUMN IF EXISTS "avatar_url"`);
    await queryRunner.query(`ALTER TABLE "his"."staff" DROP COLUMN IF EXISTS "academic_title"`);
    await queryRunner.query(`ALTER TABLE "his"."staff" DROP COLUMN IF EXISTS "degree"`);
  }
}
