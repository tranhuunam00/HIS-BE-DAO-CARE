import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReceptionSchema1782291364028 implements MigrationInterface {
    name = 'AddReceptionSchema1782291364028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "his"."patients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patient_code" character varying NOT NULL, "full_name" character varying NOT NULL, "dob" date NOT NULL, "gender" character varying NOT NULL, "phone" character varying NOT NULL, "email" character varying, "address" character varying, "cccd" character varying, "guardian_name" character varying, "guardian_phone" character varying, "guardian_relation" character varying, "avatar_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_72398f0b54d401540321d5db8bf" UNIQUE ("patient_code"), CONSTRAINT "UQ_8e8e6b29f954d02d0cf410dbaff" UNIQUE ("phone"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "his"."appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "appointment_code" character varying NOT NULL, "patient_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "doctor_id" uuid, "room_id" uuid, "service_id" uuid, "appointment_date" date NOT NULL, "start_time" character varying NOT NULL, "end_time" character varying NOT NULL, "status" character varying NOT NULL, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b6f79459980d0d8115f9425a337" UNIQUE ("appointment_code"), CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "his"."patient_visits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "visit_code" character varying NOT NULL, "patient_id" uuid NOT NULL, "branch_id" uuid NOT NULL, "appointment_id" uuid, "current_room_id" uuid, "current_doctor_id" uuid, "current_nurse_id" uuid, "queue_number" integer NOT NULL, "status" character varying NOT NULL, "reason" character varying, "pulse" integer, "blood_pressure" character varying, "temperature" numeric(4,1), "weight" numeric(5,2), "height" numeric(5,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9cdd1214209c68d03b040507081" UNIQUE ("visit_code"), CONSTRAINT "PK_5b5111a9f4a0922fb2a7d1f8e00" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "his"."appointments" ADD CONSTRAINT "FK_3330f054416745deaa2cc130700" FOREIGN KEY ("patient_id") REFERENCES "his"."patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."appointments" ADD CONSTRAINT "FK_fc5d925c8972ba27457e23e7c09" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."appointments" ADD CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2" FOREIGN KEY ("doctor_id") REFERENCES "his"."staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."appointments" ADD CONSTRAINT "FK_3cf8c30e138f692e575c5dc420e" FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."appointments" ADD CONSTRAINT "FK_2a2088e8eaa8f28d8de2bdbb857" FOREIGN KEY ("service_id") REFERENCES "his"."services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" ADD CONSTRAINT "FK_906db448e7af552e4b036ca8a54" FOREIGN KEY ("patient_id") REFERENCES "his"."patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" ADD CONSTRAINT "FK_d8d58a27ccfad8e5993870493e4" FOREIGN KEY ("branch_id") REFERENCES "his"."branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" ADD CONSTRAINT "FK_3d4129d08b1357cd92e29284bb3" FOREIGN KEY ("appointment_id") REFERENCES "his"."appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" ADD CONSTRAINT "FK_298f28c82d77acea14808f172b9" FOREIGN KEY ("current_room_id") REFERENCES "his"."rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" ADD CONSTRAINT "FK_82431998bb9bd014925e6d5d561" FOREIGN KEY ("current_doctor_id") REFERENCES "his"."staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" ADD CONSTRAINT "FK_78a76228795787b4ef8839a544c" FOREIGN KEY ("current_nurse_id") REFERENCES "his"."staff"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" DROP CONSTRAINT "FK_78a76228795787b4ef8839a544c"`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" DROP CONSTRAINT "FK_82431998bb9bd014925e6d5d561"`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" DROP CONSTRAINT "FK_298f28c82d77acea14808f172b9"`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" DROP CONSTRAINT "FK_3d4129d08b1357cd92e29284bb3"`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" DROP CONSTRAINT "FK_d8d58a27ccfad8e5993870493e4"`);
        await queryRunner.query(`ALTER TABLE "his"."patient_visits" DROP CONSTRAINT "FK_906db448e7af552e4b036ca8a54"`);
        await queryRunner.query(`ALTER TABLE "his"."appointments" DROP CONSTRAINT "FK_2a2088e8eaa8f28d8de2bdbb857"`);
        await queryRunner.query(`ALTER TABLE "his"."appointments" DROP CONSTRAINT "FK_3cf8c30e138f692e575c5dc420e"`);
        await queryRunner.query(`ALTER TABLE "his"."appointments" DROP CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2"`);
        await queryRunner.query(`ALTER TABLE "his"."appointments" DROP CONSTRAINT "FK_fc5d925c8972ba27457e23e7c09"`);
        await queryRunner.query(`ALTER TABLE "his"."appointments" DROP CONSTRAINT "FK_3330f054416745deaa2cc130700"`);
        await queryRunner.query(`DROP TABLE "his"."patient_visits"`);
        await queryRunner.query(`DROP TABLE "his"."appointments"`);
        await queryRunner.query(`DROP TABLE "his"."patients"`);
    }

}
