import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestService } from '@/services/testService';
import { TestQuestion, TestAnswers, UserProfile } from '@/types';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(),
      eq: vi.fn(() => ({
        single: vi.fn()
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock storage
const mockStorage = {
  saveTestResult: vi.fn(),
  getTestResult: vi.fn(),
  clearUserData: vi.fn()
};

vi.mock('@/utils/storage', () => ({
  storage: mockStorage
}));

describe('TestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockQuestions: TestQuestion[] = [
    {
      id: 'q1',
      question_text: '您感到快樂嗎？',
      question_order: 1,
      options: [
        { text: '非常快樂', score: 3 },
        { text: '一般', score: 2 },
        { text: '不快樂', score: 1 }
      ],
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 'q2',
      question_text: '您感到壓力嗎？',
      question_order: 2,
      options: [
        { text: '沒有壓力', score: 3 },
        { text: '一般', score: 2 },
        { text: '很大壓力', score: 1 }
      ],
      created_at: '2025-01-01T00:00:00Z'
    }
  ];

  const mockProfile: UserProfile = {
    id: 'profile-123',
    name: '張三',
    age: 25,
    gender: 'male',
    occupation: '工程師',
    user_id: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

  describe('getQuestions', () => {
    it('應該成功獲取測驗題目', async () => {
      mockSupabase.from().select().order.mockResolvedValue({
        data: mockQuestions.map(q => ({
          ...q,
          options: JSON.stringify(q.options)
        })),
        error: null
      });

      const result = await TestService.getQuestions();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockQuestions);
    });

    it('應該處理沒有題目的情況', async () => {
      mockSupabase.from().select().order.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await TestService.getQuestions();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('QUESTIONS_NOT_FOUND');
    });
  });

  describe('calculateScore', () => {
    it('應該正確計算分數', () => {
      const answers: TestAnswers = {
        'q1': { optionIndex: 0, score: 3 },
        'q2': { optionIndex: 1, score: 2 }
      };

      const result = TestService.calculateScore(answers, mockQuestions);

      expect(result.totalScore).toBe(5);
      expect(result.maxScore).toBe(6); // 2題 x 3分
      expect(result.percentage).toBe(83); // Math.round(5/6*100)
    });
  });

  describe('generateBasicResult', () => {
    it('應該為高分生成正向結果', () => {
      const result = TestService.generateBasicResult(85);
      expect(result).toContain('心理狀態良好');
    });

    it('應該為中等分數生成穩定結果', () => {
      const result = TestService.generateBasicResult(65);
      expect(result).toContain('心理狀態穩定');
    });

    it('應該為低分生成關注提醒', () => {
      const result = TestService.generateBasicResult(45);
      expect(result).toContain('需要關注');
    });

    it('應該為極低分生成諮詢建議', () => {
      const result = TestService.generateBasicResult(25);
      expect(result).toContain('建議專業諮詢');
    });
  });

  describe('generateUniqueCode', () => {
    it('應該生成唯一代碼', () => {
      const code1 = TestService.generateUniqueCode();
      const code2 = TestService.generateUniqueCode();

      expect(code1).toMatch(/^PSY-\d+-[A-Z0-9]{6}$/);
      expect(code2).toMatch(/^PSY-\d+-[A-Z0-9]{6}$/);
      expect(code1).not.toBe(code2);
    });
  });

  describe('saveTestSession', () => {
    const mockAnswers: TestAnswers = {
      'q1': { optionIndex: 0, score: 3 },
      'q2': { optionIndex: 1, score: 2 }
    };

    it('應該成功保存測驗結果', async () => {
      const mockSession = {
        id: 'session-123',
        user_id: null,
        profile_id: 'profile-123',
        answers: mockAnswers,
        basic_result: '心理狀態良好：您展現出積極正向的心理特質，能夠有效應對生活中的挑戰。',
        unique_code: 'PSY-1234567890-ABC123',
        is_paid: false,
        full_result: null,
        payment_session_id: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockSession,
        error: null
      });

      const result = await TestService.saveTestSession(mockAnswers, mockQuestions, mockProfile);

      expect(result.success).toBe(true);
      expect(result.data?.profile_id).toBe('profile-123');
      expect(result.data?.answers).toEqual(mockAnswers);
      expect(mockStorage.saveTestResult).toHaveBeenCalled();
    });

    it('應該驗證答案不能為空', async () => {
      const result = await TestService.saveTestSession({}, mockQuestions, mockProfile);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('測驗答案不能為空');
    });

    it('應該驗證題目數據', async () => {
      const result = await TestService.saveTestSession(mockAnswers, [], mockProfile);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('測驗題目數據錯誤');
    });

    it('應該驗證用戶資料', async () => {
      const invalidProfile = { ...mockProfile, id: '' };
      const result = await TestService.saveTestSession(mockAnswers, mockQuestions, invalidProfile);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('用戶資料錯誤');
    });
  });

  describe('getTestSession', () => {
    it('應該成功獲取測驗結果', async () => {
      const mockSession = {
        id: 'session-123',
        answers: { 'q1': { optionIndex: 0, score: 3 } },
        basic_result: '測試結果',
        unique_code: 'PSY-123',
        is_paid: false
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSession,
        error: null
      });

      const result = await TestService.getTestSession('session-123');

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('session-123');
    });

    it('應該處理找不到結果的情況', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'No rows found', code: 'PGRST116' }
      });

      const result = await TestService.getTestSession('non-existent');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PGRST116');
    });
  });
});