declare global {
  namespace Express {
    interface Request {
      /** Unique id generated per request; echoed in the X-Request-Id header and error bodies. */
      requestId: string;
    }
  }
}

export {};
