import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {Strategy} from 'passport-local'
import { AccountsService } from "./accounts.service";
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy)
{
    constructor(private accountService: AccountsService) {
        super();
      }
    async validate(email,pass_hash)
    {
        let result = await this.accountService.checkAccount(email,pass_hash);
        if(result.status.code != 0)
        {
            throw new UnauthorizedException();
        }
        return result.user;
    }

}