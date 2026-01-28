import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { StorageService } from '../storage/storage.service';

@Controller('assets')
export class AssetController {
  constructor(
    private readonly assetService: AssetService,
    private readonly storageService: StorageService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createAssetDto: CreateAssetDto, @CurrentUser() user: any) {
    // Get user from database
    const dbUser = await this.assetService['prisma'].user.findUnique({
      where: { id: user.userId },
    });

    if (!dbUser) {
      throw new Error('User not found');
    }

    return this.assetService.create(createAssetDto, dbUser.id);
  }

  @Get()
  @Public()
  findAll() {
    return this.assetService.findAll();
  }

  @Get('my-assets')
  @UseGuards(JwtAuthGuard)
  async findMyAssets(@CurrentUser() user: any) {
    const dbUser = await this.assetService['prisma'].user.findUnique({
      where: { id: user.userId },
    });

    if (!dbUser) {
      throw new Error('User not found');
    }

    return this.assetService.findBySeller(dbUser.id);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.assetService.findOne(id);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async getDownloadUrl(@Param('id') id: string, @CurrentUser() user: any) {
    const dbUser = await this.assetService['prisma'].user.findUnique({
      where: { id: user.userId },
    });

    if (!dbUser) {
      throw new Error('User not found');
    }

    const asset = await this.assetService.findOne(id);

    // Check if user is the seller or has purchased the asset
    const isPurchased = await this.assetService.hasUserPurchased(id, dbUser.id);
    const isSeller = asset.sellerId === dbUser.id;

    if (!isPurchased && !isSeller) {
      throw new ForbiddenException('You must purchase this asset to download it');
    }

    // Generate presigned download URL
    const downloadUrl = await this.storageService.getDownloadUrl(asset.fileKey);

    return { url: downloadUrl };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @CurrentUser() user: any,
  ) {
    const dbUser = await this.assetService['prisma'].user.findUnique({
      where: { id: user.userId },
    });

    if (!dbUser) {
      throw new Error('User not found');
    }

    return this.assetService.update(id, updateAssetDto, dbUser.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const dbUser = await this.assetService['prisma'].user.findUnique({
      where: { id: user.userId },
    });

    if (!dbUser) {
      throw new Error('User not found');
    }

    return this.assetService.remove(id, dbUser.id);
  }
}
