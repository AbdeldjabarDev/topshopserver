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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const accounts_service_1 = require("../accounts/accounts.service");
const products_service_1 = require("./products.service");
const fs = require('fs');
let ProductsController = class ProductsController {
    constructor(productsService, accountService) {
        this.productsService = productsService;
        this.accountService = accountService;
    }
    async returnProducts(req, res) {
        let urlStr = req.url.toString();
        let i = urlStr.indexOf('?');
        if (i != -1) {
            console.log('getProducts called with query string : ' + urlStr.substring(i, urlStr.length - 1).split('=')[1]);
            let result = await this.productsService.getProducts(urlStr.substring(i, urlStr.length - 1).split('=')[1]);
            res.send(JSON.stringify(result));
            return;
        }
        console.log('getAllProducts called');
        let response = await this.productsService.getAllProducts();
        res.send(JSON.stringify(response));
    }
    async returnAllImages(res) {
        let images = await this.productsService.getAllImages();
        console.log(images.image.length());
        res.send(images.image.buffer);
    }
    getAllIds() {
        return this.productsService.getIds();
    }
    async getImage(res, req, id) {
        console.log('got id : ' + id);
        let image = await this.productsService.getImage(id);
        res.send(image.image.buffer);
    }
    async remove() {
        await this.productsService.removeCollections();
        return 'done';
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Header)('Content-Type', 'application/json'),
    (0, common_1.Header)('Access-Control-Allow-Origin', '*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "returnProducts", null);
__decorate([
    (0, common_1.Get)('allimages'),
    (0, common_1.Header)('Content-Type', 'image/jpeg'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "returnAllImages", null);
__decorate([
    (0, common_1.Get)('ids'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getAllIds", null);
__decorate([
    (0, common_1.Get)('/images/:id'),
    (0, common_1.Header)('Content-Type', 'image/jpeg'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getImage", null);
__decorate([
    (0, common_1.Get)('remove'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        accounts_service_1.AccountsService])
], ProductsController);
exports.ProductsController = ProductsController;
//# sourceMappingURL=products.controller.js.map