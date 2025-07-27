import { User } from '../users/user.entity.js';

declare global {
  namespace Express {
    export interface Request {
      user?: User;
    }
  }
} 