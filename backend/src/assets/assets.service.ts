import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './asset.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetsRepository: Repository<Asset>,
  ) {}

  findAll(): Promise<Asset[]> {
    return this.assetsRepository.find();
  }

  async findOne(id: number): Promise<Asset> {
    const asset = await this.assetsRepository.findOneBy({ id });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found.`);
    }
    return asset;
  }

  create(asset: Asset): Promise<Asset> {
    return this.assetsRepository.save(asset);
  }

  async remove(id: number): Promise<void> {
    await this.assetsRepository.delete(id);
  }

  async update(id: number, updatedAsset: Partial<Asset>): Promise<Asset> {
    await this.assetsRepository.update(id, updatedAsset);
    return this.findOne(id);
  }
}