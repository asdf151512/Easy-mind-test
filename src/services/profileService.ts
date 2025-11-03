import { supabase } from '@/integrations/supabase/client';
import { UserProfile, PersonalInfoForm, AppError, ApiResponse } from '@/types';
import { ErrorHandler, withErrorHandling } from '@/utils/errorHandler';
import { storage } from '@/utils/storage';

export class ProfileService {
  static async createProfile(formData: PersonalInfoForm): Promise<ApiResponse<UserProfile>> {
    console.log('開始創建用戶資料...', formData);
    
    try {
      // 數據驗證
      if (!formData.name.trim()) {
        throw new AppError('姓名不能為空', 'VALIDATION_ERROR');
      }
      
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 1 || age > 120) {
        throw new AppError('年齡必須在1-120之間', 'VALIDATION_ERROR');
      }
      
      if (!formData.gender) {
        throw new AppError('請選擇性別', 'VALIDATION_ERROR');
      }

      // 準備插入數據
      const insertData = {
        name: formData.name.trim(),
        age: age,
        gender: formData.gender,
        occupation: formData.occupation?.trim() || null,
        user_id: null // 匿名用戶
      };

      console.log('準備插入的資料:', insertData);

      // 插入到數據庫
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase 插入錯誤:', error);
        throw error;
      }

      if (!data) {
        throw new AppError('創建用戶資料失敗：無返回數據', 'PROFILE_CREATE_FAILED');
      }

      console.log('用戶資料創建成功:', data);

      // 保存到本地存儲
      storage.saveUserProfile(data);

      return {
        success: true,
        data: data as UserProfile
      };

    } catch (error) {
      const handledError = ErrorHandler.handleError(error);
      console.error('創建用戶資料失敗:', handledError);
      
      return {
        success: false,
        error: {
          message: ErrorHandler.getErrorMessage(handledError),
          code: handledError.code,
          details: handledError.details
        }
      };
    }
  }

  static async getProfile(profileId: string): Promise<ApiResponse<UserProfile>> {
    console.log('獲取用戶資料:', profileId);
    
    try {
      // For anonymous users, we need to get profile through session
      // This is more secure as it prevents direct profile access
      const sessionId = storage.getSessionId();
      
      if (sessionId) {
        // Use secure RPC function that validates session ownership
        const { data, error } = await supabase
          .rpc('get_profile_by_session', { session_id: sessionId });

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          throw new AppError('找不到用戶資料', 'PROFILE_NOT_FOUND');
        }

        return {
          success: true,
          data: data[0] as UserProfile
        };
      } else {
        throw new AppError('無效的會話', 'INVALID_SESSION');
      }

    } catch (error) {
      const handledError = ErrorHandler.handleError(error);
      console.error('獲取用戶資料失敗:', handledError);
      
      return {
        success: false,
        error: {
          message: ErrorHandler.getErrorMessage(handledError),
          code: handledError.code,
          details: handledError.details
        }
      };
    }
  }

  static validateLocalProfile(): boolean {
    return storage.validateUserSession();
  }

  static getLocalProfile(): UserProfile | null {
    return storage.getUserProfile();
  }

  static clearProfile(): void {
    storage.clearUserData();
  }
}