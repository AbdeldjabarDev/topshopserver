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
    getProducts(query: String): Promise<import("mongodb").WithId<import("bson").Document>[] | {
        result: any;
        error: string;
    }>;
    getImage(id: any): Promise<{
        result: any;
        error: string;
        image?: undefined;
    } | {
        image: import("mongodb").WithId<import("bson").Document>;
        error: number;
        result?: undefined;
    }>;
    getAllImages(): Promise<import("mongodb").WithId<import("bson").Document>>;
    removeCollections(): Promise<void>;
}
