/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private _client: PrismaClient;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    this._client = new PrismaClient({ adapter });

    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
          return (target as any)[prop];
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const val = (target._client as any)[prop];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return typeof val === 'function' ? val.bind(target._client) : val;
      },
    });
  }

  async onModuleInit() {
    await this._client.$connect();
    console.log('✅ Database connected');
    await this._client.$queryRaw`SELECT 1`;
    console.log('✅ Database query OK');
  }

  async onModuleDestroy() {
    await this._client.$disconnect();
  }
}
