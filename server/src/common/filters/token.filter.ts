import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { TOKENS } from 'src/constants';

const BACKEND_URL = process.env.URL;

@Catch(HttpException)
export class TokenExceptionFilter implements ExceptionFilter {
  constructor(private authService: AuthService) { }
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR

    //TODO: Прибрати дуру умову
    if (request.baseUrl.includes(process.env.ADMIN_PANEL_URL) || request.url.includes('admin')) return res.status(status).send(exception)

    if (status === 401) {
      try {
        const rt = request?.cookies?.[TOKENS.REFRESH_TOKEN];

        if (!rt) return res.status(401).send({
          message: "Unauthorized",
          cause: "Refresh token is not provided",
          status: 401
        })

        const tokens = await this.authService.refreshToken(rt);

        const { data } = await axios(`${BACKEND_URL}${request.url}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
          method: request.method,
          data: request.body,
        });



        return res
          .cookie(TOKENS.REFRESH_TOKEN, tokens.refresh_token, {
            httpOnly: true,
            maxAge: 604800 * 1000,
          })
          .cookie(TOKENS.ACCESS_TOKEN, tokens.access_token, {
            httpOnly: false,
            maxAge: 1000 * 60 * 30,
          })
          .send(data);
      } catch (err) {
        if (err instanceof AxiosError) {

          return res.status(err.response?.status ?? 500).send(err.response?.data)
        }
        return res.status(status).send(err);
      }
    }
    return res
      .status(status)
      .send(exception);
  }
}
