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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose = require('mongoose');
const crypto = require('crypto');
const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const client = mailgun.client({ username: 'api', key: API_KEY });
let AccountsService = class AccountsService {
    constructor() {
        this.errors = [
            { code: 0, message: 'Operation Compledeted successfully' },
            { code: 1, message: 'Account already exists' },
            { code: 2, message: 'Account exists but different password' },
            { code: 3, message: 'Token is invalid' },
            { code: 4, message: 'Account does not exist' },
            { code: 5, message: '' },
        ];
        this.bootstrap();
    }
    async bootstrap() {
        console.log("STRIPE_TEST_API_KEY  : " + process.env.STRIPE_TEST_API_KEY);
        let accountsConnection = mongoose.createConnection(process.env.DB_URL + '/accountsdb' + process.env.ACCESS_PARAMS);
        let tokenConnection = mongoose.createConnection(process.env.DB_URL + '/tokensdb' + process.env.ACCESS_PARAMS);
        let tmpDBConnection = mongoose.createConnection(process.env.DB_URL + '/tmp' + process.env.ACCESS_PARAMS);
        let reportConnection = mongoose.createConnection(process.env.DB_URL + "/report" + process.env.ACCESS_PARAMS);
        let tokenSchema = mongoose.Schema({ token: String, expires: Date });
        let accountSchema = mongoose.Schema({
            email: String,
            password_hash: String,
            creation_date: Date,
            uid: String,
            loggedIn: false,
            last_login: Date,
            purchases: [],
        });
        let reportSchema = mongoose.Schema({ uid: String, name: String, email: String, subject: String, issue: String });
        let tmpSchema = mongoose.Schema({ identifier: Number, value: Object, target: String });
        this.Account = accountsConnection.model('Account', accountSchema);
        this.Token = tokenConnection.model('Token', tokenSchema);
        this.Tmp = tmpDBConnection.model('Tmp', tmpSchema);
        this.Report = reportConnection.model('Report', reportSchema);
    }
    async createAccount(email, pass_hash) {
        let possibleconflict = await this.Account.find({ email: email });
        let h = crypto.createHash("sha256");
        h.update(email + pass_hash + Math.ceil(Math.random() * 100000) + new Date().toUTCString());
        let newAccount = new this.Account({
            email: email,
            password_hash: pass_hash,
            creation_date: new Date().toUTCString(),
            loggedIn: true,
            last_login: new Date().toUTCString(),
            uid: h.digest().toString('base64'),
        });
        await newAccount.save();
        return this.errors[0];
    }
    async dropPurchases(uid) {
        console.log('dropPurchases : ' + {});
        let acc = await this.Account.findOne({ uid: uid });
        if (acc == undefined) {
            console.log('There is no account associated with this user id');
            return { error: -1 };
        }
        else {
            console.log('account with uid : ' + uid + 'has email : ' + acc.email);
            await this.Account.updateOne({ _id: acc.id }, { purchases: [] });
            let ac = await this.Account.findOne({ uid: uid });
            return { error: 0, purchases: ac.purchases };
        }
    }
    async dropAccounts() {
        await this.Account.collection.drop();
    }
    async dropCodes() {
        await this.Tmp.collection.drop();
    }
    async dropReports() {
        await this.Report.collection.drop();
    }
    async createWebToken(_email, pass_hash) {
        let ch = await this.Account.findOne({ email: _email });
        let h = crypto.createHash('sha1');
        h.update(ch.password_hash);
        console.log('createWebToken : ' + ch.email + ':' + ch.password_hash);
        if (pass_hash !== h.digest().toString('hex'))
            return { token: null, status: this.errors[2].code };
        let sha256Hash;
        sha256Hash = crypto.createHash('sha256');
        let ctoken = sha256Hash
            .update(_email.toString() + pass_hash.toString())
            .digest();
        let token = new this.Token({
            token: ctoken.toString('base64'),
            age: '84000',
            userId: ch.uid,
        });
        await token.save();
        setTimeout(() => {
            this.Token.deleteOne({ token: token });
        }, 840000);
        return { token: ctoken.toString('base64'), age: '84000', userId: ch.uid };
    }
    async checkWebToken(c_token) {
        let t = await this.Token.findOne({ token: c_token });
        console.log('found token : ' + t.token);
        if (t === (null || undefined)) {
            return this.errors[3];
        }
        return this.errors[0];
    }
    async resetPassword(_email, newpass_hash) {
        let prevAccount = this.Account.findOne({ email: _email });
        await this.Account.updateOne({ email: _email }, { password_hash: newpass_hash });
    }
    async checkAccount(_email, pass_hash) {
        let acc = await this.Account.findOne({ email: _email });
        if (acc === null) {
            return { status: this.errors[4].code, user: null };
        }
        console.log('checkAccount : ' + acc.email + ':' + acc.password_hash);
        let h = crypto.createHash('sha1');
        h.update(acc.password_hash);
        let p_hash = h.digest().toString('hex');
        if (p_hash != pass_hash) {
            console.log('real password hash : ' +
                p_hash +
                'given password hash: ' +
                pass_hash);
            return { status: this.errors[2].code, user: null };
        }
        return { status: this.errors[0].code, user: { email: _email, id: acc._id } };
    }
    async updateLastLogin(_email) {
        let acc = await this.Account.findOne({ email: _email });
        acc.update({ last_login: new Date().toUTCString() });
    }
    async generateVCode(email) {
        let code = Math.ceil(Math.random() * 1000000).toString();
        let _c = this.Tmp.findOne({ identifier: 0, target: email });
        if (!_c) {
            return { error: 3, message: 'We already sent you a verification code check your email !' };
        }
        let c = this.Account.findOne({ email: email });
        if (c) {
            let tmpcode = new this.Tmp({ identifier: 0, value: { code }, target: email });
            await tmpcode.save();
            setTimeout(() => {
                this.Tmp.findByIdAndDelete(tmpcode.id);
            }, 10 * 60 * 1000);
            const messageData = {
                from: 'TopShop' + ' <' + 'support@topshop.com' + '>',
                to: email,
                subject: 'TopShop Password reset request',
                text: 'This email contains a verification code that was sent based on a request from you to reset your TopShop password.\n' +
                    'Verification code : ' + code + '\n' +
                    'if you didn\'t request a password reset you can safely ignore this message.'
            };
            try {
                let res = await client.messages.create(DOMAIN, messageData);
                console.log(res);
                return { code: 0, message: '' };
            }
            catch (e) {
                console.error(e);
                return { code: 5, message: 'Internal error please try again later' };
            }
        }
        return { code: 1, message: 'This email does not correspond to any TopShop account' };
    }
    async checkVCode(code, email) {
        let c = await this.Tmp.findOne({ target: email });
        if (!c) {
            return { code: -2, message: "Internal error try siging up again or contact our support team" };
        }
        else {
            console.log('c : ' + c + 'code  : ' + code);
            if (c.value.code == code) {
                return { code: 0, message: '' };
            }
            else {
                return { code: 2, message: 'This code is invalid it is either wrong or timedout' };
            }
        }
    }
    async registerPurchase(uid, items) {
        console.log('registerPurchase : ' + Object.assign({}, items[0]));
        let acc = await this.Account.findOne({ uid: uid });
        if (acc == undefined) {
            console.log('There is no account associated with this user id');
            return { error: -1 };
        }
        else {
            console.log('account with uid : ' + uid + 'has email : ' + acc.email);
            let ps = await acc.get('purchases');
            ps.push({ items: items, status: 0 });
            console.log('n :' + ps);
            await this.Account.updateOne({ _id: acc.id }, { purchases: ps });
            let ac = await this.Account.findOne({ uid: uid });
            return { error: 0, purchases: ac.purchases };
        }
    }
    async unregisterPurchase(uid) {
        let acc = await this.Account.findOne({ uid: uid });
        if (acc == undefined) {
        }
        else {
            let purchases = await acc.purchases;
            let n = purchases.pop();
            await acc.update({ purchases: n });
            return;
        }
    }
    async getPurchases(uid) {
        console.log('uid : ' + uid);
        let ps = await this.Account.findOne({ uid: uid });
        console.log(...ps.purchases);
        return ps.purchases;
    }
    async registerReport(uid, nm, em, sub, iss) {
        let report = new this.Report({ uid: uid, name: nm, email: em, subject: sub, issue: iss });
        try {
            await report.save();
            return { error: 0 };
        }
        catch (e) {
            return { error: -1 };
        }
    }
    async getReports() {
        try {
            let res = await this.Report.find({});
            return { error: 0, reports: res };
        }
        catch (e) {
            return { error: -1, reports: null };
        }
    }
    async checkAdmin(admin) {
        let acc = this.Account.findOne({ email: admin });
    }
};
AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AccountsService);
exports.AccountsService = AccountsService;
//# sourceMappingURL=accounts.service.js.map