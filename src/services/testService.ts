import { supabase } from '@/integrations/supabase/client';
import { TestQuestion, TestSession, TestAnswers, AppError, ApiResponse, UserProfile } from '@/types';
import { ErrorHandler } from '@/utils/errorHandler';
import { storage } from '@/utils/storage';

export class TestService {
  static async getQuestions(): Promise<ApiResponse<TestQuestion[]>> {
    console.log('獲取測驗題目...');
    
    try {
      const { data, error } = await supabase
        .from('test_questions')
        .select('*')
        .order('question_order');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new AppError('找不到測驗題目', 'QUESTIONS_NOT_FOUND');
      }

      // 解析選項數據
      const questions: TestQuestion[] = data.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)
      }));

      console.log('成功獲取測驗題目:', questions.length, '題');

      return {
        success: true,
        data: questions
      };

    } catch (error) {
      const handledError = ErrorHandler.handleError(error);
      console.error('獲取測驗題目失敗:', handledError);
      
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

  static calculateScore(answers: TestAnswers, questions: TestQuestion[]): {
    totalScore: number;
    maxScore: number;
    percentage: number;
  } {
    const totalScore = Object.values(answers).reduce((sum, answer) => sum + answer.score, 0);
    const maxScore = questions.length * 3; // 每題最高3分
    const percentage = Math.round((totalScore / maxScore) * 100);

    console.log('分數計算結果:', { totalScore, maxScore, percentage });

    return { totalScore, maxScore, percentage };
  }

  static generateBasicResult(percentage: number): string {
    if (percentage >= 80) {
      return "心理狀態良好：您展現出積極正向的心理特質，能夠有效應對生活中的挑戰。";
    } else if (percentage >= 60) {
      return "心理狀態穩定：您具備不錯的心理調適能力，在某些方面還有成長空間。";
    } else if (percentage >= 40) {
      return "需要關注：建議您多關注自己的心理健康，適時尋求支持和協助。";
    } else {
      return "建議專業諮詢：您可能正面臨一些心理壓力，建議考慮尋求專業心理諮詢。";
    }
  }

  static generateUniqueCode(): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `PSY-${timestamp}-${randomStr}`;
  }

  static async saveTestSession(
    answers: TestAnswers, 
    questions: TestQuestion[], 
    profile: UserProfile
  ): Promise<ApiResponse<TestSession>> {
    console.log('保存測驗結果...', { profile: profile.id, answersCount: Object.keys(answers).length });
    
    try {
      // 驗證輸入數據
      if (!answers || Object.keys(answers).length === 0) {
        throw new AppError('測驗答案不能為空', 'VALIDATION_ERROR');
      }

      if (!questions || questions.length === 0) {
        throw new AppError('測驗題目數據錯誤', 'VALIDATION_ERROR');
      }

      if (!profile || !profile.id) {
        throw new AppError('用戶資料錯誤', 'VALIDATION_ERROR');
      }

      // 計算分數和生成結果
      const { totalScore, maxScore, percentage } = this.calculateScore(answers, questions);
      const basicResult = this.generateBasicResult(percentage);
      const uniqueCode = this.generateUniqueCode();

      // 準備插入數據
      const sessionData = {
        user_id: null, // 匿名用戶
        profile_id: profile.id,
        answers: answers as any, // 轉換為Json類型
        basic_result: basicResult,
        unique_code: uniqueCode,
        is_paid: false,
        full_result: null,
        payment_session_id: null
      };

      console.log('準備插入的測驗數據:', sessionData);

      // 保存到數據庫
      const { data, error } = await supabase
        .from('test_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Supabase 插入測驗結果錯誤:', error);
        throw error;
      }

      if (!data) {
        throw new AppError('保存測驗結果失敗：無返回數據', 'SESSION_SAVE_FAILED');
      }

      console.log('測驗結果保存成功:', data);

      // 轉換數據類型
      const testSession: TestSession = {
        ...data,
        answers: data.answers as unknown as TestAnswers
      };

      // 保存到本地存儲
      storage.saveTestResult(testSession);

      return {
        success: true,
        data: testSession
      };

    } catch (error) {
      const handledError = ErrorHandler.handleError(error);
      console.error('保存測驗結果失敗:', handledError);
      
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

  static async getTestSession(sessionId: string): Promise<ApiResponse<TestSession>> {
    console.log('獲取測驗結果:', sessionId);
    
    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new AppError('找不到測驗結果', 'SESSION_NOT_FOUND');
      }

      // 轉換數據類型
      const testSession: TestSession = {
        ...data,
        answers: data.answers as unknown as TestAnswers
      };

      return {
        success: true,
        data: testSession
      };

    } catch (error) {
      const handledError = ErrorHandler.handleError(error);
      console.error('獲取測驗結果失敗:', handledError);
      
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

  static getLocalTestResult(): TestSession | null {
    return storage.getTestResult();
  }

  static clearTestData(): void {
    storage.clearUserData();
  }
}