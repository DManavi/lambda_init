import { AppLoader } from './app-loader';
import { withAppLoader } from './guards';

describe('guard', () => {
  it('should throw error if app is not ready yet', (): Promise<void> => {
    return new Promise((resolve) => {
      const appLoader = new AppLoader(
        (): Promise<void> =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 250);
          })
      );

      expect(appLoader.bootstrapStatus.state).toBe('pending');

      const handler = () => 1;
      const guardedHandler = withAppLoader(appLoader, handler);

      setTimeout(() => {
        expect(appLoader.bootstrapStatus.state).toBe('ready');
        expect(guardedHandler()).toBe(1);

        resolve();
      }, 250);
    });
  });

  it('should throw error if app has failed to load', (): Promise<void> => {
    return new Promise((resolve) => {
      const appLoader = new AppLoader(
        (): Promise<void> =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('Failed to bootstrap'));
            }, 250);
          })
      );
      expect(appLoader.bootstrapStatus.state).toBe('pending');

      const handler = () => {
        throw new Error('Should not be called');
      };

      const guardedHandler = withAppLoader(appLoader, handler);

      setTimeout(() => {
        expect(appLoader.bootstrapStatus.state).toBe('failed');
        expect(() => guardedHandler()).toThrowError('Failed to bootstrap');

        resolve();
      }, 250);
    });
  });

  it('should call the original function if app is ready', (): Promise<void> => {
    return new Promise((resolve) => {
      const appLoader = new AppLoader(
        (): Promise<void> =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 250);
          })
      );
      expect(appLoader.bootstrapStatus.state).toBe('pending');

      const handler = (x: number) => x + 1;

      const guardedHandler = withAppLoader(appLoader, handler);

      setTimeout(() => {
        expect(appLoader.bootstrapStatus.state).toBe('ready');
        expect(guardedHandler(1)).toBe(2);

        resolve();
      }, 250);
    });
  });
});
