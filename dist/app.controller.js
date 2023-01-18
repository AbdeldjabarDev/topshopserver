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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const accounts_service_1 = require("./accounts/accounts.service");
const products_service_1 = require("./products/products.service");
const stripe = require('stripe')(process.env.STRIPE_TEST_API_KEY);
let AppController = class AppController {
    constructor(accountsService, productsService) {
        this.accountsService = accountsService;
        this.productsService = productsService;
    }
    async create(req, res) {
        let e = req.body.email;
        let password_hash = req.body.password_hash;
        let ua = req.body.ua;
        let status = await this.accountsService.createAccount(e, password_hash);
        if (status.code == 0) {
            let t = this.accountsService.createWebToken(e, password_hash);
            res.send(JSON.stringify({ token: t }));
        }
    }
    async login(req) {
        let res = await this.accountsService.checkAccount(req.body.email, req.body.password_hash);
        console.log('login : ' + req.body.email + ':' + req.body.password_hash);
        switch (res.status) {
            case 0:
                {
                    let _token = await this.accountsService.createWebToken(req.body.email, req.body.password_hash);
                    await this.accountsService.updateLastLogin(req.body.email);
                    return { token: _token.token, error: 0, last_login: new Date().toUTCString(), userId: _token.userId };
                }
            case 4:
                {
                    return { token: null, error: res.status };
                }
            case 2:
                {
                    return { token: null, error: res.status };
                }
        }
    }
    l() {
        return '';
    }
    s() {
        return '';
    }
    l2() {
        return '';
    }
    async purchase(req, res) {
        console.log(req.body.uid);
        let err = await this.accountsService.registerPurchase(req.body.uid, req.body.its);
        if (err.error == 0) {
            try {
                const session = await stripe.checkout.sessions.create({
                    line_items: req.body.its,
                    mode: 'payment',
                    success_url: 'https://topshop-five.vercel.app/',
                    cancel_url: 'http://localhost:23000/purchase-fail/' + req.body.uid,
                });
                res.json({ url: session.url, error: 0 });
            }
            catch (_err) {
                console.log(err);
                await this.accountsService.unregisterPurchase(req.body.uid);
                res.json({ url: undefined, error: 2 });
            }
        }
    }
    async unregisterPurchase(uid, res, req) {
        await this.accountsService.unregisterPurchase(uid);
        res.redirect('https://topshop-five.vercel.app/purchase-failed');
    }
    removeCodes() {
        this.accountsService.dropCodes();
        return { status: "done" };
    }
    remove() {
        this.accountsService.dropAccounts();
        return { status: 'done' };
    }
    async reset(req, res) {
        console.log(req.body);
        let email = req.body.email;
        console.log('reset request received : ' + email);
        let result = await this.accountsService.generateVCode(email);
        if (result.code == 0) {
            res.json({ error: 0 });
        }
        else {
            res.json({ error: result.code, message: result.message });
        }
    }
    async verify(req, res) {
        let c = req.body.c;
        let email = req.body.email;
        let result = await this.accountsService.checkVCode(req.body.code, req.body.email);
        if (result.code == 0) {
            res.json({ error: 0 });
        }
        else {
            res.json({ error: result.code, message: result.message });
        }
    }
    resetPassword(req) {
        let result = this.accountsService.resetPassword(req.body.email, req.body.password_hash);
        return { error: 0 };
    }
    d_r() {
        return '';
    }
    d_r_v() {
        return '';
    }
    d_r_n() {
        return '';
    }
    async getAccount(res) {
        let acc = await this.accountsService.Account.findOne({ email: "ousseddikabdo@gmail.com" });
        res.json(acc);
    }
    p_r_n() {
        return '';
    }
    async getPurchases(req) {
        let uid = req.body.uid;
        let ps = await this.accountsService.getPurchases(uid);
        return { error: 0, purchases: ps };
    }
    r_p() {
        return '';
    }
    async report(req) {
        let uid = req.body.uid;
        let ps = await this.accountsService.registerReport(uid, req.body.name, req.body.em, req.body.subject, req.body.issue);
        return ps;
    }
    async getReports() {
        let rs = await this.accountsService.getReports();
        return rs;
    }
    async dropReports() {
        try {
            await this.accountsService.dropReports();
            return { error: 0 };
        }
        catch (e) {
            return { error: -1 };
        }
    }
    async dropPurchases(uid) {
        let res = await this.accountsService.dropPurchases(uid);
        return res;
    }
};
__decorate([
    (0, common_1.Post)('/accounts/create'),
    (0, common_1.Header)('Access-Control-Allow-Origin', 'https://topshop-five.vercel.app'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('/login'),
    (0, common_1.Header)('Access-Control-Allow-Origin', 'https://topshop-five.vercel.app'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "login", null);
__decorate([
    (0, common_1.Options)('/login'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', '*'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "l", null);
__decorate([
    (0, common_1.Options)('/accounts/create'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', '*'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "s", null);
__decorate([
    (0, common_1.Options)('/purchase'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', 'https://topshop-five.vercel.app'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "l2", null);
__decorate([
    (0, common_1.Post)('/purchase'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', 'https://topshop-five.vercel.app'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "purchase", null);
__decorate([
    (0, common_1.Get)('purchase-fail/:uid'),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "unregisterPurchase", null);
__decorate([
    (0, common_1.Get)('/remove-codes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "removeCodes", null);
__decorate([
    (0, common_1.Get)('/remove'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('/reset'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', '*'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "reset", null);
__decorate([
    (0, common_1.Post)('/reset/verify'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', '*'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)('/reset/new'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', '*'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Options)('/reset'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', '*'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "d_r", null);
__decorate([
    (0, common_1.Options)('/reset/verify'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', '*'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "d_r_v", null);
__decorate([
    (0, common_1.Options)('/reset/new'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', '*'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "d_r_n", null);
__decorate([
    (0, common_1.Get)('/get-account'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getAccount", null);
__decorate([
    (0, common_1.Options)('/purchases'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', 'https://topshop-five.vercel.app'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "p_r_n", null);
__decorate([
    (0, common_1.Post)('/purchases'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', 'https://topshop-five.vercel.app'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getPurchases", null);
__decorate([
    (0, common_1.Options)('/report'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', 'https://topshop-five.vercel.app'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "r_p", null);
__decorate([
    (0, common_1.Post)('/report'),
    (0, common_1.Header)('Allow', 'POST'),
    (0, common_1.Header)('Access-Control-Allow-Origin', 'https://topshop-five.vercel.app'),
    (0, common_1.Header)('Access-Control-Allow-Headers', 'content-type,access-control-allow-origin'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "report", null);
__decorate([
    (0, common_1.Get)('/get-reports'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getReports", null);
__decorate([
    (0, common_1.Post)('/drop-reports'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "dropReports", null);
__decorate([
    (0, common_1.Post)('/drop-purchases/:uid'),
    __param(0, (0, common_1.Param)('uid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "dropPurchases", null);
AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [accounts_service_1.AccountsService, products_service_1.ProductsService])
], AppController);
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map