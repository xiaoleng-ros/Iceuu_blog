/**
 * 统一 API 响应格式
 * 提供标准化的 API 响应工具函数
 */

import { NextResponse } from 'next/server';
import { getErrorMessage, getErrorStatusCode, getErrorCode } from './error';

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
 * @param {T} data - 响应数据
 * @param {string} [message] - 可选的成功消息
 * @param {number} [status=200] - HTTP 状态码
 * @returns {NextResponse<SuccessResponse<T>>}
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
 * @param {T[]} data - 响应数据数组
 * @param {number} total - 总记录数
 * @param {number} page - 当前页码
 * @param {number} limit - 每页记录数
 * @returns {NextResponse<PaginatedResponse<T>>}
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
 * @param {unknown} error - 错误对象
 * @returns {NextResponse<ErrorResponse>}
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
 * @param {string} message - 错误消息
 * @param {number} [status=500] - HTTP 状态码
 * @param {string} [code] - 可选的错误代码
 * @returns {NextResponse<ErrorResponse>}
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
 * @param {string} [message='未授权，请先登录'] - 错误消息
 * @returns {NextResponse<ErrorResponse>}
 */
export function unauthorizedResponse(
  message: string = '未授权，请先登录'
): NextResponse<ErrorResponse> {
  return customErrorResponse(message, 401, 'UNAUTHORIZED');
}

/**
 * 创建验证错误响应
 * @param {string} [message='请求参数验证失败'] - 错误消息
 * @returns {NextResponse<ErrorResponse>}
 */
export function validationErrorResponse(
  message: string = '请求参数验证失败'
): NextResponse<ErrorResponse> {
  return customErrorResponse(message, 400, 'VALIDATION_ERROR');
}

/**
 * 创建未找到响应
 * @param {string} [message='资源未找到'] - 错误消息
 * @returns {NextResponse<ErrorResponse>}
 */
export function notFoundResponse(
  message: string = '资源未找到'
): NextResponse<ErrorResponse> {
  return customErrorResponse(message, 404, 'NOT_FOUND');
}
