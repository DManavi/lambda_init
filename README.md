<div align="center">

# lambda-init

**Initialize an AWS Lambda application once, then safely reuse it across invocations.**

[![License: MIT](https://img.shields.io/github/license/DManavi/lambda_init?style=flat-square)](https://github.com/DManavi/lambda_init/blob/main/LICENSE.md)
[![npm monthly downloads](https://img.shields.io/npm/dm/lambda-init?style=flat-square)](https://www.npmjs.com/package/lambda-init)
[![GitHub stars](https://img.shields.io/github/stars/DManavi/lambda_init?style=flat-square)](https://github.com/DManavi/lambda_init)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Installation](#installation) · [Quick start](#quick-start) · [API](#api) · [Development](#development)

</div>

`lambda-init` manages asynchronous startup work—such as opening a database
connection, loading configuration, or creating a service container—outside your
Lambda handler. It exposes the current initialization state and prevents the
handler from running before the application is ready.

## Why lambda-init?

A module-level promise is a useful start, but every handler still needs to
decide what to do while initialization is pending or after it fails.
`lambda-init` keeps that lifecycle in one place:

- Starts initialization as soon as the module is loaded.
- Supports synchronous and asynchronous bootstrap functions.
- Exposes strongly typed application state after initialization.
- Blocks guarded handlers while initialization is pending.
- Re-throws the original bootstrap error after initialization fails.
- Reuses the initialized application for warm Lambda invocations.

## Installation

```bash
npm install lambda-init debug error-lib
```

`debug` and `error-lib` are peer dependencies.

## Quick start

```typescript
import type { Handler } from 'aws-lambda';
import { AppLoader, withAppLoader } from 'lambda-init';

type App = {
  database: {
    query: (statement: string) => Promise<unknown>;
  };
};

const appLoader = new AppLoader<App>(async () => {
  const database = await connectToDatabase();

  return { database };
});

export const handler: Handler = withAppLoader(
  appLoader,
  async (event) => {
    const result = await appLoader.app.database.query('SELECT 1');

    return {
      statusCode: 200,
      body: JSON.stringify({ event, result }),
    };
  }
);
```

The loader starts immediately at module scope. A guarded invocation behaves
according to the loader state:

| State | Behavior |
| --- | --- |
| `pending` | Throws an `ApplicationError` and does not call the handler |
| `ready` | Calls the handler; the initialized value is available through `appLoader.app` |
| `failed` | Re-throws the bootstrap error and does not call the handler |

Configure your Lambda error handling or integration response for the `pending`
case when startup can overlap with an invocation.

## Custom logging

By default, `AppLoader` logs through the [`debug`](https://github.com/debug-js/debug)
package. Pass a compatible logger to integrate with your application's logging
stack:

```typescript
const appLoader = new AppLoader(createApp, {
  logger: {
    debug: console.debug,
    error: console.error,
  },
});
```

## API

### `new AppLoader<TApp>(bootstrapFn, options?)`

Starts `bootstrapFn` immediately and stores its returned application value.

| Member | Description |
| --- | --- |
| `app` | The initialized `TApp`. Throws if the loader is not ready. |
| `bootstrapStatus` | A discriminated union with a `pending`, `ready`, or `failed` state. |
| `options.logger` | Optional logger exposing `debug` and `error` methods. |

### `withAppLoader(appLoader, handler)`

Returns a handler with the same arguments and return value. The wrapped handler
runs only when `appLoader.bootstrapStatus.state` is `ready`.

## Development

Requirements: Node.js 18 or later and npm.

```bash
# Install dependencies
npm install

# Run the test suite
npx nx test lambda-init

# Lint the source
npx nx lint lambda-init

# Build CommonJS, ESM, and type declarations
npx nx build lambda-init
```

Contributions are welcome. Please
[open an issue](https://github.com/DManavi/lambda_init/issues) before proposing a
large change, and include tests for behavior changes.

## License

Distributed under the [MIT License](LICENSE.md).
