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
