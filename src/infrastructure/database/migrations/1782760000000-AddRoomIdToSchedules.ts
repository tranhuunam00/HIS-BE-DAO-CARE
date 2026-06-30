import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoomIdToSchedules1782760000000 implements MigrationInterface {
  name = 'AddRoomIdToSchedules1782760000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" ADD COLUMN "room_id" uuid`);
    await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" ADD COLUMN "room_id" uuid`);
    await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" ADD CONSTRAINT "FK_staff_schedule_templates_room" FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" ADD CONSTRAINT "FK_staff_schedule_overrides_room" FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE SET NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" DROP CONSTRAINT IF EXISTS "FK_staff_schedule_templates_room"`);
    await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" DROP CONSTRAINT IF EXISTS "FK_staff_schedule_overrides_room"`);
    await queryRunner.query(`ALTER TABLE "his"."staff_schedule_templates" DROP COLUMN IF EXISTS "room_id"`);
    await queryRunner.query(`ALTER TABLE "his"."staff_schedule_overrides" DROP COLUMN IF EXISTS "room_id"`);
  }
}
