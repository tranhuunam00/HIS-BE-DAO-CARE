import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStaffAttendanceSchema1782356000000 implements MigrationInterface {
    name = 'AddStaffAttendanceSchema1782356000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create staff_attendances table
        await queryRunner.query(`
            CREATE TABLE "his"."staff_attendances" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "staff_id" uuid NOT NULL,
                "branch_id" uuid NOT NULL,
                "date" date NOT NULL,
                "shift_id" uuid NOT NULL,
                "check_in_time" TIMESTAMP WITH TIME ZONE,
                "check_out_time" TIMESTAMP WITH TIME ZONE,
                "checkout_reason" character varying,
                "status" character varying NOT NULL DEFAULT 'CHECKED_IN',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_staff_attendances_id" PRIMARY KEY ("id")
            )
        `);

        // Foreign keys
        await queryRunner.query(`
            ALTER TABLE "his"."staff_attendances" 
            ADD CONSTRAINT "FK_staff_attendances_staff_id" 
            FOREIGN KEY ("staff_id") REFERENCES "his"."staff"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "his"."staff_attendances" 
            ADD CONSTRAINT "FK_staff_attendances_branch_id" 
            FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "his"."staff_attendances" 
            ADD CONSTRAINT "FK_staff_attendances_shift_id" 
            FOREIGN KEY ("shift_id") REFERENCES "his"."shifts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" DROP CONSTRAINT "FK_staff_attendances_shift_id"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" DROP CONSTRAINT "FK_staff_attendances_branch_id"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_attendances" DROP CONSTRAINT "FK_staff_attendances_staff_id"`);
        
        await queryRunner.query(`DROP TABLE "his"."staff_attendances"`);
    }
}
