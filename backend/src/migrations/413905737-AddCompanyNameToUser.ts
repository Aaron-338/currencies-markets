import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyNameToUser1749413905737 implements MigrationInterface {
    name = 'AddCompanyNameToUser1749413905737';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "companyName" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "companyName"`);
    }
}
