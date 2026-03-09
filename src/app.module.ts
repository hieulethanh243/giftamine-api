import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WishlistsModule } from './modules/wishlists/wishlists.module';
import { GiftItemsModule } from './modules/gift-items/gift-items.module';
import { PurchasedModule } from './modules/purchased/purchased.module';
import { AnniversariesModule } from './modules/anniversaries/anniversaries.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { CouplesModule } from './modules/couples/couples.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PlanGuard } from './common/guards/plan.guard';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
    }),
    AuthModule,
    UsersModule,
    WishlistsModule,
    GiftItemsModule,
    PurchasedModule,
    AnniversariesModule,
    RemindersModule,
    SubscriptionsModule,
    CouplesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PlanGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
