import type { RequestHandler } from 'express';

function parseBearerToken(headerValue: string | undefined): string | undefined {
  if (!headerValue) return undefined;

  const [scheme, token] = headerValue.split(' ');
  if (scheme !== 'Bearer' || !token) return undefined;

  return token.trim();
}

export const requireCardholderAuth: RequestHandler = (
  request,
  response,
  next,
) => {
  // Dev-only escape hatch: allow local work without wiring a login flow.
  if (process.env.DEFAULT_CARDHOLDER_ID) {
    return next();
  }

  const token = parseBearerToken(request.header('authorization'));
  if (!token) {
    return response.status(401).json({ message: 'Unauthorized' });
  }

  // Accept local UUIDs or Stripe Issuing cardholder ids (ich_...).
  request.cardholderId = token;
  return next();
};
