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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
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
  providers: [AppService],
})
export class AppModule {}
