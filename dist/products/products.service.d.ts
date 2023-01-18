import { Db } from "mongodb";
export declare class ProductsService {
    db: Db;
    products: any[];
    ids: any[];
    constructor();
    bootstrap(): Promise<void>;
    insertProducts(): Promise<void>;
    getIds(): any[];
    dispatchOrder(items: any, t: any): Promise<{
        orderId: any;
        error: string;
    }>;
    getAllProducts(): Promise<"no products found" | {
        result: any;
        error: any;
    }>;
    getProducts(query: String): Promise<any[]>;
    getImage(id: any): Promise<import("mongodb").WithId<import("bson").Document>>;
    getAllImages(): Promise<import("mongodb").WithId<import("bson").Document>>;
    removeCollections(): Promise<void>;
}
