import { Args, Query, Resolver } from "@nestjs/graphql";
import { Article } from "src/generated/types";
import { ArticlesService } from "./articles.service";

@Resolver( () => Article )
export class AuthorResolver {

  constructor(
    private readonly articlesService: ArticlesService
  ){}

  @Query(() => Article, { name: 'article', nullable: true})
  getArticle(@Args('id') id: string ){
    //console.debug(`AuthorResolver::getArticle(${id}) id:${typeof id}`);
    return this.articlesService.findOneById(id);
  }
}
