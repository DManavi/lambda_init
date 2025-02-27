# lambda-init

Initialize your lambda function (or similar serverless apps) before processing user requests without headache.

## Purpose

Have you ever wanted to initialize your app in a serverless environment like AWS lambda that needs some sort of initialization like connecting to the database or similar tasks which needs async code execution?

You may be familiar with the pattern below.

```typescript
// my-awesome-lambda-function.ts

const initialize = (async () => {})();

const handler = async (event, context) => {
  // only resolves the promise once
  const app = await initialize;

  // the rest of your handler
};
```

But wait! What if:

- How do you want to tell the user to wait if app initialization takes 5 seconds? (or more)
- App initialization fails?

## Usage

`lambda-init` supports both sync and async app initialization. However, the main use case is when your needs async initialization.


```typescript

// my-awesome-lambda-function.ts
import { AppLoader, withAppLoader } from 'lambda-init';


const appLoader = new AppLoader(
  async () => {
    // initialize your app here
  }
);

const handler = withAppLoader(
  appLoader,

  // Lambda handler
  async (event, context) => {
  
  const app = appLoader.app;

  // the rest of your handler
});
```

## Development

TBD.

## References

[Compile Typescript Packages to Multiple format](https://nx.dev/recipes/tips-n-tricks/compile-multiple-formats)
