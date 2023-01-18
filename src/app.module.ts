import { Module } from '@nestjs/common';
import { AccountModule } from './accounts/accounts.module';
import { AccountsService } from './accounts/accounts.service';
import { AppController } from './app.controller';

import { ProductsController } from './products/products.controller';
import { ProductsModule } from './products/products.module';
import { ProductsService } from './products/products.service';


@Module({
  imports: [AccountModule,ProductsModule],
  controllers: [AppController,ProductsController],
  providers: [AccountsService,ProductsService],
})
export class AppModule {}
