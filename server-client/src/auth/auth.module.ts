import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {
  AtStrategy,
  GoogleStrategy,
  RtStrategy,
  TwitterStrategy,
} from './strategy';
import { JwtModule } from '@nestjs/jwt';
import { ACCESS_TOKEN_SECRET } from '../constants';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: ACCESS_TOKEN_SECRET,
      global: true,
      signOptions: { expiresIn: '30m' },
    }),
  ],
  providers: [
    AuthService,
    RtStrategy,
    AtStrategy,
    GoogleStrategy,
    TwitterStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
