import {
  Controller,
  Get,
  Head,
  Header,
  HttpCode,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { readFileSync } from 'fs';
import { get } from 'http';
import { AccountsService } from 'src/accounts/accounts.service';
import { json } from 'stream/consumers';
import { ProductsService } from './products.service';
import { Response, Request } from 'express';
import { btoa } from 'buffer';
import { Binary } from 'mongodb';
const fs = require('fs');
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly accountService: AccountsService,
  ) {}
  @Get()
  @Header('Content-Type', 'application/json')
  @Header('Access-Control-Allow-Origin', '*')
  async returnProducts(@Req() req:Request, @Res() res) {
    let urlStr = req.url.toString();
    let i = urlStr.indexOf('?');
  
    if (i != -1) {
      console.log('getProducts called with query string : ' + urlStr.substring(i,urlStr.length-1).split('=')[1]);
      let result = await this.productsService.getProducts(urlStr.substring(i,urlStr.length-1).split('=')[1]);
      res.send(JSON.stringify(result));
      return;
    }
    console.log('getAllProducts called');
    let response = await this.productsService.getAllProducts();
    res.send(JSON.stringify(response));
  }

  @Get('allimages')
  @Header('Content-Type', 'image/jpeg')
  async returnAllImages(@Res() res) {
    let images = await this.productsService.getAllImages();
    console.log(images.image.length());
    res.send(images.image.buffer);

    // let firstImage = readFileSync('C:/Users/LEGION/Desktop/images/pinkish_shirt.jpg');
    // console.log('first image byte length ' + firstImage.byteLength);
    // console.log('first image length' + firstImage.length);

    // console.log(firstImage.toString('base64'))

    //  res.send(firstImage);
  }
  @Get('ids')
  getAllIds() {
    return this.productsService.getIds();
  }
  @Get('/images/:id')
  @Header('Content-Type', 'image/jpeg')
  // @Header('Accept-Ranges','bytes')
  async getImage(@Res() res: Response, @Req() req: Request, @Param('id') id) {
    console.log('got id : ' + id);
    let image = await this.productsService.getImage(id);
    res.send(image.image.buffer);
  }
  @Get('remove')
  async remove() {
    await this.productsService.removeCollections();
    return 'done';
  }
}
