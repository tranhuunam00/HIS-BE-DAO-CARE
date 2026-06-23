import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrgAndBranchSchema1782230177291 implements MigrationInterface {
    name = 'AddOrgAndBranchSchema1782230177291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "his"."organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "short_name" character varying, "code" character varying NOT NULL, "logo_url" character varying, "tax_code" character varying, "operating_license" character varying, "legal_representative" character varying, "hotline" character varying, "email" character varying, "website" character varying, "address" character varying, "language" character varying NOT NULL DEFAULT 'vi', "timezone" character varying NOT NULL DEFAULT 'Asia/Ho_Chi_Minh', "country" character varying NOT NULL DEFAULT 'VN', "default_currency" character varying NOT NULL DEFAULT 'VND', "date_format" character varying NOT NULL DEFAULT 'YYYY-MM-DD', "time_format" character varying NOT NULL DEFAULT 'HH:mm:ss', "currency_format" character varying NOT NULL DEFAULT 'standard', "otp_expiration_time" integer NOT NULL DEFAULT '300', "appointment_cancellation_limit" integer NOT NULL DEFAULT '24', "mrn_format" character varying NOT NULL DEFAULT 'MRN-{YY}{MM}{DD}-{SEQ}', "patient_code_format" character varying NOT NULL DEFAULT 'PT-{YY}{MM}-{SEQ}', "visit_code_format" character varying NOT NULL DEFAULT 'VS-{YY}{MM}{DD}-{SEQ}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7e27c3b62c681fbe3e2322535f2" UNIQUE ("code"), CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "his"."branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organization_id" uuid NOT NULL, "name" character varying NOT NULL, "code" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'CLINIC', "technical_director" character varying, "operating_license" character varying, "is_active" boolean NOT NULL DEFAULT true, "hotline" character varying, "email" character varying, "country" character varying NOT NULL DEFAULT 'VN', "province" character varying, "district" character varying, "address_detail" character varying, "latitude" double precision, "longitude" double precision, "working_days" text, "open_time" character varying NOT NULL DEFAULT '08:00', "close_time" character varying NOT NULL DEFAULT '20:00', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9c06cbb83feb2f0be6263bd47ee" UNIQUE ("code"), CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "his"."branches" ADD CONSTRAINT "FK_9ecf73d5ca57108dc33c87f7d88" FOREIGN KEY ("organization_id") REFERENCES "his"."organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "his"."branches" DROP CONSTRAINT "FK_9ecf73d5ca57108dc33c87f7d88"`);
        await queryRunner.query(`DROP TABLE "his"."branches"`);
        await queryRunner.query(`DROP TABLE "his"."organizations"`);
    }

}
