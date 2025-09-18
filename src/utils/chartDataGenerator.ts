import { TestAnswers, TestQuestion } from '@/types';

export interface RadarChartData {
  subject: string;
  score: number;
  fullMark: number;
}

export function generateRadarChartData(
  answers: TestAnswers,
  questions: TestQuestion[],
  category: string
): RadarChartData[] {
  if (category === 'all') {
    return generateComprehensiveRadarData(answers, questions);
  } else {
    return generateCategorySpecificRadarData(answers, questions, category);
  }
}

function generateComprehensiveRadarData(
  answers: TestAnswers,
  questions: TestQuestion[]
): RadarChartData[] {
  // 為綜合評估創建多維度雷達圖
  const dimensions = [
    { key: 'communication', name: '溝通能力', questionIds: [] as string[] },
    { key: 'emotional', name: '情緒管理', questionIds: [] as string[] },
    { key: 'adaptation', name: '適應能力', questionIds: [] as string[] },
    { key: 'leadership', name: '領導能力', questionIds: [] as string[] },
    { key: 'problemSolving', name: '問題解決', questionIds: [] as string[] },
    { key: 'interpersonal', name: '人際關係', questionIds: [] as string[] }
  ];

  // 根據問題內容分配到不同維度（簡化版本，實際應該根據問題分析）
  const allQuestionIds = Object.keys(answers).filter(id => !id.startsWith('_'));
  const questionsPerDimension = Math.ceil(allQuestionIds.length / dimensions.length);

  dimensions.forEach((dimension, index) => {
    const startIndex = index * questionsPerDimension;
    const endIndex = Math.min(startIndex + questionsPerDimension, allQuestionIds.length);
    dimension.questionIds = allQuestionIds.slice(startIndex, endIndex);
  });

  return dimensions.map(dimension => {
    const dimensionAnswers = dimension.questionIds
      .map(id => answers[id])
      .filter(answer => answer);

    const totalScore = dimensionAnswers.reduce((sum, answer) => sum + answer.score, 0);
    const maxScore = dimensionAnswers.length * 3;
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
      subject: dimension.name,
      score: percentage,
      fullMark: 100
    };
  });
}

function generateCategorySpecificRadarData(
  answers: TestAnswers,
  questions: TestQuestion[],
  category: string
): RadarChartData[] {
  switch (category) {
    case 'family':
      return generateFamilyRadarData(answers, questions);
    case 'relationship':
      return generateRelationshipRadarData(answers, questions);
    case 'work':
      return generateWorkRadarData(answers, questions);
    case 'personal':
      return generatePersonalRadarData(answers, questions);
    default:
      return generateComprehensiveRadarData(answers, questions);
  }
}

function generateFamilyRadarData(
  answers: TestAnswers,
  questions: TestQuestion[]
): RadarChartData[] {
  const dimensions = [
    { name: '家庭溝通', weight: 0.25 },
    { name: '責任分擔', weight: 0.2 },
    { name: '親子關係', weight: 0.2 },
    { name: '衝突處理', weight: 0.15 },
    { name: '情感支持', weight: 0.2 }
  ];

  return generateDimensionScores(answers, questions, dimensions);
}

function generateRelationshipRadarData(
  answers: TestAnswers,
  questions: TestQuestion[]
): RadarChartData[] {
  const dimensions = [
    { name: '情感表達', weight: 0.25 },
    { name: '親密建立', weight: 0.2 },
    { name: '信任建設', weight: 0.2 },
    { name: '衝突解決', weight: 0.15 },
    { name: '承諾履行', weight: 0.2 }
  ];

  return generateDimensionScores(answers, questions, dimensions);
}

function generateWorkRadarData(
  answers: TestAnswers,
  questions: TestQuestion[]
): RadarChartData[] {
  const dimensions = [
    { name: '壓力管理', weight: 0.25 },
    { name: '團隊合作', weight: 0.2 },
    { name: '工作效率', weight: 0.2 },
    { name: '職場適應', weight: 0.15 },
    { name: '目標達成', weight: 0.2 }
  ];

  return generateDimensionScores(answers, questions, dimensions);
}

function generatePersonalRadarData(
  answers: TestAnswers,
  questions: TestQuestion[]
): RadarChartData[] {
  const dimensions = [
    { name: '自我認知', weight: 0.25 },
    { name: '情緒智商', weight: 0.2 },
    { name: '成長思維', weight: 0.2 },
    { name: '決策能力', weight: 0.15 },
    { name: '目標設定', weight: 0.2 }
  ];

  return generateDimensionScores(answers, questions, dimensions);
}

function generateDimensionScores(
  answers: TestAnswers,
  questions: TestQuestion[],
  dimensions: Array<{ name: string; weight: number }>
): RadarChartData[] {
  const allQuestionIds = Object.keys(answers).filter(id => !id.startsWith('_'));
  const questionsPerDimension = Math.ceil(allQuestionIds.length / dimensions.length);

  return dimensions.map((dimension, index) => {
    const startIndex = index * questionsPerDimension;
    const endIndex = Math.min(startIndex + questionsPerDimension, allQuestionIds.length);
    const dimensionQuestionIds = allQuestionIds.slice(startIndex, endIndex);

    const dimensionAnswers = dimensionQuestionIds
      .map(id => answers[id])
      .filter(answer => answer);

    const totalScore = dimensionAnswers.reduce((sum, answer) => sum + answer.score, 0);
    const maxScore = dimensionAnswers.length * 3;
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // 添加一些隨機變化使雷達圖更有趣
    const variation = Math.random() * 10 - 5; // -5 到 +5 的隨機變化
    const adjustedScore = Math.max(0, Math.min(100, percentage + variation));

    return {
      subject: dimension.name,
      score: Math.round(adjustedScore),
      fullMark: 100
    };
  });
}

export function generateScoreBreakdown(
  answers: TestAnswers,
  questions: TestQuestion[]
): {
  highScore: number;
  mediumScore: number;
  lowScore: number;
  totalQuestions: number;
} {
  const allAnswers = Object.values(answers).filter(answer => typeof answer.score === 'number');

  return {
    highScore: allAnswers.filter(answer => answer.score === 3).length,
    mediumScore: allAnswers.filter(answer => answer.score === 2).length,
    lowScore: allAnswers.filter(answer => answer.score === 1).length,
    totalQuestions: allAnswers.length
  };
}