import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorHandler } from '@/utils/errorHandler';
import { AppError } from '@/types';

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.error to avoid noise in test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('handleError', () => {
    it('應該處理 Supabase 錯誤', () => {
      const supabaseError = {
        message: 'insert or update violates foreign key constraint',
        code: '23503',
        details: 'Key is not present in table "users"',
        hint: null
      };

      const result = ErrorHandler.handleError(supabaseError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toContain('數據庫錯誤');
      expect(result.code).toBe('23503');
      expect(result.details?.supabaseError).toBe(true);
    });

    it('應該處理網絡錯誤', () => {
      const networkError = new TypeError('Failed to fetch');

      const result = ErrorHandler.handleError(networkError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toContain('網絡連接錯誤');
      expect(result.code).toBe('NETWORK_ERROR');
    });

    it('應該保持自定義應用錯誤不變', () => {
      const appError = new AppError('自定義錯誤', 'CUSTOM_ERROR');

      const result = ErrorHandler.handleError(appError);

      expect(result).toBe(appError);
      expect(result.message).toBe('自定義錯誤');
      expect(result.code).toBe('CUSTOM_ERROR');
    });

    it('應該處理一般錯誤', () => {
      const generalError = new Error('一般錯誤');

      const result = ErrorHandler.handleError(generalError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('一般錯誤');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });

    it('應該處理無訊息的錯誤', () => {
      const result = ErrorHandler.handleError(null);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('發生未知錯誤');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('getErrorMessage', () => {
    it('應該返回外鍵約束錯誤的友好訊息', () => {
      const error = new AppError('DB Error', '23503');
      const message = ErrorHandler.getErrorMessage(error);
      
      expect(message).toBe('數據關聯錯誤，請重新開始測驗');
    });

    it('應該返回找不到資料錯誤的友好訊息', () => {
      const error = new AppError('Not found', 'PGRST116');
      const message = ErrorHandler.getErrorMessage(error);
      
      expect(message).toBe('找不到相關資料');
    });

    it('應該返回網絡錯誤的友好訊息', () => {
      const error = new AppError('Network failed', 'NETWORK_ERROR');
      const message = ErrorHandler.getErrorMessage(error);
      
      expect(message).toBe('網絡連接問題，請檢查網絡後重試');
    });

    it('應該返回用戶資料錯誤的友好訊息', () => {
      const error = new AppError('Profile missing', 'PROFILE_NOT_FOUND');
      const message = ErrorHandler.getErrorMessage(error);
      
      expect(message).toBe('用戶資料遺失，請重新填寫個人資料');
    });

    it('應該返回測驗題目錯誤的友好訊息', () => {
      const error = new AppError('No questions', 'QUESTIONS_NOT_FOUND');
      const message = ErrorHandler.getErrorMessage(error);
      
      expect(message).toBe('無法載入測驗題目，請重新整理頁面');
    });

    it('應該返回保存失敗錯誤的友好訊息', () => {
      const error = new AppError('Save failed', 'SESSION_SAVE_FAILED');
      const message = ErrorHandler.getErrorMessage(error);
      
      expect(message).toBe('測驗結果保存失敗，請重試');
    });

    it('應該返回未知錯誤的原始訊息', () => {
      const error = new AppError('未知錯誤訊息', 'UNKNOWN_CODE');
      const message = ErrorHandler.getErrorMessage(error);
      
      expect(message).toBe('未知錯誤訊息');
    });
  });
});