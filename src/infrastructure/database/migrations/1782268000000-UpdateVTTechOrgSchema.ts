import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateVTTechOrgSchema1782268000000 implements MigrationInterface {
    name = 'UpdateVTTechOrgSchema1782268000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create departments table
        await queryRunner.query(`
            CREATE TABLE "his"."departments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "branch_id" uuid,
                "name" character varying NOT NULL,
                "code" character varying NOT NULL,
                "description" character varying,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_department_code" UNIQUE ("code"),
                CONSTRAINT "PK_departments" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraint to departments
        await queryRunner.query(`
            ALTER TABLE "his"."departments" 
            ADD CONSTRAINT "FK_departments_branch" 
            FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") 
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        // 2. Add bank fields to branches
        await queryRunner.query(`ALTER TABLE "his"."branches" ADD "bank_name" character varying`);
        await queryRunner.query(`ALTER TABLE "his"."branches" ADD "bank_account_no" character varying`);
        await queryRunner.query(`ALTER TABLE "his"."branches" ADD "bank_account_name" character varying`);

        // 3. Add nickname and department_id to staff
        await queryRunner.query(`ALTER TABLE "his"."staff" ADD "nickname" character varying`);
        await queryRunner.query(`ALTER TABLE "his"."staff" ADD "department_id" uuid`);

        // Add foreign key constraint to staff
        await queryRunner.query(`
            ALTER TABLE "his"."staff" 
            ADD CONSTRAINT "FK_staff_department" 
            FOREIGN KEY ("department_id") REFERENCES "his"."departments"("id") 
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        // 4. Add is_occupied to resources
        await queryRunner.query(`ALTER TABLE "his"."resources" ADD "is_occupied" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop constraints
        await queryRunner.query(`ALTER TABLE "his"."staff" DROP CONSTRAINT "FK_staff_department"`);
        await queryRunner.query(`ALTER TABLE "his"."departments" DROP CONSTRAINT "FK_departments_branch"`);

        // Drop columns from resources
        await queryRunner.query(`ALTER TABLE "his"."resources" DROP COLUMN "is_occupied"`);

        // Drop columns from staff
        await queryRunner.query(`ALTER TABLE "his"."staff" DROP COLUMN "department_id"`);
        await queryRunner.query(`ALTER TABLE "his"."staff" DROP COLUMN "nickname"`);

        // Drop columns from branches
        await queryRunner.query(`ALTER TABLE "his"."branches" DROP COLUMN "bank_account_name"`);
        await queryRunner.query(`ALTER TABLE "his"."branches" DROP COLUMN "bank_account_no"`);
        await queryRunner.query(`ALTER TABLE "his"."branches" DROP COLUMN "bank_name"`);

        // Drop departments table
        await queryRunner.query(`DROP TABLE "his"."departments"`);
    }
}
