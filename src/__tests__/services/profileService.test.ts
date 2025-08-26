import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ProfileService } from '@/services/profileService';
import { PersonalInfoForm } from '@/types';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
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
  saveUserProfile: vi.fn(),
  validateUserSession: vi.fn(),
  getUserProfile: vi.fn(),
  clearUserData: vi.fn()
};

vi.mock('@/utils/storage', () => ({
  storage: mockStorage
}));

describe('ProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('createProfile', () => {
    const validFormData: PersonalInfoForm = {
      name: '張三',
      age: '25',
      gender: 'male',
      occupation: '工程師'
    };

    it('應該成功創建用戶資料', async () => {
      const mockProfile = {
        id: 'test-id-123',
        name: '張三',
        age: 25,
        gender: 'male',
        occupation: '工程師',
        user_id: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockProfile,
        error: null
      });

      const result = await ProfileService.createProfile(validFormData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
      expect(mockStorage.saveUserProfile).toHaveBeenCalledWith(mockProfile);
    });

    it('應該驗證姓名不能為空', async () => {
      const invalidFormData = { ...validFormData, name: '' };
      
      const result = await ProfileService.createProfile(invalidFormData);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('姓名不能為空');
    });

    it('應該驗證年齡範圍', async () => {
      const invalidFormData = { ...validFormData, age: '150' };
      
      const result = await ProfileService.createProfile(invalidFormData);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('年齡必須在1-120之間');
    });

    it('應該驗證性別必填', async () => {
      const invalidFormData = { ...validFormData, gender: '' };
      
      const result = await ProfileService.createProfile(invalidFormData);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toContain('請選擇性別');
    });

    it('應該處理數據庫錯誤', async () => {
      const dbError = {
        message: 'Database connection failed',
        code: '08000'
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: dbError
      });

      const result = await ProfileService.createProfile(validFormData);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('08000');
    });
  });

  describe('getProfile', () => {
    it('應該成功獲取用戶資料', async () => {
      const mockProfile = {
        id: 'test-id-123',
        name: '張三',
        age: 25,
        gender: 'male',
        occupation: '工程師',
        user_id: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockProfile,
        error: null
      });

      const result = await ProfileService.getProfile('test-id-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
    });

    it('應該處理找不到用戶的情況', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'No rows found', code: 'PGRST116' }
      });

      const result = await ProfileService.getProfile('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PGRST116');
    });
  });

  describe('validateLocalProfile', () => {
    it('應該調用 storage 的驗證方法', () => {
      mockStorage.validateUserSession.mockReturnValue(true);
      
      const result = ProfileService.validateLocalProfile();
      
      expect(result).toBe(true);
      expect(mockStorage.validateUserSession).toHaveBeenCalled();
    });
  });

  describe('getLocalProfile', () => {
    it('應該從本地存儲獲取用戶資料', () => {
      const mockProfile = { id: 'test', name: '測試用戶' };
      mockStorage.getUserProfile.mockReturnValue(mockProfile);
      
      const result = ProfileService.getLocalProfile();
      
      expect(result).toEqual(mockProfile);
      expect(mockStorage.getUserProfile).toHaveBeenCalled();
    });
  });

  describe('clearProfile', () => {
    it('應該清理用戶資料', () => {
      ProfileService.clearProfile();
      
      expect(mockStorage.clearUserData).toHaveBeenCalled();
    });
  });
});