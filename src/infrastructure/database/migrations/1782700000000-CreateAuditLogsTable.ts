import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogsTable1782700000000 implements MigrationInterface {
  name = 'CreateAuditLogsTable1782700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "his"."audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "user_name" varchar,
        "user_role" varchar,
        "action" varchar NOT NULL,
        "module" varchar NOT NULL,
        "description" text NOT NULL,
        "ip_address" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "his"."audit_logs"`);
  }
}
