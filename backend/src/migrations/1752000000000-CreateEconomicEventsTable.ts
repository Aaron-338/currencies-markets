import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateEconomicEventsTable1752000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'economic_events',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'eventName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'country',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'countryCode',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'releaseDate',
            type: 'timestamp',
          },
          {
            name: 'releaseTime',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'importance',
            type: 'enum',
            enum: ['low', 'medium', 'high'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['scheduled', 'released', 'revised', 'cancelled'],
            default: "'scheduled'",
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'actual',
            type: 'decimal',
            precision: 15,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'forecast',
            type: 'decimal',
            precision: 15,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'previous',
            type: 'decimal',
            precision: 15,
            scale: 4,
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'source',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'externalId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'period',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'isRevised',
            type: 'boolean',
            default: false,
          },
          {
            name: 'lastUpdated',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX IDX_economic_events_release_date_importance ON economic_events ("releaseDate", importance);
    `);
    
    await queryRunner.query(`
      CREATE INDEX IDX_economic_events_country ON economic_events (country);
    `);
    
    await queryRunner.query(`
      CREATE INDEX IDX_economic_events_event_name ON economic_events ("eventName");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IDX_economic_events_external_id ON economic_events ("externalId");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IDX_economic_events_source ON economic_events (source);
    `);
    
    await queryRunner.query(`
      CREATE INDEX IDX_economic_events_last_updated ON economic_events ("lastUpdated");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('economic_events');
  }
} 