import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecret', // Use environment variable for secret
    });
  }

  async validate(payload: any) {
    // In a real application, you might fetch the user from the database
    // using the payload.sub (user ID) to ensure the user still exists
    // and is active.
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      // This should ideally not happen if token is valid and user exists
      return null;
    }
    return { userId: payload.sub, email: payload.email, firstName: payload.firstName, lastName: payload.lastName };
  }
}