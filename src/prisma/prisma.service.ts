import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(config: ConfigService) {
        super({
            datasources: {
                db:{
                    url: config.get('DATABASE_URL'),
                }
            }
        });
    }

    async onModuleInit() {
        try {
            await this.$connect()            
        } catch (error) {
            console.error("Unable to connect to database    ",error);
            
        }
        
    }

    async onModuleDestroy() { 
        await this.$disconnect()
    }
}
