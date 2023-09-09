import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { REFRESH_TOKEN_SECRET } from '../../constants';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: REFRESH_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.refreshToken;

    return {
      ...payload,
      refreshToken,
    };
  }
}
