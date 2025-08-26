// 統一的類型定義

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  occupation: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestQuestion {
  id: string;
  question_text: string;
  question_order: number;
  options: Array<{
    text: string;
    score: number;
  }>;
  created_at: string;
}

export interface TestAnswer {
  optionIndex: number;
  score: number;
}

export interface TestAnswers {
  [questionId: string]: TestAnswer;
}

export interface TestSession {
  id: string;
  user_id: string | null;
  profile_id: string;
  answers: TestAnswers;
  basic_result: string;
  full_result: string | null;
  unique_code: string;
  is_paid: boolean;
  payment_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  session: TestSession;
  profile: UserProfile;
  totalScore: number;
  maxScore: number;
  percentage: number;
}

export interface PersonalInfoForm {
  name: string;
  age: string;
  gender: string;
  occupation: string;
}

// 錯誤類型
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}