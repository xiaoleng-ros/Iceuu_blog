/**
 * 统一错误处理
 * 定义自定义错误类和错误处理工具函数
 */

/**
 * 自定义错误基类
 * @param {string} message - 错误消息
 * @param {number} [statusCode=500] - HTTP 状态码
 * @param {string} [code] - 错误代码标识
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 未授权错误
 * @param {string} [message='未授权，请先登录'] - 错误消息
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权，请先登录') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

/**
 * 验证错误
 * @param {string} [message='请求参数验证失败'] - 错误消息
 */
export class ValidationError extends AppError {
  constructor(message: string = '请求参数验证失败') {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * 未找到错误
 * @param {string} [message='资源未找到'] - 错误消息
 */
export class NotFoundError extends AppError {
  constructor(message: string = '资源未找到') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * 环境变量错误
 * @param {string} [message='环境变量配置错误'] - 错误消息
 */
export class EnvironmentError extends AppError {
  constructor(message: string = '环境变量配置错误') {
    super(message, 500, 'ENV_ERROR');
    this.name = 'EnvironmentError';
  }
}

/**
 * 文件上传错误
 * @param {string} [message='文件上传失败'] - 错误消息
 */
export class UploadError extends AppError {
  constructor(message: string = '文件上传失败') {
    super(message, 500, 'UPLOAD_ERROR');
    this.name = 'UploadError';
  }
}

/**
 * 数据库错误
 * @param {string} [message='数据库操作失败'] - 错误消息
 */
export class DatabaseError extends AppError {
  constructor(message: string = '数据库操作失败') {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

/**
 * 判断是否为应用错误
 * @param {unknown} error - 待检查的错误对象
 * @returns {boolean} - 如果是应用错误返回 true，否则返回 false
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * 获取错误消息
 * @param {unknown} error - 错误对象
 * @returns {string} - 错误消息字符串，默认为 '发生未知错误'
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '发生未知错误';
}

/**
 * 获取错误状态码
 * @param {unknown} error - 错误对象
 * @returns {number} - HTTP 状态码，默认为 500
 */
export function getErrorStatusCode(error: unknown): number {
  if (isAppError(error)) {
    return error.statusCode;
  }
  return 500;
}

/**
 * 获取错误代码标识
 * @param {unknown} error - 错误对象
 * @returns {string | undefined} - 错误代码字符串或 undefined
 */
export function getErrorCode(error: unknown): string | undefined {
  if (isAppError(error)) {
    return error.code;
  }
  return undefined;
}
