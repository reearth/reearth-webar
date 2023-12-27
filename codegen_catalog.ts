import { CodegenConfig } from "@graphql-codegen/cli";

const rootGQLDirectory = "src/graphql/base/catalog/";

const rootGenerateDirectory = `${rootGQLDirectory}__gen__/`;

const config: CodegenConfig = {
  overwrite: true,
  schema: "./schema.graphql",
  documents: [
    `${rootGQLDirectory}fragments/*.ts`,
    `${rootGQLDirectory}queries/*.ts`,
  ],
  generates: {
    [rootGenerateDirectory]: {
      preset: "client",
      presetConfig: {
        gqlTagName: "gql",
        fragmentMasking: false,
      },
      config: {
        useTypeImports: true,
        scalar: {
          DateTime: "Date",
        },
      },
    },
    [`${rootGenerateDirectory}fragmentMatcher.json`]: {
      plugins: ["fragment-matcher"],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
