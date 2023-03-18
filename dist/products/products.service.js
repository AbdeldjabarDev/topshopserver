"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongodb_1 = require("mongodb");
const crypto_1 = require("crypto");
const http = require('https');
let ProductsService = class ProductsService {
    constructor() {
        this.products = [];
        this.ids = [];
        this.bootstrap();
    }
    async bootstrap() {
        this.db = (await mongodb_1.MongoClient.connect(process.env.DB_URL + '/productsdb' + process.env.ACCESS_PARAMS)).db();
        let cols = await this.db.collections();
        let products_collection = cols.find((c) => c.collectionName == 'products');
        if (products_collection)
            return;
        else
            this.insertProducts();
    }
    async insertProducts() {
        let ps;
        http.get('https://dummyjson.com/products', (res) => {
            res.setEncoding("utf-8");
            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);
            res.on('end', () => {
                ps = JSON.parse(rawData);
                console.log(ps.products);
                this.db.collection('products').insertMany(ps.products).then((res) => {
                    console.log('inerted ' + res.insertedCount + ' products.');
                    for (let id in res.insertedIds) {
                        this.ids.push(id.toString());
                    }
                }).catch((err) => {
                });
            });
        });
    }
    getIds() {
        console.log('getIds called');
        return this.ids;
    }
    async dispatchOrder(items, t) {
        for (let i = 0; i < items.length; i++) {
            let id = items[i].id;
            let product = await this.db.collection('products').findOne({ _id: id });
            if (items[i].quantity > product.stock)
                return { orderId: null, error: 'It is weird but somehow the client bypassed the ui constraints' };
            await this.db.collection('products').updateOne(product, { stock: product.stock - items[i].quantity, sold: product.sold + items[i].quantity });
        }
        let orderId = crypto_1.default.createHash('sha256').update(new Date().toString() + items.toString()).digest('hex');
        this.db.collection('orders').insertOne({ OrderId: orderId, date: new Date().toString(), userId: t.userId });
    }
    async getAllProducts() {
        let result, error;
        if (!this.db)
            return { result: null, error: "Internal Server error" };
        let cols = await this.db.collections();
        let products_collection = cols.find((c) => c.collectionName == 'products');
        if (products_collection) {
            try {
                result = await this.db.collection('products').find({}).toArray();
                this.products = result;
            }
            catch (err) {
                error = err;
            }
            return { result: result, error: error };
        }
        else {
            return 'no products found';
        }
    }
    async getProducts(query) {
        if (!this.db)
            return { result: null, error: "Internal Server error" };
        let result = await this.db.collection('products').find({ title: new RegExp('(' + query + ')(.)*', 'i') }).toArray();
        return result;
    }
    async getImage(id) {
        if (!this.db)
            return { result: null, error: "Internal Server error" };
        let image = await this.db.collection('images').findOne({ _id: mongodb_1.ObjectId.createFromHexString(id) });
        return { image: image, error: 0 };
    }
    async getAllImages() {
        let images = await this.db.collection('images').find({}).toArray();
        return images[5];
    }
    async removeCollections() {
        await this.db.dropCollection('products');
        await this.db.dropCollection('images');
    }
};
ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ProductsService);
exports.ProductsService = ProductsService;
//# sourceMappingURL=products.service.js.map