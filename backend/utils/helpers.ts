import { ApiResponse } from '@/types/common';

export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
  };
};

export const createErrorResponse = (message: string, error?: string): ApiResponse => {
  return {
    success: false,
    message,
    error,
  };
};

export const generateId = (): string => {
  return crypto.randomUUID();
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};