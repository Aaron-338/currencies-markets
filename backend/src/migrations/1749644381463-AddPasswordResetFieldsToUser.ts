import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetFieldsToUser1749644381463
  implements MigrationInterface
{
  name = 'AddPasswordResetFieldsToUser1749644381463';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "passwordResetToken" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "passwordResetExpires" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "passwordResetExpires"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "passwordResetToken"`,
    );
  }
}
