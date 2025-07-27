import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException } from '@nestjs/common';
import { AssetsService } from './assets.service.js';
import { Asset } from './asset.entity.js';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() asset: Asset): Promise<Asset> {
    return this.assetsService.create(asset);
  }

  @Get()
  findAll(): Promise<Asset[]> {
    return this.assetsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Asset> {
    const asset = await this.assetsService.findOne(id);
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found.`);
    }
    return asset;
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() asset: Partial<Asset>): Promise<Asset> {
    return this.assetsService.update(id, asset);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.assetsService.remove(id);
  }
} 