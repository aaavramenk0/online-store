import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Strategy, Profile } from 'passport-twitter';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor() {
    super({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: `${process.env.URL}/api/v1/auth/twitter/callback`,
      includeEmail: true,
    });
  }

  async validate(token: any, tokenSecret: any, profile: Profile, cb: any) {
    const { emails, photos, id, name } = profile;

    //Формуємо дані про нашого користувача, які попадуть в req.user, після чого ми його додамо в базу даних(дивись auth.controller.ts: google/callback)
    const user: Partial<User> = {
      twitterId: id,
      username: `${name.givenName} ${name.familyName}`,
      email: emails[0].value,
      avatar: {
        url: photos[0].value,
        key: undefined,
      },
    };

    return cb(null, user);
  }
}
