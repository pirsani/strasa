export interface CustomPrismaClientError extends Error {
  code: string;
  meta?: Record<string, unknown>;
  clientVersion: string;
  batchRequestIdx?: number;
  get [Symbol.toStringTag](): string;
}
