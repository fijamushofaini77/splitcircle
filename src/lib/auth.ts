import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = 'sc_token';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export async function signToken(user: SessionUser): Promise<string> {
  return await new SignJWT({ id: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
