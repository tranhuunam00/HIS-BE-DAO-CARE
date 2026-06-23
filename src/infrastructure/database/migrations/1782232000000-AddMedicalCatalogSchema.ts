import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMedicalCatalogSchema1782232000000 implements MigrationInterface {
  name = 'AddMedicalCatalogSchema1782232000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── specialties ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "his"."specialties" (
        "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code"        character varying NOT NULL,
        "name"        character varying NOT NULL,
        "description" text,
        "icon_url"    character varying,
        "is_active"   boolean NOT NULL DEFAULT true,
        "created_at"  TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_specialties" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_specialties_code" UNIQUE ("code")
      )
    `);

    // ─── services ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "his"."services" (
        "id"                    uuid NOT NULL DEFAULT uuid_generate_v4(),
        "specialty_id"          uuid,
        "code"                  character varying NOT NULL,
        "name"                  character varying NOT NULL,
        "category"              character varying NOT NULL DEFAULT 'EXAMINATION',
        "insurance_code"        character varying,
        "description"           text,
        "duration_minutes"      integer NOT NULL DEFAULT 30,
        "result_duration_hours" integer,
        "is_active"             boolean NOT NULL DEFAULT true,
        "created_at"            TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"            TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_services" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_services_code" UNIQUE ("code")
      )
    `);

    // ─── service_prices ────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "his"."service_prices" (
        "id"             uuid NOT NULL DEFAULT uuid_generate_v4(),
        "service_id"     uuid NOT NULL,
        "price_type"     character varying NOT NULL,
        "amount"         numeric(15,2) NOT NULL,
        "vat_rate"       numeric(5,2) NOT NULL DEFAULT 0,
        "effective_date" date NOT NULL,
        "created_at"     TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_service_prices" PRIMARY KEY ("id"),
        CONSTRAINT "FK_service_prices_service" FOREIGN KEY ("service_id")
          REFERENCES "his"."services"("id") ON DELETE CASCADE
      )
    `);

    // ─── icd10_codes ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "his"."icd10_codes" (
        "id"           uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code"         character varying NOT NULL,
        "name"         character varying NOT NULL,
        "name_en"      character varying,
        "specialty_id" uuid,
        "is_active"    boolean NOT NULL DEFAULT true,
        "created_at"   TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_icd10_codes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_icd10_codes_code" UNIQUE ("code")
      )
    `);

    // ─── medications ───────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "his"."medications" (
        "id"                      uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code"                    character varying NOT NULL,
        "national_code"           character varying,
        "name"                    character varying NOT NULL,
        "active_ingredient"       character varying NOT NULL,
        "concentration"           character varying NOT NULL,
        "unit"                    character varying NOT NULL,
        "usage_unit"              character varying,
        "route_of_administration" character varying NOT NULL DEFAULT 'ORAL',
        "max_dose_per_day"        character varying,
        "group_name"              character varying,
        "is_active"               boolean NOT NULL DEFAULT true,
        "created_at"              TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"              TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_medications" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_medications_code" UNIQUE ("code"),
        CONSTRAINT "UQ_medications_national_code" UNIQUE ("national_code")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "his"."medications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "his"."icd10_codes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "his"."service_prices"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "his"."services"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "his"."specialties"`);
  }
}
