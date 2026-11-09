function loadStorage(platform: string, nativeModule?: object) {
  jest.resetModules();
  jest.doMock('react-native', () => ({
    Platform: {OS: platform},
    NativeModules: {NahtreekRuntimeConfig: nativeModule},
  }));
  return require('../src/services/secureSession').secureSession;
}

describe('secure session bridge', () => {
  afterEach(() => { jest.dontMock('react-native'); });

  it.each(['ios', 'android'])('uses native protected storage on %s', async platform => {
    const bridge = {
      getSecureSession: jest.fn().mockResolvedValue('session'),
      setSecureSession: jest.fn().mockResolvedValue(undefined),
      clearSecureSession: jest.fn().mockResolvedValue(undefined),
    };
    const storage = loadStorage(platform, bridge);
    await storage.write('new-session');
    expect(await storage.read()).toBe('session');
    await storage.clear();
    expect(bridge.setSecureSession).toHaveBeenCalledWith('new-session');
    expect(bridge.clearSecureSession).toHaveBeenCalledTimes(1);
  });

  it('finishes a pending write before clearing on logout', async () => {
    let completeWrite!: () => void;
    const bridge = {
      getSecureSession: jest.fn().mockResolvedValue(null),
      setSecureSession: jest.fn(() => new Promise<void>(resolve => { completeWrite = resolve; })),
      clearSecureSession: jest.fn().mockResolvedValue(undefined),
    };
    const storage = loadStorage('ios', bridge);
    const writing = storage.write('session');
    const clearing = storage.clear();
    await Promise.resolve();
    expect(bridge.clearSecureSession).not.toHaveBeenCalled();
    completeWrite();
    await Promise.all([writing, clearing]);
    expect(bridge.clearSecureSession).toHaveBeenCalledTimes(1);
  });

  it('still permits logout after a failed write', async () => {
    const bridge = {
      getSecureSession: jest.fn().mockResolvedValue(null),
      setSecureSession: jest.fn().mockRejectedValue(new Error('Locked')),
      clearSecureSession: jest.fn().mockResolvedValue(undefined),
    };
    const storage = loadStorage('ios', bridge);
    await expect(storage.write('session')).rejects.toThrow('Locked');
    await storage.clear();
    expect(bridge.clearSecureSession).toHaveBeenCalledTimes(1);
  });

  it('reports a missing native bridge instead of silently discarding credentials', async () => {
    const storage = loadStorage('ios');
    await expect(storage.write('session')).rejects.toThrow('Secure session storage is unavailable');
    await expect(storage.read()).rejects.toThrow('Secure session storage is unavailable');
  });
});
