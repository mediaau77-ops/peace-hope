export type ApiResult<T> =
  | { ok: true; data: T; meta?: Record<string, unknown> }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown,
    public status = 400,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};
