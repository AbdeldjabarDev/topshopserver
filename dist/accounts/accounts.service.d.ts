export declare class AccountsService {
    Account: any;
    Token: any;
    Tmp: any;
    col_created: boolean;
    errors: any;
    Report: any;
    constructor();
    bootstrap(): Promise<void>;
    createAccount(email: any, pass_hash: any): Promise<any>;
    dropPurchases(uid: any): Promise<{
        error: number;
        purchases?: undefined;
    } | {
        error: number;
        purchases: any;
    }>;
    dropAccounts(): Promise<void>;
    dropCodes(): Promise<void>;
    dropReports(): Promise<void>;
    createWebToken(_email: any, pass_hash: any): Promise<{
        token: any;
        status: any;
        age?: undefined;
        userId?: undefined;
    } | {
        token: string;
        age: number;
        userId: any;
        status?: undefined;
    }>;
    checkWebToken(c_token: any): Promise<any>;
    resetPassword(_email: any, newpass_hash: any): Promise<void>;
    checkAccount(_email: any, pass_hash: any): Promise<{
        status: any;
        user: {
            email: any;
            id: any;
        };
    }>;
    updateLastLogin(_email: String): Promise<void>;
    generateVCode(email: any): Promise<{
        error: number;
        message: string;
        code?: undefined;
    } | {
        code: number;
        message: string;
        error?: undefined;
    }>;
    checkVCode(code: any, email: any): Promise<{
        code: number;
        message: string;
    }>;
    registerPurchase(uid: any, items: any): Promise<{
        error: number;
        purchases?: undefined;
    } | {
        error: number;
        purchases: any;
    }>;
    unregisterPurchase(uid: any): Promise<void>;
    getPurchases(uid: any): Promise<any>;
    registerReport(uid: any, nm: any, em: any, sub: any, iss: any): Promise<{
        error: number;
    }>;
    getReports(): Promise<{
        error: number;
        reports: any;
    }>;
    checkAdmin(admin: any): Promise<void>;
}
