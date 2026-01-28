import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUploadUrlDto } from './dto/get-upload-url.dto';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private storageService: StorageService) { }

  @Post('upload-url')
  async getUploadUrl(@Body() dto: GetUploadUrlDto) {
    const url = await this.storageService.getUploadUrl(dto.key, dto.contentType);
    return { url };
  }
}
