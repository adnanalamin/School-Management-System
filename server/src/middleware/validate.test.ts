import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { errorHandler } from './errorHandler';
import { validate } from './validate';

const app = express();
app.use(express.json());
app.post(
  '/people',
  validate({ body: z.object({ name: z.string().trim().min(2), age: z.coerce.number().int().min(0) }) }),
  (req, res) => {
    res.status(201).json(req.body);
  },
);
app.use(errorHandler);

describe('validate middleware', () => {
  it('passes parsed and coerced values to the handler', async () => {
    const response = await request(app).post('/people').send({ name: '  Ada ', age: '12', extra: true });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ name: 'Ada', age: 12 });
  });

  it('responds 422 with field-level details for invalid input', async () => {
    const response = await request(app).post('/people').send({ name: 'A' });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    const paths = (response.body.error.details as Array<{ path: string }>).map((detail) => detail.path);
    expect(paths).toEqual(expect.arrayContaining(['name', 'age']));
  });
});
