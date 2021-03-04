import httpStatusCodes from 'http-status-codes';

export interface APIError {
  message: string;
  code: number;
  codeAsStrng?: string;
  description?: string;
  documentation?: string;
}

export interface APIErrorResponse extends Omit<APIError, 'codeAsString'> {
  error: string;
}

export default class ApiError {
  public static format(error: APIError): APIErrorResponse {
    return {
      message: error.message,
      code: error.code,
      error: error.codeAsStrng
        ? error.codeAsStrng
        : httpStatusCodes.getStatusText(error.code),
      ...(error.documentation && { documentation: error.documentation }),
      ...(error.description && { description: error.description }),
    };
  }
}
