import {HttpException, InternalServerErrorException} from "@nestjs/common";

export function generateErrorResponse(
    err: any,
    {
        message =  'Internal Error',
        description = 'server/internal-error',
        cause = 'Internal Error',
    }: { message?: string ; description?: string; cause?: string } = undefined,
) {
    if (err instanceof HttpException) {
        let description;

        if (typeof err.getResponse() === 'string') {
            description = err.getResponse();
        } else {
            const response = err.getResponse() as { error?: string };
            description = response?.error;
        }
        throw new HttpException(err.message, err.getStatus(), {
            description,
            cause: err.cause,
        });
    }
    throw new InternalServerErrorException(message, {
        description,
        cause,
    });
}