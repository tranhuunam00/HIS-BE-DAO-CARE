import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoomServiceCapabilities1782613600000 implements MigrationInterface {
  name = 'AddRoomServiceCapabilities1782613600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "his"."room_service_capabilities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "room_id" uuid NOT NULL,
        "service_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_room_service_capabilities" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_room_service_capability" UNIQUE ("room_id", "service_id"),
        CONSTRAINT "FK_room_service_capabilities_room" FOREIGN KEY ("room_id") REFERENCES "his"."rooms"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_room_service_capabilities_service" FOREIGN KEY ("service_id") REFERENCES "his"."services"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "his"."room_service_capabilities"`);
  }
}
