import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTable1753000000000 implements MigrationInterface {
    name = 'CreateNotificationsTable1753000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."notifications_type_enum" AS ENUM(
                'signal_created', 
                'signal_closed', 
                'subscription_approved', 
                'subscription_rejected', 
                'challenge_approved', 
                'challenge_rejected', 
                'account_updated', 
                'system_announcement'
            )
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."notifications_priority_enum" AS ENUM(
                'low', 
                'medium', 
                'high', 
                'urgent'
            )
        `);
        
        await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "message" text NOT NULL,
                "type" "public"."notifications_type_enum" NOT NULL,
                "priority" "public"."notifications_priority_enum" NOT NULL DEFAULT 'medium',
                "isRead" boolean NOT NULL DEFAULT false,
                "metadata" json,
                "actionUrl" character varying,
                "userId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id")
            )
        `);
        
        await queryRunner.query(`
            ALTER TABLE "notifications"
            ADD CONSTRAINT "FK_notifications_userId"
            FOREIGN KEY ("userId") REFERENCES "user"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_notifications_userId" ON "notifications" ("userId")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_notifications_isRead" ON "notifications" ("isRead")
        `);
        
        await queryRunner.query(`
            CREATE INDEX "IDX_notifications_createdAt" ON "notifications" ("createdAt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_notifications_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_notifications_isRead"`);
        await queryRunner.query(`DROP INDEX "IDX_notifications_userId"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_userId"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    }
} 