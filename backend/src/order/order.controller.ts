import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private orderService: OrderService) { }

  @Get('me')
  async getMyOrders(@CurrentUser() user: any) {
    // Get user from database
    const dbUser = await this.orderService['prisma'].user.findUnique({
      where: { id: user.userId },
    });

    if (!dbUser) {
      throw new Error('User not found');
    }

    return this.orderService.findUserOrders(dbUser.id);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string, @CurrentUser() user: any) {
    const dbUser = await this.orderService['prisma'].user.findUnique({
      where: { id: user.userId },
    });

    if (!dbUser) {
      throw new Error('User not found');
    }

    return this.orderService.findOne(id, dbUser.id);
  }
}
