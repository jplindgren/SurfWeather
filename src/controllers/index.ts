import logger from '@src/logger';
import { CUSTOM_VALIDATION } from '@src/models/user';
import ApiError, { APIError } from '@src/util/errors/api-error';
import { Response } from 'express';
import mongoose from 'mongoose';

export abstract class BaseController {
  protected handleCreateUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errorResponse = this.handleClientValidationErrors(error);
      this.setResponse(res, errorResponse.code, errorResponse.error);
    } else {
      logger.error(error);
      this.setResponse(res, 500, 'Oops.. Something went wrong.');
    }
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }

  private setResponse(res: Response, code: number, message: string): void {
    res.status(code).send(ApiError.format({ code, message }));
  }

  private handleClientValidationErrors(
    error: mongoose.Error.ValidationError
  ): { code: number; error: string } {
    const hasDuplicatedError = Object.values(error.errors).some(
      (x) => x.kind === CUSTOM_VALIDATION.DUPLICATED
    );
    if (hasDuplicatedError) {
      return { code: 409, error: error.message };
    } else {
      return { code: 422, error: error.message };
    }
  }
}
