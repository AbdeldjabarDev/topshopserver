import { AccountsService } from "./accounts.service";
declare const LocalStrategy_base: new (...args: any[]) => any;
export declare class LocalStrategy extends LocalStrategy_base {
    private accountService;
    constructor(accountService: AccountsService);
    validate(email: any, pass_hash: any): Promise<{
        email: any;
        id: any;
    }>;
}
export {};
