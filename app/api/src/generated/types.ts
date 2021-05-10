
/*
 * ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class CreateArticleInput {
    name?: string;
    content?: string;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract articles(): Article[] | Promise<Article[]>;

    abstract article(id: string): Article | Promise<Article>;
}

export abstract class IMutation {
    __typename?: 'IMutation';

    abstract createArticle(createArticleInput?: CreateArticleInput): Article | Promise<Article>;
}

export abstract class ISubscription {
    __typename?: 'ISubscription';

    abstract articleCreated(): Article | Promise<Article>;
}

export class Owner {
    __typename?: 'Owner';
    id: string;
    name: string;
    articles?: Article[];
}

export class Article {
    __typename?: 'Article';
    id: string;
    title?: string;
    content?: string;
    owner?: Owner;
}
