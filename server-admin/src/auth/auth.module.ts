import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { TOKEN_SECRET } from 'src/constants';
import { TokenStrategy } from './strategy/token.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: TOKEN_SECRET,
      global: true,
      signOptions: { expiresIn: '30m' },
    }),
  ],
  providers: [AuthService, TokenStrategy],
  controllers: [AuthController]
})
export class AuthModule { }
