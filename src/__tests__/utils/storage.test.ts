import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageManager } from '@/utils/storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('StorageManager', () => {
  let storage: StorageManager;

  beforeEach(() => {
    localStorageMock.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    storage = StorageManager.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('應該返回相同的實例', () => {
      const storage1 = StorageManager.getInstance();
      const storage2 = StorageManager.getInstance();
      
      expect(storage1).toBe(storage2);
    });
  });

  describe('User Profile Management', () => {
    const mockProfile = {
      id: 'profile-123',
      name: '張三',
      age: 25,
      gender: 'male',
      occupation: '工程師'
    };

    it('應該保存用戶資料', () => {
      storage.saveUserProfile(mockProfile);

      expect(localStorage.getItem('userProfile')).toBe(JSON.stringify(mockProfile));
      expect(localStorage.getItem('profileId')).toBe('profile-123');
    });

    it('應該獲取用戶資料', () => {
      localStorage.setItem('userProfile', JSON.stringify(mockProfile));

      const result = storage.getUserProfile();

      expect(result).toEqual(mockProfile);
    });

    it('應該獲取用戶ID', () => {
      localStorage.setItem('profileId', 'profile-123');

      const result = storage.getProfileId();

      expect(result).toBe('profile-123');
    });

    it('應該處理無效的用戶資料', () => {
      localStorage.setItem('userProfile', 'invalid json');

      const result = storage.getUserProfile();

      expect(result).toBeNull();
    });
  });

  describe('Test Result Management', () => {
    const mockResult = {
      id: 'session-123',
      unique_code: 'PSY-123',
      basic_result: '測試結果',
      is_paid: false
    };

    it('應該保存測驗結果', () => {
      storage.saveTestResult(mockResult);

      expect(localStorage.getItem('testResult')).toBe(JSON.stringify(mockResult));
      expect(localStorage.getItem('sessionId')).toBe('session-123');
    });

    it('應該獲取測驗結果', () => {
      localStorage.setItem('testResult', JSON.stringify(mockResult));

      const result = storage.getTestResult();

      expect(result).toEqual(mockResult);
    });

    it('應該獲取會話ID', () => {
      localStorage.setItem('sessionId', 'session-123');

      const result = storage.getSessionId();

      expect(result).toBe('session-123');
    });

    it('應該處理無效的測驗結果', () => {
      localStorage.setItem('testResult', 'invalid json');

      const result = storage.getTestResult();

      expect(result).toBeNull();
    });
  });

  describe('Data Cleanup', () => {
    it('應該清除所有用戶數據', () => {
      // 設置一些測試數據
      localStorage.setItem('userProfile', '{}');
      localStorage.setItem('profileId', 'test');
      localStorage.setItem('testResult', '{}');
      localStorage.setItem('sessionId', 'test');
      localStorage.setItem('tempUserId', 'test');
      localStorage.setItem('tempProfileId', 'test');

      storage.clearUserData();

      // 檢查所有相關數據都被清除
      expect(localStorage.getItem('userProfile')).toBeNull();
      expect(localStorage.getItem('profileId')).toBeNull();
      expect(localStorage.getItem('testResult')).toBeNull();
      expect(localStorage.getItem('sessionId')).toBeNull();
      expect(localStorage.getItem('tempUserId')).toBeNull();
      expect(localStorage.getItem('tempProfileId')).toBeNull();
    });
  });

  describe('Session Validation', () => {
    it('應該驗證完整的用戶會話', () => {
      const mockProfile = { id: 'profile-123', name: '測試' };
      localStorage.setItem('userProfile', JSON.stringify(mockProfile));
      localStorage.setItem('profileId', 'profile-123');

      const result = storage.validateUserSession();

      expect(result).toBe(true);
    });

    it('應該檢測不一致的用戶會話', () => {
      const mockProfile = { id: 'profile-123', name: '測試' };
      localStorage.setItem('userProfile', JSON.stringify(mockProfile));
      localStorage.setItem('profileId', 'different-id');

      const result = storage.validateUserSession();

      expect(result).toBe(false);
    });

    it('應該檢測缺少用戶資料的會話', () => {
      localStorage.setItem('profileId', 'profile-123');

      const result = storage.validateUserSession();

      expect(result).toBe(false);
    });
  });

  describe('Debug Information', () => {
    it('應該提供調試信息', () => {
      const mockProfile = { id: 'profile-123', name: '測試' };
      const mockResult = { id: 'session-123' };
      
      localStorage.setItem('userProfile', JSON.stringify(mockProfile));
      localStorage.setItem('profileId', 'profile-123');
      localStorage.setItem('testResult', JSON.stringify(mockResult));
      localStorage.setItem('sessionId', 'session-123');

      const debugInfo = storage.getDebugInfo();

      expect(debugInfo.userProfile).toEqual(mockProfile);
      expect(debugInfo.profileId).toBe('profile-123');
      expect(debugInfo.testResult).toEqual(mockResult);
      expect(debugInfo.sessionId).toBe('session-123');
      expect(debugInfo.isValid).toBe(true);
    });
  });
});