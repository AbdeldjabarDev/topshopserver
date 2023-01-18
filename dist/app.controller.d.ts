import { AccountsService } from './accounts/accounts.service';
import { Request, Response } from 'express';
import { ProductsService } from './products/products.service';
export declare class AppController {
    private readonly accountsService;
    private readonly productsService;
    constructor(accountsService: AccountsService, productsService: ProductsService);
    create(req: any, res: any): Promise<void>;
    login(req: any): Promise<{
        token: any;
        error: number;
        last_login: string;
        userId: any;
    } | {
        token: any;
        error: any;
        last_login?: undefined;
        userId?: undefined;
    }>;
    l(): string;
    s(): string;
    l2(): string;
    purchase(req: Request, res: Response): Promise<void>;
    unregisterPurchase(uid: any, res: any, req: any): Promise<void>;
    removeCodes(): {
        status: string;
    };
    remove(): {
        status: string;
    };
    reset(req: any, res: any): Promise<void>;
    verify(req: any, res: any): Promise<void>;
    resetPassword(req: any): {
        error: number;
    };
    d_r(): string;
    d_r_v(): string;
    d_r_n(): string;
    getAccount(res: any): Promise<void>;
    p_r_n(): string;
    getPurchases(req: any): Promise<{
        error: number;
        purchases: any;
    }>;
    r_p(): string;
    report(req: any): Promise<{
        error: number;
    }>;
    getReports(): Promise<{
        error: number;
        reports: any;
    }>;
    dropReports(): Promise<{
        error: number;
    }>;
    dropPurchases(uid: any): Promise<{
        error: number;
        purchases?: undefined;
    } | {
        error: number;
        purchases: any;
    }>;
}
