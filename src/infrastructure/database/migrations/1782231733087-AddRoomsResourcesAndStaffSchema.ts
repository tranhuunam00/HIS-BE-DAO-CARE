import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoomsResourcesAndStaffSchema1782231733087 implements MigrationInterface {
    name = 'AddRoomsResourcesAndStaffSchema1782231733087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "his"."resources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "room_id" uuid NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "type" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b7ab912cd81e4b447e43d45e382" UNIQUE ("code"), CONSTRAINT "PK_632484ab9dff41bba94f9b7c85e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "his"."rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "branch_id" uuid NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'CLINIC', "specialty_id" uuid, "floor" character varying, "capacity" integer NOT NULL DEFAULT '1', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_368d83b661b9670e7be1bbb9cdd" UNIQUE ("code"), CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "his"."staff_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "specialty_id" uuid, "room_id" uuid, "is_primary" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ab013446523a48ceb9b14144530" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "his"."staff" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying NOT NULL, "date_of_birth" date NOT NULL, "gender" character varying NOT NULL, "identity_number" character varying NOT NULL, "phone" character varying NOT NULL, "email" character varying NOT NULL, "address" character varying, "staff_code" character varying NOT NULL, "join_date" date NOT NULL, "title" character varying NOT NULL, "is_clinical" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_95f6d960f335c701cba5ace5a1c" UNIQUE ("identity_number"), CONSTRAINT "UQ_902985a964245652d5e3a0f5f6a" UNIQUE ("email"), CONSTRAINT "UQ_4506225c77d4810fe9ff9dd20d4" UNIQUE ("staff_code"), CONSTRAINT "UQ_cec9365d9fc3a3409158b645f2e" UNIQUE ("user_id"), CONSTRAINT "REL_cec9365d9fc3a3409158b645f2" UNIQUE ("user_id"), CONSTRAINT "PK_e4ee98bb552756c180aec1e854a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "his"."practicing_certificates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_id" uuid NOT NULL, "certificate_number" character varying NOT NULL, "issued_date" date NOT NULL, "expiry_date" date, "issued_by" character varying NOT NULL, "scope_of_practice" text NOT NULL, "signature_scan_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_dc20b16ed576394058e06561810" UNIQUE ("staff_id"), CONSTRAINT "UQ_45d2a1fb18a2d807dec1c7a892c" UNIQUE ("certificate_number"), CONSTRAINT "REL_dc20b16ed576394058e0656181" UNIQUE ("staff_id"), CONSTRAINT "PK_6f261a00a70308acf7935171bf5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "his"."resources" ADD CONSTRAINT "FK_d9b2106f609d3f7c3fcf284d011" FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."rooms" ADD CONSTRAINT "FK_d660a352f1befcb3f97bf24a84a" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_assignments" ADD CONSTRAINT "FK_6ff0f6a29afcb34aa82e9963298" FOREIGN KEY ("staff_id") REFERENCES "his"."staff"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_assignments" ADD CONSTRAINT "FK_405fddf99d22dc11609e4cd3f83" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff_assignments" ADD CONSTRAINT "FK_47811fea7e1c027c80c7d211ed7" FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."staff" ADD CONSTRAINT "FK_cec9365d9fc3a3409158b645f2e" FOREIGN KEY ("user_id") REFERENCES "his"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."practicing_certificates" ADD CONSTRAINT "FK_dc20b16ed576394058e06561810" FOREIGN KEY ("staff_id") REFERENCES "his"."staff"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."practicing_certificates" DROP CONSTRAINT "FK_dc20b16ed576394058e06561810"`);
        await queryRunner.query(`ALTER TABLE "his"."staff" DROP CONSTRAINT "FK_cec9365d9fc3a3409158b645f2e"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_assignments" DROP CONSTRAINT "FK_47811fea7e1c027c80c7d211ed7"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_assignments" DROP CONSTRAINT "FK_405fddf99d22dc11609e4cd3f83"`);
        await queryRunner.query(`ALTER TABLE "his"."staff_assignments" DROP CONSTRAINT "FK_6ff0f6a29afcb34aa82e9963298"`);
        await queryRunner.query(`ALTER TABLE "his"."rooms" DROP CONSTRAINT "FK_d660a352f1befcb3f97bf24a84a"`);
        await queryRunner.query(`ALTER TABLE "his"."resources" DROP CONSTRAINT "FK_d9b2106f609d3f7c3fcf284d011"`);
        await queryRunner.query(`DROP TABLE "his"."practicing_certificates"`);
        await queryRunner.query(`DROP TABLE "his"."staff"`);
        await queryRunner.query(`DROP TABLE "his"."staff_assignments"`);
        await queryRunner.query(`DROP TABLE "his"."rooms"`);
        await queryRunner.query(`DROP TABLE "his"."resources"`);
    }

}
