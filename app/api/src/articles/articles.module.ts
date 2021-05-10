import { Module } from "@nestjs/common";
import { AuthorResolver } from "./articles.resolver";
import { ArticlesService } from "./articles.service";

@Module({
  providers:[
    ArticlesService, 
    AuthorResolver
  ],

})
export class ArticlesModule{}