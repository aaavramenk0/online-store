import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { VerifyCallback, Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.URL}/api/v1/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, name, emails, photos } = profile;

    //Формуємо дані про нашого користувача, які попадуть в req.user, після чого ми його додамо в базу даних(дивись auth.controller.ts: google/callback)
    const user: Partial<User> = {
      googleId: id,
      username: `${name.givenName} ${name.familyName}`,
      email: emails[0].value,
      emailVerified: JSON.parse(emails[0].verified),
      avatar: {
        url: photos[0].value,
        key: undefined,
      },
    };
    done(null, user);
  }
}
