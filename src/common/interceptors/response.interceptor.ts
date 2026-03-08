import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((result) => {
        const statusCode = response.statusCode ?? HttpStatus.OK;

        // Handler trả về { data, message } shape
        if (result && typeof result === 'object' && 'data' in result) {
          const { data, message, ...rest } = result as {
            data: unknown;
            message?: string;
            [key: string]: unknown;
          };
          return {
            success: true,
            statusCode,
            message: message ?? 'Success',
            data,
            ...rest,
            timestamp: new Date().toISOString(),
          };
        }

        // Handler trả về raw value
        return {
          success: true,
          statusCode,
          message: 'Success',
          data: result as unknown,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
