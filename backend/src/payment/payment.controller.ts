import { Controller, Post, Body, UseGuards, Req, Headers } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) { }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @Body() dto: CreateCheckoutDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentService.createCheckoutSession(dto.assetId, user.userId);
  }

  @Post('webhook')
  @Public()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request & { rawBody?: Buffer },
  ) {
    const rawBody = request.rawBody || Buffer.from('');
    return this.paymentService.handleWebhook(signature, rawBody);
  }
}
