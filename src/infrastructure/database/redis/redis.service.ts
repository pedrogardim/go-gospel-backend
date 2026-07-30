import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Env } from '../../../config/env.schema';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(private readonly config: ConfigService<Env, true>) {
    this.redis = new Redis({
      host: this.config.get('REDIS_HOST'),
      port: this.config.get('REDIS_PORT'),
      password: this.config.get('REDIS_PASSWORD'),
    });
  }

  async set(key: string, value: string, ttl: number = 60 * 5) {
    await this.redis.set(key, value, 'EX', ttl);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async delete(key: string) {
    await this.redis.del(key);
  }

  async flushall() {
    await this.redis.flushall();
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
