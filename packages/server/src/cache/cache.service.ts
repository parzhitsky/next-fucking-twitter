import { ServerError } from "@/app/app-error/app-error.js"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable } from "@nestjs/common"
import { Cache } from "cache-manager"

type Landscape = {
  readonly [storeId: PropertyKey]: {
    readonly [objectId: PropertyKey]: {
      readonly [key: PropertyKey]: unknown
    }
  }
}

export type StoreIdBy<
  L extends Landscape,
> =
  keyof L

export type ObjectIdBy<
  L extends Landscape,
  S extends StoreIdBy<L>,
> =
  keyof L[S]

export type KeyBy<
  L extends Landscape,
  S extends StoreIdBy<L>,
  O extends ObjectIdBy<L, S>,
> =
  keyof L[S][O]

export type ValueBy<
  L extends Landscape,
  S extends StoreIdBy<L>,
  O extends ObjectIdBy<L, S>,
  K extends KeyBy<L, S, O>,
> =
  L[S][O][K]

type ComposePathArgs =
  | [PropertyKey, PropertyKey, PropertyKey]
  | [PropertyKey, PropertyKey]
  | [PropertyKey]

interface SetParams {
  readonly ttl?: number
}

interface SetResult<Value> {
  readonly oldValue: Value | undefined
  readonly newValue: Value
}

@Injectable()
export class CacheService<L extends Landscape = Landscape> {
  protected readonly pathSeparator = '/'

  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
  ) { }

  // must be an arrow function expression
  protected assertValidPathPart = (part: string): string => {
    if (part.includes(this.pathSeparator)) {
      throw new InvalidPathPathError(part)
        .addDetail({
          message: `Path separator is "${this.pathSeparator}"`,
          payload: this.pathSeparator,
        })
    }

    return part
  }

  protected composePath(...args: ComposePathArgs): string {
    return args.map(String).map(this.assertValidPathPart).join('/')
  }

  async get<
    S extends StoreIdBy<L>,
    O extends ObjectIdBy<L, S>,
    K extends KeyBy<L, S, O>,
  >(
    storeId: S,
    objectId: O,
    key: K,
  ): Promise<ValueBy<L, S, O, K> | undefined> {
    const path = this.composePath(storeId, objectId, key)
    const value = await this.cacheManager.get<ValueBy<L, S, O, K>>(path)

    return value
  }

  async set<
    S extends StoreIdBy<L>,
    O extends ObjectIdBy<L, S>,
    K extends KeyBy<L, S, O>,
    Value extends ValueBy<L, S, O, K>,
  >(
    storeId: S,
    objectId: O,
    key: K,
    value: Value,
    { ttl }: SetParams = {},
  ): Promise<SetResult<Value>> {
    const path = this.composePath(storeId, objectId, key)

    // FIXME: use GETSET (unsupported by 'keyv') to get old value in one go
    const oldValue = await this.cacheManager.get<Value>(path)

    await this.cacheManager.set(path, value, ttl)

    return {
      oldValue,
      newValue: value,
    }
  }

  async del<
    S extends StoreIdBy<L>,
    O extends ObjectIdBy<L, S>,
    K extends KeyBy<L, S, O>,
  >(
    storeId: S,
    objectId: O,
    key: K,
  ): Promise<boolean>

  async del<
    S extends StoreIdBy<L>,
    O extends ObjectIdBy<L, S>,
  >(
    storeId: S,
    objectId: O,
  ): Promise<boolean>

  async del<
    S extends StoreIdBy<L>,
  >(
    storeId: S,
  ): Promise<boolean>

  async del(...args: ComposePathArgs): Promise<boolean> {
    const path = this.composePath(...args)

    return this.cacheManager.del(path)
  }
}

export class InvalidPathPathError extends ServerError {
  public override readonly statusCode = '500'

  constructor(public readonly pathPart: PropertyKey) {
    super('Cache path part, when converted to a string, cannot include a path separator')

    this.addDetail({
      message: `Path part (as string): ${String(pathPart)}`,
      payload: pathPart,
    })
  }
}
