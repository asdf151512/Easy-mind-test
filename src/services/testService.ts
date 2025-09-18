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

  static generateBasicResult(percentage: number, category: string = 'all', answers?: TestAnswers, questions?: TestQuestion[]): string {
    const categoryNames: { [key: string]: string } = {
      'family': '家庭',
      'relationship': '感情關係',
      'work': '工作',
      'personal': '個人思維',
      'all': '綜合'
    };

    const categoryName = categoryNames[category] || '綜合';

    // 生成詳細的基礎分析報告
    return this.generateEnhancedBasicReport(percentage, category, categoryName, answers, questions);
  }

  static generateEnhancedBasicReport(
    percentage: number,
    category: string,
    categoryName: string,
    answers?: TestAnswers,
    questions?: TestQuestion[]
  ): string {
    const analysisLevel = this.getAnalysisLevel(percentage);

    // 分析答題模式
    const answerPattern = this.analyzeAnswerPattern(answers, questions);

    return `
<div class="enhanced-basic-report">
  <h3>${categoryName}心理狀態分析報告</h3>

  <div class="overall-assessment">
    <h4>整體評估</h4>
    <p><strong>評估結果：${analysisLevel.level}</strong></p>
    <p>${analysisLevel.description}</p>
    <p>您在${categoryName}方面的綜合得分為 <strong>${percentage}%</strong>，${this.getPercentageDescription(percentage, category)}</p>
  </div>

  <div class="detailed-analysis">
    <h4>詳細分析</h4>
    ${this.getCategorySpecificAnalysis(category, percentage, answerPattern)}
  </div>

  <div class="behavioral-insights">
    <h4>行為特徵洞察</h4>
    ${this.getBehavioralInsights(answerPattern, category)}
  </div>

  <div class="improvement-suggestions">
    <h4>改善建議</h4>
    ${this.getImprovementSuggestions(percentage, category)}
  </div>

  <div class="next-steps">
    <h4>下一步行動</h4>
    ${this.getActionSteps(percentage, category)}
  </div>

  <div class="unlock-notice">
    <h4>🔓 解鎖完整報告</h4>
    <p>想要獲得更深入的個人化分析嗎？完整版報告包含：</p>
    <ul>
      <li>📊 詳細的多維度能力雷達圖</li>
      <li>🎯 基於您年齡、職業的個人化建議</li>
      <li>📈 具體的成長計劃和時間表</li>
      <li>🔬 深度心理機制分析</li>
      <li>💡 專業級改善策略</li>
    </ul>
  </div>
</div>
    `;
  }

  static getAnalysisLevel(percentage: number): { level: string; description: string } {
    if (percentage >= 80) {
      return {
        level: "優秀水準",
        description: "您在此領域展現出卓越的能力和積極的態度，能夠有效應對各種挑戰並保持良好的狀態。"
      };
    } else if (percentage >= 65) {
      return {
        level: "良好水準",
        description: "您在此領域表現良好，具備穩定的能力和正面的態度，在某些方面還有進一步提升的空間。"
      };
    } else if (percentage >= 50) {
      return {
        level: "中等水準",
        description: "您在此領域的表現處於平均水準，有一定的基礎能力，但需要加強和改善以達到更好的狀態。"
      };
    } else if (percentage >= 35) {
      return {
        level: "需要關注",
        description: "您在此領域可能面臨一些挑戰，建議積極尋求改善方法和支持資源。"
      };
    } else {
      return {
        level: "建議專業協助",
        description: "您在此領域可能需要專業的指導和支持來改善現狀，建議考慮尋求相關的專業服務。"
      };
    }
  }

  static analyzeAnswerPattern(answers?: TestAnswers, questions?: TestQuestion[]) {
    if (!answers || !questions) {
      return {
        highScoreCount: 0,
        mediumScoreCount: 0,
        lowScoreCount: 0,
        consistency: 'unknown',
        totalAnswers: 0
      };
    }

    const scores = Object.values(answers).map(answer => answer.score);
    const highScoreCount = scores.filter(score => score === 3).length;
    const mediumScoreCount = scores.filter(score => score === 2).length;
    const lowScoreCount = scores.filter(score => score === 1).length;

    // 計算一致性（標準差）
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    let consistency = 'medium';
    if (standardDeviation < 0.5) consistency = 'high';
    else if (standardDeviation > 0.8) consistency = 'low';

    return {
      highScoreCount,
      mediumScoreCount,
      lowScoreCount,
      consistency,
      totalAnswers: scores.length
    };
  }

  static getPercentageDescription(percentage: number, category: string): string {
    const categoryNames: { [key: string]: string } = {
      'family': '家庭關係管理',
      'relationship': '感情經營',
      'work': '職場心理調適',
      'personal': '個人成長',
      'all': '綜合心理素質'
    };

    const categoryDesc = categoryNames[category] || '心理健康';

    if (percentage >= 80) {
      return `在${categoryDesc}方面表現卓越，展現出成熟穩定的心理特質。`;
    } else if (percentage >= 65) {
      return `在${categoryDesc}方面表現良好，具備良好的基礎能力。`;
    } else if (percentage >= 50) {
      return `在${categoryDesc}方面表現中等，有明確的成長潛力。`;
    } else if (percentage >= 35) {
      return `在${categoryDesc}方面需要加強關注和改善。`;
    } else {
      return `在${categoryDesc}方面建議尋求專業指導和支持。`;
    }
  }

  static getCategorySpecificAnalysis(category: string, percentage: number, pattern: any): string {
    switch (category) {
      case 'family':
        return `
          <p>在家庭關係方面，您展現出${percentage >= 70 ? '良好的' : percentage >= 50 ? '適中的' : '需要改善的'}家庭互動能力。</p>
          <p>您在家庭溝通、責任分擔、親子關係等方面${percentage >= 60 ? '具備基本的處理能力' : '可能需要加強學習'}。</p>
          <p>從您的答題模式來看，您${pattern.consistency === 'high' ? '在家庭議題上有一致的處理方式' : '在不同家庭情境中的反應較為多變'}。</p>
        `;
      case 'relationship':
        return `
          <p>在感情關係方面，您表現出${percentage >= 70 ? '成熟的' : percentage >= 50 ? '發展中的' : '需要提升的'}情感管理能力。</p>
          <p>您在情感表達、親密關係建立、衝突處理等方面${percentage >= 60 ? '有一定的技巧和經驗' : '還有很大的學習空間'}。</p>
          <p>答題分析顯示，您${pattern.highScoreCount > pattern.totalAnswers * 0.6 ? '在感情方面較為主動積極' : '在感情處理上比較謹慎保守'}。</p>
        `;
      case 'work':
        return `
          <p>在工作心理方面，您展現出${percentage >= 70 ? '優秀的' : percentage >= 50 ? '穩定的' : '需要改善的'}職場適應能力。</p>
          <p>您在壓力管理、人際關係、工作動機等方面${percentage >= 60 ? '表現穩定' : '仍有提升空間'}。</p>
          <p>從回答模式可以看出，您${pattern.consistency === 'high' ? '在職場上有明確的行為準則' : '面對不同工作情境會靈活調整'}。</p>
        `;
      case 'personal':
        return `
          <p>在個人思維發展方面，您顯示出${percentage >= 70 ? '高度的' : percentage >= 50 ? '良好的' : '有待提升的'}自我認知能力。</p>
          <p>您在情緒管理、自我反思、目標設定等方面${percentage >= 60 ? '具備良好的基礎' : '需要更多的練習和培養'}。</p>
          <p>答題傾向反映出您${pattern.mediumScoreCount > pattern.totalAnswers * 0.4 ? '在自我評估上比較理性客觀' : '對自己的要求較為嚴格或寬鬆'}。</p>
        `;
      default:
        return `
          <p>在綜合心理評估中，您展現出${percentage >= 70 ? '均衡發展的' : percentage >= 50 ? '穩定成長的' : '需要全面關注的'}心理狀態。</p>
          <p>您在各個生活領域都${percentage >= 60 ? '表現出一定的適應能力' : '還有很大的發展潛力'}。</p>
          <p>整體答題模式顯示您${pattern.consistency === 'high' ? '有穩定的價值觀和行為模式' : '能夠根據不同情境靈活應對'}。</p>
        `;
    }
  }

  static getBehavioralInsights(pattern: any, category: string): string {
    const insights = [];

    if (pattern.highScoreCount > pattern.totalAnswers * 0.6) {
      insights.push("您通常採取積極主動的態度面對挑戰");
    } else if (pattern.lowScoreCount > pattern.totalAnswers * 0.5) {
      insights.push("您傾向於採取較為謹慎保守的處理方式");
    } else {
      insights.push("您能夠在不同情境中保持平衡的處理方式");
    }

    if (pattern.consistency === 'high') {
      insights.push("您的行為模式較為一致，有明確的價值觀指導");
    } else if (pattern.consistency === 'low') {
      insights.push("您具備良好的適應性，能夠靈活調整應對策略");
    }

    return insights.map(insight => `<p>• ${insight}</p>`).join('');
  }

  static getImprovementSuggestions(percentage: number, category: string): string {
    const suggestions = [];

    if (percentage < 50) {
      suggestions.push("建議尋求專業指導，制定系統性的改善計劃");
      suggestions.push("從基礎技能開始練習，逐步建立信心");
    } else if (percentage < 70) {
      suggestions.push("持續學習相關技能，參加相關課程或工作坊");
      suggestions.push("尋找實踐機會，在實際情境中應用所學");
    } else {
      suggestions.push("保持現有的良好狀態，持續精進");
      suggestions.push("考慮幫助他人，分享您的經驗和智慧");
    }

    // 添加類別特定建議
    switch (category) {
      case 'family':
        suggestions.push("定期進行家庭會議，改善溝通模式");
        break;
      case 'relationship':
        suggestions.push("學習更有效的情感表達技巧");
        break;
      case 'work':
        suggestions.push("培養更好的工作生活平衡能力");
        break;
      case 'personal':
        suggestions.push("建立定期自我反思的習慣");
        break;
    }

    return suggestions.map(suggestion => `<p>• ${suggestion}</p>`).join('');
  }

  static getActionSteps(percentage: number, category: string): string {
    const steps = [];

    if (percentage < 50) {
      steps.push("本週：尋找一個相關的學習資源或專業諮詢");
      steps.push("本月：制定具體的改善目標和行動計劃");
      steps.push("未來三個月：執行計劃並定期檢視進展");
    } else if (percentage < 70) {
      steps.push("本週：識別一個需要改善的具體領域");
      steps.push("本月：實踐新的技巧或策略");
      steps.push("未來三個月：鞏固新習慣並擴展應用範圍");
    } else {
      steps.push("本週：思考如何進一步精進現有能力");
      steps.push("本月：尋找新的挑戰或成長機會");
      steps.push("未來三個月：考慮指導他人或承擔更多責任");
    }

    return steps.map(step => `<p>📅 ${step}</p>`).join('');
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

      // 獲取選擇的測驗類別
      const selectedCategory = localStorage.getItem('selectedCategory') || 'all';
      console.log('保存測驗類別:', selectedCategory);

      // 計算分數和生成結果
      const { totalScore, maxScore, percentage } = this.calculateScore(answers, questions);
      const basicResult = this.generateBasicResult(percentage, selectedCategory, answers, questions);
      const uniqueCode = this.generateUniqueCode();

      // 準備插入數據，將類別資訊儲存在answers中
      const extendedAnswers = {
        ...answers,
        _metadata: {
          category: selectedCategory,
          questionCount: questions.length,
          timestamp: new Date().toISOString()
        }
      };

      const sessionData = {
        user_id: null, // 匿名用戶
        profile_id: profile.id,
        answers: extendedAnswers as any, // 轉換為Json類型
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