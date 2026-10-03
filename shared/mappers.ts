type CamelCaseKey<S extends string> = S extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<CamelCaseKey<Tail>>}`
  : S;

type SnakeCaseKey<S extends string> = S extends `${infer Head}${infer Tail}`
  ? Tail extends Uncapitalize<Tail>
    ? Head extends Lowercase<Head>
      ? `${Head}${SnakeCaseKey<Tail>}`
      : `${Lowercase<Head>}${SnakeCaseKey<Tail>}`
    : `${Head}_${SnakeCaseKey<Tail>}`
  : S;

type CamelCaseObject<T> = {
  [K in keyof T as K extends string ? CamelCaseKey<K> : K]: T[K] extends Array<infer U>
    ? Array<U extends Record<string, unknown> ? CamelCaseObject<U> : U>
    : T[K] extends Record<string, unknown>
      ? CamelCaseObject<T[K]>
      : T[K];
};

type SnakeCaseObject<T> = {
  [K in keyof T as K extends string ? SnakeCaseKey<K> : K]: T[K] extends Array<infer U>
    ? Array<U extends Record<string, unknown> ? SnakeCaseObject<U> : U>
    : T[K] extends Record<string, unknown>
      ? SnakeCaseObject<T[K]>
      : T[K];
};

const toCamelKey = (key: string): string => key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
const toSnakeKey = (key: string): string =>
  key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').toLowerCase();

function mapObjectDeep<T>(value: T, transformKey: (key: string) => string): T {
  if (Array.isArray(value)) {
    return value.map((item) => mapObjectDeep(item, transformKey)) as T;
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      transformKey(key),
      mapObjectDeep(item, transformKey),
    ]);

    return Object.fromEntries(entries) as T;
  }

  return value;
}

export function toCamel<T extends Record<string, unknown>>(row: T): CamelCaseObject<T> {
  return mapObjectDeep(row, toCamelKey) as CamelCaseObject<T>;
}

export function toSnake<T extends Record<string, unknown>>(obj: T): SnakeCaseObject<T> {
  return mapObjectDeep(obj, toSnakeKey) as SnakeCaseObject<T>;
}
