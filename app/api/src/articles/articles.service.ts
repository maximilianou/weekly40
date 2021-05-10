import { Injectable } from "@nestjs/common";
import { Article } from "src/generated/types";

@Injectable()
export class ArticlesService{
  private articles: Article[] = [
    { id:'1', 
      title:'The local kube', 
      content:'Working with kubernetes and nest locally.' 
    }
  ];

  public findOneById(id: string){
    //console.debug(`ArticlesService::findOneById(${id}) ${typeof id} ${typeof this.articles[0].id}`);
    //console.debug(`ArticlesService::findOneById(${id}):: ${this.articles.find( art => art.id === id )}`);
    return this.articles.find( article => article.id === id );
  }
}