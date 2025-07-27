import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSignalPricePrecision1751985201146 implements MigrationInterface {
    name = 'UpdateSignalPricePrecision1751985201146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signals" ALTER COLUMN "entry_price" TYPE numeric(20,4)`);
        await queryRunner.query(`ALTER TABLE "signals" ALTER COLUMN "stop_loss" TYPE numeric(20,4)`);
        await queryRunner.query(`ALTER TABLE "signals" ALTER COLUMN "take_profit" TYPE numeric(20,4)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "signals" ALTER COLUMN "take_profit" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "signals" ALTER COLUMN "stop_loss" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "signals" ALTER COLUMN "entry_price" TYPE numeric(10,2)`);
    }

}
