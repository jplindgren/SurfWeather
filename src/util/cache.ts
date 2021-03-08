import NodeCache from 'node-cache';

class CacheUtil {
  private myCache: NodeCache;
  constructor() {
    this.myCache = new NodeCache({
      deleteOnExpire: true,
      checkperiod: 3600,
    });
  }

  public set<T>(key: string, data: T): boolean {
    return this.myCache.set(key, data);
  }

  public get<T>(key: string): T | undefined {
    return this.myCache.get<T>(key);
  }

  public hasKey(key: string): boolean {
    return this.myCache.has(key);
  }

  public clearAllCache(): void {
    return this.myCache.flushAll();
  }
}

export default new CacheUtil();
