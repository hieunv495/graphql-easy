# Solutions

## Conflict types when yarn link

https://github.com/Microsoft/typescript/issues/6496#issuecomment-384786222

Add this line to tsconfig.json of consumed package

tsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      // "*": ["node_modules/@types/*", "*"],
      "graphql-compose": ["node_modules/graphql-compose"],
      "graphql-compose/*": ["node_modules/graphql-compose/*"],
      "graphql-compose-mongoose": ["node_modules/graphql-compose-mongoose"],
      "graphql-compose-mongoose/*": ["node_modules/graphql-compose-mongoose/*"]
    }
  }
}
```
