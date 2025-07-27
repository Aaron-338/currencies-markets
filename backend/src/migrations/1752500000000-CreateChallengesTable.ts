import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChallengesTable1752500000000 implements MigrationInterface {
    name = 'CreateChallengesTable1752500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."challenges_status_enum" AS ENUM(
                'submitted', 
                'under_review', 
                'approved', 
                'rejected'
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE "challenges" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "description" text NOT NULL,
                "screenshotPath" character varying,
                "status" "public"."challenges_status_enum" NOT NULL DEFAULT 'submitted',
                "adminNotes" character varying,
                "googleMeetLink" character varying,
                "reviewedBy" character varying,
                "reviewedAt" TIMESTAMP,
                "userId" integer NOT NULL,
                "subscriptionId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_challenges_id" PRIMARY KEY ("id")
            )
        `);
        
        await queryRunner.query(`
            ALTER TABLE "challenges"
            ADD CONSTRAINT "FK_challenges_userId"
            FOREIGN KEY ("userId") REFERENCES "user"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        
        await queryRunner.query(`
            ALTER TABLE "challenges"
            ADD CONSTRAINT "FK_challenges_subscriptionId"
            FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "challenges" DROP CONSTRAINT "FK_challenges_subscriptionId"`);
        await queryRunner.query(`ALTER TABLE "challenges" DROP CONSTRAINT "FK_challenges_userId"`);
        await queryRunner.query(`DROP TABLE "challenges"`);
        await queryRunner.query(`DROP TYPE "public"."challenges_status_enum"`);
    }
} 