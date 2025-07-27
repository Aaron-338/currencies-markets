import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRolesAndResponsibilitiesToUser1750000000000 implements MigrationInterface {
    name = 'AddRolesAndResponsibilitiesToUser1750000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "user" ADD "role" character varying NOT NULL DEFAULT 'user'`);
        // await queryRunner.query(`ALTER TABLE "user" ADD "verificationResponsibilities" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "verificationResponsibilities"`);
        // await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    }

} 