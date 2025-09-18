import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('生成AI個人化報告請求');

    const { testData, userProfile, category, percentage } = await req.json();

    if (!testData || !userProfile || !category) {
      throw new Error("Missing required parameters");
    }

    console.log('報告生成參數:', {
      category,
      percentage,
      userName: userProfile.name,
      userAge: userProfile.age,
      userGender: userProfile.gender,
      userOccupation: userProfile.occupation
    });

    // 構建給Claude的提示詞
    const prompt = buildClaudePrompt(testData, userProfile, category, percentage);

    // 調用Claude API
    const claudeApiKey = Deno.env.get("CLAUDE_API_KEY");
    if (!claudeApiKey) {
      throw new Error("Claude API key not configured");
    }

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": claudeApiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 8000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API錯誤:', errorText);
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const generatedReport = claudeData.content[0].text;

    console.log('AI報告生成成功');

    return new Response(JSON.stringify({
      success: true,
      report: generatedReport
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('生成AI報告失敗:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function buildClaudePrompt(testData: any, userProfile: any, category: string, percentage: number): string {
  const categoryNames: { [key: string]: string } = {
    'family': '家庭關係',
    'relationship': '感情關係',
    'work': '工作心理',
    'personal': '個人思維',
    'all': '綜合心理'
  };

  const categoryName = categoryNames[category] || '綜合心理';

  // 分析答題模式
  const answerPattern = analyzeAnswerPattern(testData.answers);

  // 獲取詳細的人口統計學洞察
  const demographicInsights = getDemographicInsights(userProfile);

  return `
你是一位資深的臨床心理學家，具有15年以上的專業經驗，專精於${categoryName}領域的心理評估和治療。請為以下用戶生成一份專業級的深度個人化心理分析報告。

用戶詳細資料：
- 姓名：${userProfile.name}
- 年齡：${userProfile.age}歲
- 性別：${userProfile.gender === 'male' ? '男性' : userProfile.gender === 'female' ? '女性' : '其他'}
- 職業：${userProfile.occupation || '未提供'}
- 人口統計學背景：${demographicInsights}

測驗詳細結果：
- 評估類別：${categoryName}專業評估
- 綜合得分：${percentage}%（百分位數解釋：此分數表示您在同年齡段${userProfile.gender === 'male' ? '男性' : '女性'}中的相對位置）
- 深度答題模式分析：
  - 積極應對模式（高分3分）：${answerPattern.highScoreCount}題 (${Math.round(answerPattern.highScoreCount/answerPattern.totalAnswers*100)}%)
  - 適度應對模式（中分2分）：${answerPattern.mediumScoreCount}題 (${Math.round(answerPattern.mediumScoreCount/answerPattern.totalAnswers*100)}%)
  - 消極應對模式（低分1分）：${answerPattern.lowScoreCount}題 (${Math.round(answerPattern.lowScoreCount/answerPattern.totalAnswers*100)}%)
  - 心理一致性指數：${answerPattern.consistency}
  - 總測驗完成度：${answerPattern.totalAnswers}題

請生成一份包含以下詳細章節的專業心理評估報告（目標字數：4000-5000字）：

## 第一部分：專業評估概述
1. **個人化專業問候**：以溫暖專業的語調稱呼用戶，建立信任關係
2. **評估方法說明**：解釋本次評估的科學依據和專業標準
3. **總體評估結論**：基於分數和模式的專業判斷

## 第二部分：深度心理分析
4. **核心心理特質分析**：
   - 基於答題模式的深層心理結構分析
   - 認知模式、情感模式、行為模式的三維分析
   - 潛意識傾向和自我防衛機制識別

5. **人格特質評估**：
   - 結合大五人格理論的分析
   - ${categoryName}領域的特殊人格表現
   - 人格優勢和發展盲點

## 第三部分：生命階段專業分析
6. **發展心理學視角**：
   - ${userProfile.age}歲的心理發展特徵
   - 當前生命階段的核心發展任務
   - 年齡相關的心理挑戰和機遇

7. **性別心理學分析**：
   - ${userProfile.gender === 'male' ? '男性' : '女性'}在${categoryName}方面的特殊心理模式
   - 社會性別角色對心理狀態的影響
   - 性別優勢的發揮和劣勢的補強

## 第四部分：職業心理學整合
8. **職業人格匹配度分析**：
   - 當前職業與心理特質的契合度
   - 職業壓力源識別和管理策略
   - 職業發展的心理建議

## 第五部分：專業干預建議
9. **心理技能提升方案**：
   - 認知重構技術的具體應用
   - 情緒調節策略的訓練方法
   - 行為改變的階段性計劃

10. **關係模式優化**：
    - 人際互動模式的改善
    - 溝通技巧的專業訓練建議
    - 衝突解決能力的提升

## 第六部分：個人化治療計劃
11. **短期干預目標（1-3個月）**：
    - 具體可測量的行為目標
    - 每週具體練習任務
    - 進度評估標準

12. **中期發展計劃（3-12個月）**：
    - 心理技能建設里程碑
    - 生活模式調整方案
    - 支持系統建立計劃

13. **長期成長願景（1-3年）**：
    - 心理成熟度發展目標
    - 人生價值觀整合
    - 持續成長機制建立

## 第七部分：專業資源推薦
14. **個人化書籍推薦**：針對您的具體情況推薦3-5本專業書籍
15. **練習工具推薦**：具體的心理訓練APP、冥想技巧、日記模板等
16. **專業求助指南**：何時需要尋求進一步專業協助的明確指標

## 第八部分：持續評估計劃
17. **自我監測方法**：日常心理狀態的自我評估工具
18. **定期復評建議**：建議的復評時間和方式
19. **危機預警系統**：識別心理危機的早期信號

撰寫要求：
- 使用專業心理學術語，但確保普通用戶能理解
- 每個建議都要具體、可操作、有科學依據
- 融入中華文化智慧和現代心理學理論
- 語調既專業權威又溫暖同理
- 使用豐富的HTML格式，包含標題、列表、強調等
- 確保內容的原創性和針對性
- 避免過於學術化，注重實用性

請開始生成這份專業級的深度心理分析報告：
`;
}

function getDemographicInsights(userProfile: any): string {
  const age = userProfile.age;
  const gender = userProfile.gender;
  const occupation = userProfile.occupation || '未提供';

  let insights = [];

  // 年齡組分析
  if (age < 25) {
    insights.push('處於成年早期的身份探索階段');
  } else if (age < 35) {
    insights.push('正值青年發展期，面臨多重人生選擇');
  } else if (age < 45) {
    insights.push('中年初期，平衡多重角色責任');
  } else if (age < 55) {
    insights.push('中年成熟期，重新評估人生方向');
  } else {
    insights.push('成熟期，追求內在成長與智慧傳承');
  }

  // 性別特徵
  if (gender === 'male') {
    insights.push('男性特有的社會期待和心理模式');
  } else if (gender === 'female') {
    insights.push('女性在社會角色中的獨特心理體驗');
  }

  // 職業背景
  if (occupation !== '未提供') {
    insights.push(`${occupation}職業背景帶來的特殊心理環境`);
  }

  return insights.join('、');
}

function analyzeAnswerPattern(answers: any): any {
  if (!answers) {
    return {
      highScoreCount: 0,
      mediumScoreCount: 0,
      lowScoreCount: 0,
      consistency: 'unknown',
      totalAnswers: 0
    };
  }

  const answerEntries = Object.entries(answers).filter(([key, _]) => !key.startsWith('_'));
  const scores = answerEntries.map(([_, answer]: [string, any]) => answer.score);

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