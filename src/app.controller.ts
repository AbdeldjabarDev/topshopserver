import { Controller, Get ,Query,Param, Post, Redirect, UseGuards,Header,Req,Res, Options, Head} from '@nestjs/common';
import { reduce } from 'rxjs';
import { AccountsService } from './accounts/accounts.service';

import {AuthGuard} from '@nestjs/passport'
import { readFileSync } from 'fs';
import { Request, Response } from 'express';
import { ProductsService } from './products/products.service';
const stripe = require('stripe')(process.env.STRIPE_TEST_API_KEY);
@Controller()
export class AppController {
  constructor(private readonly accountsService:AccountsService,private readonly productsService:ProductsService) {}
@Post('/accounts/create')
@Header('Access-Control-Allow-Origin','https://topshop-five.vercel.app,http://localhost:3000')
async create(@Req() req,@Res() res)
{
let e = req.body.email;
let password_hash = req.body.password_hash;
let ua = req.body.ua;
let status = await this.accountsService.createAccount(e,password_hash);
if(status.code == 0)
{
  let t = this.accountsService.createWebToken(e,password_hash);
  res.send(JSON.stringify({token:t}));
}

}
@Post('/login')
@Header('Access-Control-Allow-Origin','https://topshop-five.vercel.app')
async login(@Req() req)
{
  
  let res = await this.accountsService.checkAccount(req.body.email,req.body.password_hash);
  // console.log('login : req.body : \n' + JSON.stringify(req.body))
  console.log('login : ' + req.body.email + ':' + req.body.password_hash);
  switch(res.status)
  {
    case 0: 
    {
      let _token = await this.accountsService.createWebToken(req.body.email,req.body.password_hash);
      await this.accountsService.updateLastLogin(req.body.email);
      return {token:_token.token,error:0,last_login:new Date().toUTCString(),userId:_token.userId};
     }
    case 4:
    {
      return {token:null,error:res.status};
    }
    case 2:
    {
      return {token:null,error:res.status};
   }
  }
}
@Options('/login')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','*')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
l()
{
return '';
}
@Options('/accounts/create')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','*')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
s()
{
return '';
}
@Options('/purchase')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','https://topshop-five.vercel.app')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
l2()
{
return '';
}
@Post('/purchase')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','https://topshop-five.vercel.app')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
async purchase(@Req() req:Request,@Res() res:Response)
{
  // let request = req.body;
  // let items = request.items;
  // let total = request.total;
  // let t = request.token; 
  // console.log('given token : ' + t);
  // let code = await this.accountsService.checkWebToken(t);
  console.log(req.body.uid)

  let err = await this.accountsService.registerPurchase(req.body.uid,req.body.its);

  if(err.error == 0)
  {
    try{
      const session = await stripe.checkout.sessions.create({
        line_items: req.body.its,
        mode: 'payment',
        success_url: 'https://topshop-five.vercel.app/',
        cancel_url: 'http://localhost:23000/purchase-fail/'+req.body.uid,
      }); 
      res.json({url:session.url,error:0});
    }
    catch(_err)
    {
    console.log(err);
    await this.accountsService.unregisterPurchase(req.body.uid);
    res.json({url:undefined,error:2});
    }
  
  }
//  else
//  {
//   res.json({url:undefined,error:-1});
//  }
   
  


}

@Get('purchase-fail/:uid')
async unregisterPurchase(@Param('uid') uid,@Res() res,@Req() req)
{
await this.accountsService.unregisterPurchase(uid);
res.redirect('https://topshop-five.vercel.app/purchase-failed')
}
// @Header('Allow','POST')
// @Header('Access-Control-Allow-Origin','*')
// @Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
// async purchase(@Req() req)
// {
//   console.log(req.body)
//   return req.body;
// }
@Get('/remove-codes')
removeCodes()
{
  this.accountsService.dropCodes();
  return {status:"done"};
}
@Get('/remove')
remove()
{
this.accountsService.dropAccounts();
return {status:'done'}
}
@Post('/reset')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','*')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
async reset(@Req() req,@Res() res)
{
console.log(req.body);
let email = req.body.email;
console.log('reset request received : ' + email);
let result =await this.accountsService.generateVCode(email);
if(result.code == 0)
{
res.json({error:0});
}
else
{
res.json({error:result.code,message:result.message});
}

}
@Post('/reset/verify')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','*')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
async verify(@Req() req,@Res() res)
{
let c = req.body.c;
let email = req.body.email;
let result = await this.accountsService.checkVCode(req.body.code,req.body.email);
if(result.code == 0)
{
  res.json({error:0});
}
else
{
 res.json({error:result.code,message:result.message});
}

}
@Post('/reset/new')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','*')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
resetPassword(@Req() req)
{

let result = this.accountsService.resetPassword(req.body.email,req.body.password_hash);
return {error:0}


} 
@Options('/reset')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','*')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
d_r()
{
return '';
}
@Options('/reset/verify')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','*')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
d_r_v()
{
return '';
}
@Options('/reset/new')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','*')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
d_r_n()
{
return '';
}
@Get('/get-account')
async getAccount(@Res() res)
{
   let acc = await this.accountsService.Account.findOne({email:"ousseddikabdo@gmail.com"});
   res.json(acc); 
}
@Options('/purchases')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','https://topshop-five.vercel.app')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
p_r_n()
{
return '';
}
@Post('/purchases')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','https://topshop-five.vercel.app')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
async getPurchases(@Req() req)
{
  let uid = req.body.uid;
  let ps = await this.accountsService.getPurchases(uid);
  return {error:0,purchases:ps}
}
@Options('/report')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','https://topshop-five.vercel.app')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
r_p()
{
return '';
}
@Post('/report')
@Header('Allow','POST')
@Header('Access-Control-Allow-Origin','https://topshop-five.vercel.app')
@Header('Access-Control-Allow-Headers','content-type,access-control-allow-origin')
async report(@Req() req)
{
  let uid = req.body.uid;
  let ps = await this.accountsService.registerReport(uid,req.body.name,req.body.em,req.body.subject,req.body.issue);
  return ps;
}
@Get('/get-reports')
async getReports()
{
 let rs = await this.accountsService.getReports();
 return rs;
}
@Post('/drop-reports')
async dropReports()
{
  try
  {
    await this.accountsService.dropReports();
    return {error:0}
  }
  catch(e)
  {
return {error:-1};
  }
}
@Post('/drop-purchases/:uid')
async dropPurchases(@Param('uid') uid)
{
  let res = await this.accountsService.dropPurchases(uid);
  return res;
}
}
