import { IApiResponse } from "@/types";

class ApiResponse<T> implements IApiResponse<T> {
  readonly statusCode: number;
  readonly data: T;
  readonly message: string;
  readonly success: boolean;

  constructor(statusCode: number, data: T, message: string = "success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode >= 200 && statusCode < 300;
  }
}

export { ApiResponse };

// The implements keyword is only used with classes to ensure they fulfill the structure of an interface.
// It enforces adherence to a contract, making your code more robust and maintainable.
// For objects and functions, you rely on type annotations or interfaces without implements.
// user:User like this implement is for the class to implement the interface
