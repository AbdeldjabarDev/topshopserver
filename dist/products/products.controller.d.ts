import { ProductsService } from './products.service';
import { Response, Request } from 'express';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    returnProducts(req: Request, res: any): Promise<void>;
    returnAllImages(res: any): Promise<void>;
    getAllIds(): any[];
    getImage(res: Response, req: Request, id: any): Promise<void>;
    remove(): Promise<string>;
}
