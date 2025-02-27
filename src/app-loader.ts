import { normalizeErrorObject } from 'error-lib';

import debug from './debug';

export type AppState = 'pending' | 'ready' | 'failed';

type BootstrapPending = {
  state: 'pending';
};

type BootstrapFailed = {
  state: 'failed';
  error: Error;
};

type BootstrapReady<TApp = unknown> = {
  state: 'ready';
  app: TApp;
};

type BootstrapStatus<TApp = unknown> =
  | BootstrapPending
  | BootstrapFailed
  | BootstrapReady<TApp>;

export type AppLoaderOpts = {
  /**
   * Logger instance to use for logging messages
   */
  logger?: {
    debug: (...args: Array<any>) => void;
    error: (...args: Array<any>) => void;
  };
};

export class AppLoader<TApp = unknown> {
  /* Internal state */
  protected _opts: AppLoaderOpts;

  protected _bootstrap: BootstrapStatus<TApp> = { state: 'pending' };

  /* Public properties */

  get bootstrapStatus(): BootstrapStatus<TApp> {
    return this._bootstrap;
  }

  get app(): TApp {
    if (this._bootstrap.state !== 'ready') {
      throw new Error('Application is not ready');
    }

    return this._bootstrap.app;
  }

  constructor(bootstrapFn: () => Promise<TApp> | TApp, opts?: AppLoaderOpts) {
    const dbg = debug.extend('app-loader');

    this._opts = opts ?? {
      logger: {
        debug: dbg,
        error: dbg,
      },
    };

    // self-invoking async function (to avoid top-level await)
    (async () => await bootstrapFn())()
      .then(this.successCallback.bind(this))
      .catch(this.failCallback.bind(this));
  }

  /* Internal methods */

  protected successCallback(app: TApp): void {
    this._bootstrap = { state: 'ready', app };
    this._opts.logger?.debug('Application initialized successfully');
  }

  protected failCallback(error: Error): void {
    this._bootstrap = { state: 'failed', error };
    this._opts.logger?.error(
      'Failed to initialize application',
      normalizeErrorObject(error)
    );
  }
}
