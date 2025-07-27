import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service.js';
import { Transaction } from './transaction.entity.js';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() transaction: Transaction): Promise<Transaction> {
    return this.transactionsService.create(transaction);
  }

  @Get()
  findAll(): Promise<Transaction[]> {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Transaction> {
    const transaction = await this.transactionsService.findOne(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found.`);
    }
    return transaction;
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updatedTransaction: Partial<Transaction>): Promise<Transaction> {
    return this.transactionsService.update(id, updatedTransaction);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.transactionsService.remove(id);
  }
} 