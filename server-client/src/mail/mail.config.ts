import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const getMailConfig = async (config: ConfigService) => {
  return {
    transport: {
      host: config.get<string>('MAIL_HOST'),
      secure: true,
      port: config.get<number>('MAIL_PORT'),
      auth: {
        user: config.get<string>('MAIL_USER'),
        pass: config.get<string>('MAIL_PASSWORD'),
      },
    },
    defaults: {
      from: `"No Reply" <${config.get('MAIL_FROM')}>`,
    },
    template: {
      dir: join(__dirname, 'templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  };
};
