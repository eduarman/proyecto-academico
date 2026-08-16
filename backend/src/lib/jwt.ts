import { SignJWT, jwtVerify } from 'jose';
import type { RequestUser } from '../env';

const ALG = 'HS256';

function getSecret(jwtSecret: string) {
  return new TextEncoder().encode(jwtSecret);
}

export async function signAccessToken(jwtSecret: string, user: RequestUser): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: ALG })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret(jwtSecret));
}

export async function verifyAccessToken(jwtSecret: string, token: string): Promise<RequestUser> {
  const { payload } = await jwtVerify(token, getSecret(jwtSecret));
  return {
    id: payload.sub as string,
    email: payload.email as string,
    role: payload.role as RequestUser['role'],
  };
}
