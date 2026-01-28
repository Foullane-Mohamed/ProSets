import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AssetStatus } from '@prisma/client';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) { }

  /**
   * Create a new asset
   */
  async create(createAssetDto: CreateAssetDto, sellerId: string) {
    return this.prisma.asset.create({
      data: {
        ...createAssetDto,
        sellerId,
      },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get all published assets (public endpoint)
   */
  async findAll() {
    return this.prisma.asset.findMany({
      where: {
        status: AssetStatus.PUBLISHED,
      },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get a single asset by ID
   */
  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  /**
   * Get all assets for a specific seller
   */
  async findBySeller(sellerId: string) {
    return this.prisma.asset.findMany({
      where: { sellerId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update an asset
   */
  async update(id: string, updateAssetDto: UpdateAssetDto, userId: string) {
    const asset = await this.findOne(id);

    if (asset.sellerId !== userId) {
      throw new ForbiddenException('You can only update your own assets');
    }

    return this.prisma.asset.update({
      where: { id },
      data: updateAssetDto,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Delete an asset
   */
  async remove(id: string, userId: string) {
    const asset = await this.findOne(id);

    if (asset.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own assets');
    }

    return this.prisma.asset.delete({
      where: { id },
    });
  }

  /**
   * Check if user has purchased an asset
   */
  async hasUserPurchased(assetId: string, userId: string): Promise<boolean> {
    const order = await this.prisma.order.findFirst({
      where: {
        userId,
        status: 'PAID',
        items: {
          some: {
            assetId,
          },
        },
      },
    });

    return !!order;
  }
}
