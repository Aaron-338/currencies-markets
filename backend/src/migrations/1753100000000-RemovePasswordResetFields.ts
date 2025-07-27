import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePasswordResetFields1753100000000
  implements MigrationInterface
{
  name = 'RemovePasswordResetFields1753100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "passwordResetToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "passwordResetExpires"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "passwordResetToken" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "passwordResetExpires" TIMESTAMP`,
    );
  }
} 