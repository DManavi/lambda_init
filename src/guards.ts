import { ApplicationError } from 'error-lib';

import { AppLoader } from './app-loader';

export function withAppLoader(
  appLoader: AppLoader,
  fn: (...args: Array<unknown>) => unknown
): typeof fn {
  return (...args: Array<unknown>): ReturnType<typeof fn> => {
    // throw an error if the application is in failed state
    if (appLoader.bootstrapStatus.state === 'failed') {
      throw appLoader.bootstrapStatus.error;
    }

    // throw an error if the application is still being initialized
    if (appLoader.bootstrapStatus.state === 'pending') {
      throw new ApplicationError('Application is being initialized');
    }

    // call the original handler function
    return fn(...args);
  };
}
