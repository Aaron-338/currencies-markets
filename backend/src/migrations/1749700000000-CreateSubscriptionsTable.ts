import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubscriptionsTable1749700000000 implements MigrationInterface {
    name = 'CreateSubscriptionsTable1749700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`
        //     CREATE TYPE "public"."subscriptions_type_enum" AS ENUM(
        //         'trading_signals', 
        //         'copy_trading', 
        //         'advanced_analytics', 
        //         'personal_coaching', 
        //         'ivrex_pro'
        //     )
        // `);
        
        // await queryRunner.query(`
        //     CREATE TYPE "public"."subscriptions_status_enum" AS ENUM(
        //         'pending', 
        //         'active', 
        //         'expired', 
        //         'cancelled', 
        //         'payment_failed'
        //     )
        // `);
        
        // await queryRunner.query(`
        //     CREATE TABLE "subscriptions" (
        //         "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        //         "userId" integer NOT NULL,
        //         "type" "public"."subscriptions_type_enum" NOT NULL,
        //         "price" numeric(10,2) NOT NULL,
        //         "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'pending',
        //         "paymentMethod" character varying,
        //         "paymentPhoneNumber" character varying,
        //         "receiptImagePath" character varying,
        //         "verificationNotes" character varying,
        //         "verifiedBy" character varying,
        //         "verifiedAt" TIMESTAMP,
        //         "expiresAt" TIMESTAMP NOT NULL,
        //         "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        //         "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        //         "user" integer,
        //         CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id")
        //     )
        // `);
        
        // await queryRunner.query(`
        //     ALTER TABLE "subscriptions"
        //     ADD CONSTRAINT "FK_e4e2ca15968c3fcd942cc89abf5"
        //     FOREIGN KEY ("userId") REFERENCES "user"("id")
        //     ON DELETE NO ACTION ON UPDATE NO ACTION
        // `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`
        //     ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_e4e2ca15968c3fcd942cc89abf5"
        // `);
        
        // await queryRunner.query(`
        //     DROP TABLE "subscriptions"
        // `);
        
        // await queryRunner.query(`
        //     DROP TYPE "public"."subscriptions_status_enum"
        // `);
        
        // await queryRunner.query(`
        //     DROP TYPE "public"."subscriptions_type_enum"
        // `);
    }
} 