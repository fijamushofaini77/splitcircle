import { cookies } from 'next/headers';
import { verifyToken, AUTH_COOKIE_NAME, type SessionUser } from './auth';

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

/** Dipakai di dalam API route: return session atau lempar response 401 */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    return { session: null, unauthorized: true as const };
  }
  return { session, unauthorized: false as const };
}
