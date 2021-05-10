import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./src/**/*.graphql'],
  path: `${__dirname}/../generated/types.ts`,
  outputAs: 'class',
  emitTypenameField: true,
});
