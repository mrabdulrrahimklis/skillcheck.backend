import { Catch, HttpStatus } from '@nestjs/common';
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from "@prisma/client/runtime";
import { Request } from 'express';

@Catch(PrismaClientKnownRequestError, PrismaClientUnknownRequestError)
export class QueryExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host) {
    const name = exception.name;
    let message = exception.message;
    const errorCode = exception.code;
    const meta = exception.meta;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request: Request = ctx.getRequest();

    switch (errorCode) {
      case 'P2002':
        message = 'Unique Constraint Error';
        break;

      case 'P2018':
        message = 'Not found!';
        break;
    }

    const msg = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      errorCode,
      meta,
      name,
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(msg);
  }
}
