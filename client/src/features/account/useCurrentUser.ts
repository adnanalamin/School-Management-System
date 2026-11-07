import { sampleUser, type CurrentUser } from '@/mocks/user';

/** Returns the signed-in user. Backed by sample data until authentication is implemented. */
export function useCurrentUser(): CurrentUser {
  return sampleUser;
}
