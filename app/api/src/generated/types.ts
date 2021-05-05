
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
