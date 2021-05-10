# weekly40

## typescript, graphql, nestjs, kubernetes, skaffold dev


### Starting project
---
- nestjs
```
:~/projects/weekly40/app$ nest --help
Usage: nest <command> [options]

Options:
  -v, --version                                   Output the current version.
  -h, --help                                      Output usage information.

Commands:
  new|n [options] [name]                          Generate Nest application.
  build [options] [app]                           Build Nest application.
  start [options] [app]                           Run Nest application.
  info|i                                          Display Nest project details.
  update|u [options]                              Update Nest dependencies.
  add [options] <library>                         Adds support for an external library to your project.
  generate|g [options] <schematic> [name] [path]  Generate a Nest element.
    Available schematics:
      ┌───────────────┬─────────────┬──────────────────────────────────────────────┐
      │ name          │ alias       │ description                                  │
      │ application   │ application │ Generate a new application workspace         │
      │ class         │ cl          │ Generate a new class                         │
      │ configuration │ config      │ Generate a CLI configuration file            │
      │ controller    │ co          │ Generate a controller declaration            │
      │ decorator     │ d           │ Generate a custom decorator                  │
      │ filter        │ f           │ Generate a filter declaration                │
      │ gateway       │ ga          │ Generate a gateway declaration               │
      │ guard         │ gu          │ Generate a guard declaration                 │
      │ interceptor   │ in          │ Generate an interceptor declaration          │
      │ interface     │ interface   │ Generate an interface                        │
      │ middleware    │ mi          │ Generate a middleware declaration            │
      │ module        │ mo          │ Generate a module declaration                │
      │ pipe          │ pi          │ Generate a pipe declaration                  │
      │ provider      │ pr          │ Generate a provider declaration              │
      │ resolver      │ r           │ Generate a GraphQL resolver declaration      │
      │ service       │ s           │ Generate a service declaration               │
      │ library       │ lib         │ Generate a new library within a monorepo     │
      │ sub-app       │ app         │ Generate a new application within a monorepo │
      │ resource      │ res         │ Generate a new CRUD resource                 │
      └───────────────┴─────────────┴──────────────────────────────────────────────┘
```

### Initialize Project
---
- Create nest API
```
:~/projects/weekly40/app$ nest new api
```


### GraphQL Schema First Approach ( nestjs )

https://docs.nestjs.com/graphql/quick-start
---
- app/api/src/scripts/generate.ts ( taken from the refenence )
```ts
import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: `${__dirname}/../generated/types.ts`,
  outputAs: 'interface',
  emitTypenameField: true,
});
```

#### Write down some GraphQL schema in **.graphql files
---
- app/api/graphql.d/articles.graphql ( changed from one sample )
```gql
type Query {
  articles: [Article]
  article(id: ID!): Article
}

type Mutation {
  createArticle(createArticleInput: CreateArticleInput): Article
}

type Subscription {
  articleCreated: Article
}

type Owner {
  id: Int!
  name: String!
  articles: [Article!]
}

type Article {
  id: Int
  title: String
  content: String
  owner: Owner
}

input CreateArticleInput {
  name: String
  content: String
}
```
#### Execute command to generate types, ( make generate_types )
---
- Generate Schema First :: GraphQL SDL :: **.graphql -> generated/types.ts
```
:~/projects/weekly40/app/api$ ./node_modules/.bin/ts-node src/scripts/generate.ts 
[9:12:21 AM] The definitions have been updated.
```
or in the Makefile
```
generate_types:
	cd app/api && ./node_modules/.bin/ts-node src/scripts/generate.ts
```


#### this was generated from the last command
---
- app/api/src/generated/types.ts
```ts

/*
 * ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export interface CreateArticleInput {
    name?: string;
    content?: string;
}

export interface IQuery {
    __typename?: 'IQuery';
    articles(): Article[] | Promise<Article[]>;
    article(id: string): Article | Promise<Article>;
}

export interface IMutation {
    __typename?: 'IMutation';
    createArticle(createArticleInput?: CreateArticleInput): Article | Promise<Article>;
}

export interface ISubscription {
    __typename?: 'ISubscription';
    articleCreated(): Article | Promise<Article>;
}

export interface Owner {
    __typename?: 'Owner';
    id: number;
    name: string;
    articles?: Article[];
}

export interface Article {
    __typename?: 'Article';
    id?: number;
    title?: string;
    content?: string;
    owner?: Owner;
}
```

-----
-----
#### Generate from GraphQL Schema First, over resolver, data in memory in service, response adn playground http://localhost:4000/graphql
---
- Makefile
```
.PHONY: step01
step01:
	npm i -g @nestjs/cli

app:
	mkdir app		
step02: app
	cd app && nest new api
step03:
	cd app/api && npm install @nestjs/graphql graphql-tools graphql apollo-server-express class-validator uuid

generate_types:
	cd app/api && ./node_modules/.bin/ts-node src/scripts/generate.ts
	
step04:
	curl -X POST http://localhost:4000/graphql -H "Content-Type: application/json" -d '{ "query":"query { article(  id: 1 ){ id, title, content } }"}'
```

---
- app/api/src/scripts/generate.ts ( make generate_types )
```ts
import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: `${__dirname}/../generated/types.ts`,
  outputAs: 'class',
  emitTypenameField: true,
});
```

---
- app/api/src/graphql.d/articles.graphql
```gql
type Query {
  articles: [Article]
  article(id: ID!): Article
}
type Mutation {
  createArticle(createArticleInput: CreateArticleInput): Article
}
type Subscription {
  articleCreated: Article
}
type Owner {
  id: ID!
  name: String!
  articles: [Article!]
}
type Article {
  id: ID!
  title: String
  content: String
  owner: Owner
}
input CreateArticleInput {
  name: String
  content: String
}
```

---
- app/src/main.ts
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(4000);
}
bootstrap();
```
---
- app/api/src/app.module.ts
```ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ArticlesModule } from './articles/articles.module';
@Module({
  imports: [
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql']
    }),
    ArticlesModule],
  providers: [],
})
export class AppModule {}
```

---
- app/api/src/articles/articles.module.ts
```ts
import { Module } from "@nestjs/common";
import { AuthorResolver } from "./articles.resolver";
import { ArticlesService } from "./articles.service";
@Module({
  providers:[
    ArticlesService, 
    AuthorResolver
  ]
})
export class ArticlesModule{}
```

---
- app/api/src/articles/articles.resolver.ts
```ts
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
```

---
- app/api/src/articles/articles.service.ts
```ts
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
```

---
- response over command line
```
:~/projects/weekly40$ make step04
curl -X POST http://localhost:4000/graphql -H "Content-Type: application/json" -d '{ "query":"query { article(  id: 1 ){ id, title, content } }"}'
{"data":{"article":{"id":"1","title":"The local kube","content":"Working with kubernetes and nest locally."}}}
```

-----
-----

