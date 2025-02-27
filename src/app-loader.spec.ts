import { AppLoader } from './app-loader';

describe('app-loader', () => {
  it('should be in pending state', (): Promise<void> => {
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

      setTimeout(() => {
        expect(appLoader.bootstrapStatus.state).toBe('ready');
        resolve();
      }, 250);
    });
  });

  it('should be in failed state', (): Promise<void> => {
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

      setTimeout(() => {
        expect(appLoader.bootstrapStatus.state).toBe('failed');
        expect((appLoader.bootstrapStatus as any).error).toEqual(
          new Error('Failed to bootstrap')
        );

        resolve();
      }, 250);
    });
  });

  it('should be in success state', (): Promise<void> => {
    return new Promise((resolve) => {
      const appLoader = new AppLoader(
        (): Promise<any> =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({ app: 'app' });
            }, 250);
          })
      );

      expect(appLoader.bootstrapStatus.state).toBe('pending');

      setTimeout(() => {
        expect(appLoader.bootstrapStatus.state).toBe('ready');
        expect((appLoader.bootstrapStatus as any).error).toBeUndefined();
        expect((appLoader.bootstrapStatus as any).app).toStrictEqual({
          app: 'app',
        });

        resolve();
      }, 250);
    });
  });
});
