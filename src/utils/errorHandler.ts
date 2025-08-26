import { AppError } from '@/types';

export class ErrorHandler {
  static handleError(error: any): AppError {
    console.error('處理錯誤:', error);

    // Supabase 錯誤
    if (error?.code && error?.message) {
      return new AppError(
        `數據庫錯誤: ${error.message}`,
        error.code,
        {
          supabaseError: true,
          details: error.details,
          hint: error.hint
        }
      );
    }

    // 網絡錯誤
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new AppError(
        '網絡連接錯誤，請檢查您的網絡連接',
        'NETWORK_ERROR'
      );
    }

    // 自定義應用錯誤
    if (error instanceof AppError) {
      return error;
    }

    // 一般錯誤
    return new AppError(
      error?.message || '發生未知錯誤',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }

  static getErrorMessage(error: AppError): string {
    switch (error.code) {
      case '23503':
        return '數據關聯錯誤，請重新開始測驗';
      case 'PGRST116':
        return '找不到相關資料';
      case 'NETWORK_ERROR':
        return '網絡連接問題，請檢查網絡後重試';
      case 'PROFILE_NOT_FOUND':
        return '用戶資料遺失，請重新填寫個人資料';
      case 'QUESTIONS_NOT_FOUND':
        return '無法載入測驗題目，請重新整理頁面';
      case 'SESSION_SAVE_FAILED':
        return '測驗結果保存失敗，請重試';
      default:
        return error.message;
    }
  }
}

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw ErrorHandler.handleError(error);
    }
  };
}