import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2025-12-15.clover',
    });
  }

  /**
   * Create a Stripe Checkout Session for purchasing an asset
   */
  async createCheckoutSession(assetId: string, userId: string) {
    // Get asset details
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: { seller: true },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    // Create pending order
    const order = await this.prisma.order.create({
      data: {
        userId,
        totalAmount: asset.price,
        status: OrderStatus.PENDING,
        items: {
          create: {
            assetId: asset.id,
          },
        },
      },
    });

    // Create Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: asset.title,
              description: asset.description,
            },
            unit_amount: Math.round(Number(asset.price) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}/cancel`,
      metadata: {
        userId,
        assetId,
        orderId: order.id,
      },
    });

    // Update order with Stripe session ID
    await this.prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return { url: session.url };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(signature: string, rawBody: Buffer) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { orderId } = session.metadata as any;

      // Update order status to PAID
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      });
    }

    return { received: true };
  }
}
