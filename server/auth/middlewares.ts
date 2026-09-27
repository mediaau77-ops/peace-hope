import { Request, Response, NextFunction } from 'express';
import { getAuthUser, requireUser, AuthenticatedUser } from './requireUser';
import { requireAdmin } from './requireRole';

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * publicRoute: No auth required.
 * Attaches user to req.user if a valid session exists, but never throws 401.
 * Ensures anonymous visitors can browse freely without auth errors.
 */
export function publicRoute() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = await getAuthUser(req);
      if (user) {
        (req as AuthenticatedRequest).user = user;
      }
      return next();
    } catch {
      // Never block public routes on token validation errors
      return next();
    }
  };
}

/**
 * authRoute: Requires an authenticated user session.
 * Throws 401 if unauthenticated.
 */
export function authRoute() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = await requireUser(req);
      (req as AuthenticatedRequest).user = user;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

/**
 * adminRoute: Requires an authenticated session with an admin role.
 * Throws 401 if unauthenticated, 403 if role is insufficient.
 */
export function adminRoute() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = await requireAdmin(req);
      (req as AuthenticatedRequest).user = user;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
