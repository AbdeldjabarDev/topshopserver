import { Injectable } from "@nestjs/common";
import { Db, MongoClient, ObjectId } from "mongodb";
import crypto from 'crypto'
const http = require('https')

@Injectable()
export class ProductsService
{ 
    db: Db;
    products = [];
    ids = [];
    constructor()
    {
    
    
   
      
       MongoClient.connect( process.env.DB_URL+'/productsdb' + process.env.ACCESS_PARAMS).then((con)=>{
        this.db = con.db();
        this.bootstrap();
       });
      
    
    }
    async bootstrap()
    {
      let dontinsert = false;
      let colls = await this.db.listCollections();
      await colls.forEach((col)=>{
        if(col.name == 'products' || col.name == 'images')
        {
           dontinsert = true;
        }
        
      })
        if(!dontinsert)
        {
          this.insertProducts();
        }
       
    }
    async insertProducts()
    {
         let ps;
         http.get('https://dummyjson.com/products',(res)=>
         {
          res.setEncoding("utf-8");
          let rawData ='';
          res.on('data',(chunk)=> rawData+=chunk);
          res.on('end',()=>{
            ps = JSON.parse(rawData);
            console.log(ps.products);
            /*
            for(let p in ps.products)
            {
              let {prod,images} = p;
              for(let img in images)
              {
                http.get(img),(res)=>
                {
                  let rawData;
                  res.on('data',(chunk) => rawData+= chunk);
                  res.on('end',()=>{
                    
                  })
                }
              }
            }
            */ 
            this.db.collection('products').insertMany(ps.products).then((res)=>{
             console.log('inerted ' + res.insertedCount + ' products.');
             for(let id in res.insertedIds)
             {this.ids.push(id.toString());}
            }).catch((err) =>
            {

            })
          })
         })
         
        // let firstImage = readFileSync('C:/Users/LEGION/Desktop/images/pinkish_shirt.jpg');
        // let secondImage = readFileSync('C:/Users/LEGION/Desktop/images/black_t-shirt.jpg');
        // let thirdImage = readFileSync('C:/Users/LEGION/Desktop/images/yellow_dress.jpg');
        // this.db.collection('images').insertMany([{image:firstImage,length:firstImage.length},
        //   {image:secondImage,length:secondImage.length},
        //   {image:thirdImage,length:thirdImage.length}]).then((result)=>{
        //   console.log(result.insertedCount)
        //     console.log('images inserted');
        //   let products = [{name:'Zara Pink T-Shirt',tags:'t-shirt,zara,men',price:25,currency:'USD',stock:20,sold:10,rating:2,image:result.insertedIds[0]},
        //   {name:'Gucci Yellow Dress',tags:'dress,gucci,women',price:30,currency:'USD',stock:20,sold:4,rating:4.5,image:result.insertedIds[1]},
        //   {name:'Boss Black Shirt',tags:'shirt,men,boss',price:20,currency:'USD',stock:20,sold:12,rating:4,image:result.insertedIds[2]}]
        // this.db.collection('products').insertMany(products).then((res)=>{
        //     console.log(res.insertedCount);
        //     console.log('products inserted');
        //     for(let i = 0; i< res.insertedCount;i++)
        //     {
        //       this.ids.push(res.insertedIds[i].toString());
        //     }
        //   })
        // })
        
        

    }
    getIds()
    {
      console.log('getIds called')
      return this.ids;
    }
    async dispatchOrder(items,t)
    {
      for(let i = 0;i < items.length;i++)
      {
        let id = items[i].id;
        let product = await this.db.collection('products').findOne({_id:id});
        if(items[i].quantity > product.stock)
        return {orderId:null,error:'It is weird but somehow the client bypassed the ui constraints'};
        await this.db.collection('products').updateOne(product,{stock:product.stock-items[i].quantity,sold:product.sold+ items[i].quantity});
      }
      //make order request to actual product store;
      let orderId = crypto.createHash('sha-256').update(new Date().toString() + items.toString()).digest('hex'); 
      this.db.collection('orders').insertOne({OrderId:orderId,date:new Date().toString(),userId:t.userId});
    }
    async getAllProducts()
    {
      // if(!this.products)
      // {
      //   console.log('no products in cache')
        let result,error;
      //   try
      //   {
      //     result = await this.db.collection('products').find({});
      //     this.products = result;
      //   }
      //   catch(err)
      //   {
      //     error = err;
      //   }
      //  return {result:result,error:error};
      // }
      // else
      // return this.products;
      let dontsearch = true;
      let colls = await this.db.listCollections();
      await colls.forEach((col)=>{
        if(col.name == 'products' || col.name == 'images')
        {
           dontsearch = false;
        }
        
      })
        if(!dontsearch)
        {
          try
        {
          result = await this.db.collection('products').find({}).toArray();
          this.products = result;
        }
        catch(err)
        {
          error = err;
        }
       return {result:result,error:error}; 
        }
       else
       {
        return 'no products found';
       }
      
      
       
      // return [{name:'Boss Black Shirt',tags:'shirt,men,boss',price:20,currency:'USD',available:20,image:'/images/black_t-shirt.jpg',rating:4},
      // {name:'Gucci Yellow Dress',tags:'dress,gucci,women',price:30,currency:'USD',available:20,image:'/images/yellow_dress.jpg',rating:4.5},
      // {name:'Zara Pink T-Shirt',tags:'t-shirt,zara,men',price:25,currency:'USD',available:20,image:'/images/pinkish_shirt.jpg',rating:2}]
      
    }
    async getProducts(query : String) 
    {
      let result = await this.db.collection('products').find({title:new RegExp('(' + query + ')(.)*','i')}).toArray();
      //  let pwo;
      return result;
       if(!this.products)
       {
       
       }
       else
       {
        let result = [];
        this.products.forEach((prod)=>
        {
          if(prod.name.toString().match('(' + query + ')') || prod.tag.toString().match('(' + query + ')'))
          result.push(prod)
        })
        return result;
       }
    }
    async getImage(id)
    {
      // try
      // {
      //   let res = await this.db.collection('images').findOne({_id:id});
      //   return res;
      // }
      // catch(err)
      // {
      //   console.log('error getting image : ' + err);
      // }
      let res;
      
     // let images =await this.db.collection('images').find({_id:new ObjectId(id.toString())});
     
     let image = await this.db.collection('images').findOne({_id:ObjectId.createFromHexString(id)});
      return image;
     
      
    }
    async getAllImages()
    {
     let images = await this.db.collection('images').find({}).toArray();
     
     return images[5];
    }
    async removeCollections()
    {
      await this.db.dropCollection('products');
      await this.db.dropCollection('images');
    }
}