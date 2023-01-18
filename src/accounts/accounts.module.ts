import { Module } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { LocalStrategy } from "./account.local-strategy";
import {PassportModule} from '@nestjs/passport'
@Module({
    imports:[PassportModule],
    providers:[AccountsService,LocalStrategy]

})
export class AccountModule {};