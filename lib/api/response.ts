/**
 * 统一 API 响应格式
 * 提供标准化的 API 响应工具函数
 */

import { NextResponse } from 'next/server';
import { AppError, getErrorMessage, getErrorStatusCode, getErrorCode } from './error';

/**
 * 成功响应数据结构
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * 错误响应数据结构
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

/**
 * 分页响应数据结构
 */
export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * 创建成功响应
 * @param data 响应数据
 * @param message 可选的成功消息
 * @param status HTTP 状态码，默认 200
 * @returns NextResponse 对象
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * 创建分页响应
 * @param data 响应数据数组
 * @param total 总记录数
 * @param page 当前页码
 * @param limit 每页记录数
 * @returns NextResponse 对象
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

/**
 * 创建错误响应
 * @param error 错误对象
 * @returns NextResponse 对象
 */
export function errorResponse(error: unknown): NextResponse<ErrorResponse> {
  const statusCode = getErrorStatusCode(error);
  const message = getErrorMessage(error);
  const code = getErrorCode(error);

  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
      },
    },
    { status: statusCode }
  );
}

/**
 * 创建自定义错误响应
 * @param message 错误消息
 * @param status HTTP 状态码
 * @param code 可选的错误代码
 * @returns NextResponse 对象
 */
export function customErrorResponse(
  message: string,
  status: number = 500,
  code?: string
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
      },
    },
    { status }
  );
}

/**
 * 创建未授权响应
 * @param message 错误消息，默认为 '未授权'
 * @returns NextResponse 对象
 */
export function unauthorizedResponse(
  message: string = '未授权，请先登录'
): NextResponse<ErrorResponse> {
  return customErrorResponse(message, 401, 'UNAUTHORIZED');
}

/**
 * 创建验证错误响应
 * @param message 错误消息，默认为 '请求参数验证失败'
 * @returns NextResponse 对象
 */
export function validationErrorResponse(
  message: string = '请求参数验证失败'
): NextResponse<ErrorResponse> {
  return customErrorResponse(message, 400, 'VALIDATION_ERROR');
}

/**
 * 创建未找到响应
 * @param message 错误消息，默认为 '资源未找到'
 * @returns NextResponse 对象
 */
export function notFoundResponse(
  message: string = '资源未找到'
): NextResponse<ErrorResponse> {
  return customErrorResponse(message, 404, 'NOT_FOUND');
}
