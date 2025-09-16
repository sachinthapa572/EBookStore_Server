import type { IApiResponse } from "@/types";

class ApiResponse<T> implements IApiResponse<T> {
  readonly statusCode: number;
  readonly data: T;
  readonly message: string;
  readonly success: boolean;

  constructor(statusCode: number, data: T, message = "success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode >= 200 && statusCode < 300;
  }
}

export { ApiResponse };
