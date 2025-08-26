// LocalStorage 管理工具

export class StorageManager {
  private static instance: StorageManager;
  
  private constructor() {}
  
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // 用戶資料管理
  saveUserProfile(profile: any): void {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      localStorage.setItem('profileId', profile.id);
      console.log('用戶資料已保存:', profile);
    } catch (error) {
      console.error('保存用戶資料失敗:', error);
      throw new Error('無法保存用戶資料到本地存儲');
    }
  }

  getUserProfile(): any | null {
    try {
      const profile = localStorage.getItem('userProfile');
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('讀取用戶資料失敗:', error);
      return null;
    }
  }

  getProfileId(): string | null {
    return localStorage.getItem('profileId');
  }

  // 測驗結果管理
  saveTestResult(result: any): void {
    try {
      localStorage.setItem('testResult', JSON.stringify(result));
      localStorage.setItem('sessionId', result.id);
      console.log('測驗結果已保存:', result);
    } catch (error) {
      console.error('保存測驗結果失敗:', error);
      throw new Error('無法保存測驗結果到本地存儲');
    }
  }

  getTestResult(): any | null {
    try {
      const result = localStorage.getItem('testResult');
      return result ? JSON.parse(result) : null;
    } catch (error) {
      console.error('讀取測驗結果失敗:', error);
      return null;
    }
  }

  getSessionId(): string | null {
    return localStorage.getItem('sessionId');
  }

  // 清理數據
  clearUserData(): void {
    const keysToRemove = [
      'userProfile',
      'profileId',
      'testResult',
      'sessionId',
      'tempUserId', // 舊版本兼容
      'tempProfileId' // 舊版本兼容
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('用戶數據已清理');
  }

  // 驗證數據完整性
  validateUserSession(): boolean {
    const profile = this.getUserProfile();
    const profileId = this.getProfileId();
    
    if (!profile || !profileId || profile.id !== profileId) {
      console.warn('用戶會話數據不完整或不一致');
      return false;
    }
    
    return true;
  }

  // 調試信息
  getDebugInfo(): any {
    return {
      userProfile: this.getUserProfile(),
      profileId: this.getProfileId(),
      testResult: this.getTestResult(),
      sessionId: this.getSessionId(),
      isValid: this.validateUserSession()
    };
  }
}

export const storage = StorageManager.getInstance();