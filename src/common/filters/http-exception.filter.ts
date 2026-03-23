import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let code = 'INTERNAL_ERROR';
    let message = 'Đã có lỗi xảy ra, vui lòng thử lại';
    let extra = {};

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const r = exceptionResponse as Record<string, any>;
      code = r.code ?? code;
      message = r.message ?? message;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { code: _c, message: _m, statusCode: _s, error: _e, ...rest } = r;
      extra = rest;
    }

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} → ${status} ${code}`,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      code,
      message,
      ...extra,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
