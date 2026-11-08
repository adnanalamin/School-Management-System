import mongoose, { type ClientSession } from 'mongoose';

/**
 * Runs `work` inside a MongoDB transaction and retries transient failures (the driver handles that).
 * Pass `session` to every query/save inside: `Model.find(...).session(session)`, `doc.save({ session })`.
 *
 * Use for invariants that span documents:
 *   - recording a payment: insert Payment + update Fee.paidAmount/status
 *   - issuing a book: insert BookIssue + decrement Book.availableCopies
 *   - bulk fee generation, promotion of a whole section
 *
 * Transactions require a replica set (MongoDB Atlas always is; docker-compose.yml configures one locally).
 */
export async function withTransaction<T>(work: (session: ClientSession) => Promise<T>): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result: T | undefined;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result as T;
  } finally {
    await session.endSession();
  }
}
