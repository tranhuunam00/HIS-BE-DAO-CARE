import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePatientDobNullable1783312508838 implements MigrationInterface {
    name = 'MakePatientDobNullable1783312508838'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."patients" ALTER COLUMN "dob" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."patients" ALTER COLUMN "dob" SET NOT NULL`);
    }

}
