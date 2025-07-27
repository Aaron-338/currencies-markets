import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSignalsTable1751977486408 implements MigrationInterface {
    name = 'CreateSignalsTable1751977486408'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."signals_type_enum" AS ENUM('buy', 'sell')`);
        await queryRunner.query(`CREATE TYPE "public"."signals_status_enum" AS ENUM('active', 'closed')`);
        await queryRunner.query(`CREATE TABLE "signals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "symbol" character varying NOT NULL, "entry_price" numeric(10,2) NOT NULL, "stop_loss" numeric(10,2) NOT NULL, "take_profit" numeric(10,2) NOT NULL, "type" "public"."signals_type_enum" NOT NULL, "status" "public"."signals_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "closedAt" TIMESTAMP, CONSTRAINT "PK_04eeac09c09b65bc55c628c101d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "signals"`);
        await queryRunner.query(`DROP TYPE "public"."signals_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."signals_type_enum"`);
    }

}
