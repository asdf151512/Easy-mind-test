import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
    console.log('驗證付費狀態請求');
    
    // 解析請求數據
    const { checkoutSessionId, testSessionId } = await req.json();
    
    if (!checkoutSessionId || !testSessionId) {
      throw new Error("Checkout session ID and test session ID are required");
    }

    console.log('Checkout Session ID:', checkoutSessionId);
    console.log('Test Session ID:', testSessionId);

    // 初始化 Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // 創建 Supabase 客戶端
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // 從 Stripe 獲取結帳會話狀態
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    
    console.log('Stripe 會話狀態:', session.payment_status);

    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    // 檢查測驗會話
    const { data: testSession, error: sessionError } = await supabaseClient
      .from('test_sessions')
      .select('*')
      .eq('id', testSessionId)
      .single();

    if (sessionError || !testSession) {
      console.error('測驗會話不存在:', sessionError);
      throw new Error("Test session not found");
    }

    if (testSession.is_paid) {
      console.log('此會話已經付費，直接返回');
      return new Response(JSON.stringify({ 
        success: true,
        message: "Payment already processed",
        testSession 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 獲取用戶資料以進行個人化報告生成
    const { data: profileData, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', testSession.profile_id)
      .single();

    if (profileError || !profileData) {
      console.error('無法獲取用戶資料:', profileError);
      throw new Error("User profile not found");
    }

    // 獲取測驗類別和計算分數以生成對應報告
    let fullResult = "";
    let category = 'all';
    let percentage = 75; // 預設值

    try {
      // 從答案中提取類別和計算分數
      const answers = testSession.answers as any;
      if (answers && answers._metadata && answers._metadata.category) {
        category = answers._metadata.category;
      }

      // 計算分數百分比
      if (answers) {
        const answerEntries = Object.entries(answers).filter(([key, _]) => !key.startsWith('_'));
        const totalScore = answerEntries.reduce((sum, [_, answer]: [string, any]) => sum + (answer.score || 0), 0);
        const maxScore = answerEntries.length * 3; // 每題最高3分
        percentage = Math.round((totalScore / maxScore) * 100);
      }
    } catch (error) {
      console.error('解析測驗數據時發生錯誤:', error);
      // 使用預設值繼續處理
    }

    console.log('報告生成參數:', { category, percentage, userProfile: { name: profileData.name, age: profileData.age, gender: profileData.gender, occupation: profileData.occupation } });

    // 嘗試使用AI生成個人化報告，如果失敗則使用備用報告
    try {
      console.log('嘗試生成AI個人化報告...');

      // 調用AI報告生成服務
      const aiReportResponse = await supabaseClient.functions.invoke('generate-ai-report', {
        body: {
          testData: { answers: testSession.answers },
          userProfile: profileData,
          category: category,
          percentage: percentage
        }
      });

      if (aiReportResponse.data && aiReportResponse.data.success && aiReportResponse.data.report) {
        console.log('AI報告生成成功');
        fullResult = aiReportResponse.data.report;
      } else {
        console.warn('AI報告生成失敗，使用備用報告:', aiReportResponse.error);
        fullResult = generatePersonalizedCategoryReport(category, percentage, profileData);
      }
    } catch (aiError) {
      console.error('AI報告生成服務錯誤，使用備用報告:', aiError);
      fullResult = generatePersonalizedCategoryReport(category, percentage, profileData);
    }

    // 生成個人化的分類報告
    function generatePersonalizedCategoryReport(category: string, percentage: number, userProfile: any): string {
      const categoryNames: { [key: string]: string } = {
        'family': '家庭',
        'relationship': '感情關係',
        'work': '工作',
        'personal': '個人思維',
        'all': '綜合'
      };

      const categoryName = categoryNames[category] || '綜合';

      // 生成個人化標題和介紹
      const personalIntro = generatePersonalizedIntro(userProfile, categoryName, percentage);

      if (category === 'family') {
        return personalIntro + generatePersonalizedFamilyReport(percentage, userProfile);
      } else if (category === 'relationship') {
        return personalIntro + generatePersonalizedRelationshipReport(percentage, userProfile);
      } else if (category === 'work') {
        return personalIntro + generatePersonalizedWorkReport(percentage, userProfile);
      } else if (category === 'personal') {
        return personalIntro + generatePersonalizedPersonalReport(percentage, userProfile);
      } else {
        return personalIntro + generatePersonalizedComprehensiveReport(percentage, userProfile);
      }
    }

    function generatePersonalizedIntro(userProfile: any, categoryName: string, percentage: number): string {
      const ageGroup = getAgeGroup(userProfile.age);
      const genderTerm = userProfile.gender === 'male' ? '先生' : userProfile.gender === 'female' ? '女士' : '';
      const occupationInsight = getOccupationInsight(userProfile.occupation);

      return `
<div class="personalized-header">
  <h3>親愛的${userProfile.name}${genderTerm}，您的${categoryName}心理分析報告</h3>

  <div class="personal-context">
    <h4>個人背景分析</h4>
    <p>作為一位${userProfile.age}歲的${occupationInsight.description}，您在${categoryName}方面的整體表現達到了<strong>${percentage}%</strong>的水準。${ageGroup.insight}</p>
    <p>${occupationInsight.relevance}</p>
  </div>
</div>
      `;
    }

    function getAgeGroup(age: number): { group: string; insight: string } {
      if (age < 25) {
        return {
          group: '年輕成人',
          insight: '在這個人生階段，您正在建立自己的身份認同和生活方式，這是一個充滿可能性的時期。'
        };
      } else if (age < 35) {
        return {
          group: '青年',
          insight: '您正處於事業和個人關係快速發展的重要階段，平衡各種責任是這個時期的主要挑戰。'
        };
      } else if (age < 45) {
        return {
          group: '中年早期',
          insight: '您可能正在面對職涯高峰期的挑戰，同時也需要處理家庭和個人成長的多重需求。'
        };
      } else if (age < 55) {
        return {
          group: '中年',
          insight: '您擁有豐富的人生經驗，這個階段是重新評估和調整人生方向的重要時期。'
        };
      } else {
        return {
          group: '成熟期',
          insight: '您的人生智慧和經驗是寶貴的資產，這個階段可以更專注於內在成長和人生意義。'
        };
      }
    }

    function getOccupationInsight(occupation: string): { description: string; relevance: string } {
      if (!occupation) {
        return {
          description: '專業人士',
          relevance: '無論從事什麼工作，保持心理健康都是維持工作表現和生活品質的關鍵。'
        };
      }

      const occupation_lower = occupation.toLowerCase();

      if (occupation_lower.includes('教師') || occupation_lower.includes('老師')) {
        return {
          description: '教育工作者',
          relevance: '作為教育工作者，您的心理狀態不僅影響自己，也會影響學生的學習和成長，因此自我關照格外重要。'
        };
      } else if (occupation_lower.includes('醫生') || occupation_lower.includes('護士') || occupation_lower.includes('醫療')) {
        return {
          description: '醫療從業人員',
          relevance: '醫療工作的高壓環境要求您具備良好的心理調適能力，同時關照他人健康的您也需要照顧自己的心理健康。'
        };
      } else if (occupation_lower.includes('工程師') || occupation_lower.includes('程式') || occupation_lower.includes('科技')) {
        return {
          description: '科技專業人士',
          relevance: '科技行業的快節奏和持續變化需要良好的適應能力和壓力管理技巧。'
        };
      } else if (occupation_lower.includes('主管') || occupation_lower.includes('經理') || occupation_lower.includes('管理')) {
        return {
          description: '管理階層人員',
          relevance: '作為管理者，您的心理狀態會影響整個團隊的氛圍和效能，領導力與心理健康密切相關。'
        };
      } else if (occupation_lower.includes('學生')) {
        return {
          description: '學生',
          relevance: '學習階段是建立健康心理模式的重要時期，這些技能將為您未來的人生奠定基礎。'
        };
      } else {
        return {
          description: '專業人士',
          relevance: '在現今快節奏的工作環境中，維持良好的心理狀態是職場成功和個人幸福的重要基石。'
        };
      }
    }

    function generatePersonalizedFamilyReport(percentage: number, userProfile: any): string {
      const baseAnalysis = getAnalysisLevel(percentage);
      const ageGroup = getAgeGroup(userProfile.age);
      const genderSpecificAdvice = getGenderSpecificFamilyAdvice(userProfile.gender, userProfile.age);
      const occupationFamilyInsight = getOccupationFamilyInsight(userProfile.occupation);

      return `
<div class="comprehensive-family-report">
  <h3>親愛的${userProfile.name}，您的家庭關係專業分析報告</h3>

  <div class="executive-summary">
    <h4>🎯 執行摘要</h4>
    <p>作為一位${userProfile.age}歲的${userProfile.gender === 'male' ? '男性' : '女性'}${userProfile.occupation ? `${userProfile.occupation}` : '專業人士'}，您在家庭關係方面的整體表現達到${baseAnalysis.level}（${percentage}%）。這個分數反映了您在家庭溝通、責任分擔、衝突處理等核心領域的綜合能力。</p>
  </div>

  <div class="detailed-analysis">
    <h4>🔍 深度心理分析</h4>

    <h5>家庭依附模式評估</h5>
    <p>基於您的答題模式，您展現出${percentage >= 75 ? '安全型依附' : percentage >= 50 ? '相對穩定的依附模式，但仍有改善空間' : '需要關注的依附模式'}的特徵。${percentage >= 70 ? '您能夠在家庭關係中保持適當的親密度和獨立性，這是健康家庭關係的重要基礎。' : '建議您關注如何在家庭中建立更安全、穩定的情感連結。'}</p>

    <h5>溝通風格深度解析</h5>
    ${percentage >= 70 ?
      `<p>您在家庭溝通方面表現優秀，展現出成熟的溝通技巧。作為${userProfile.age}歲的${userProfile.gender === 'male' ? '男性' : '女性'}，您已經發展出了有效的表達和傾聽能力。${genderSpecificAdvice.communication}</p>
      <p><strong>您的溝通優勢：</strong></p>
      <ul>
        <li>能夠清楚表達自己的需求和感受</li>
        <li>善於傾聽家人的觀點和情緒</li>
        <li>在衝突中能保持理性和同理心</li>
        <li>懂得使用建設性的語言解決問題</li>
      </ul>` :
      `<p>在家庭溝通方面，您還有很大的成長空間。${genderSpecificAdvice.communication}</p>
      <p><strong>需要改善的溝通模式：</strong></p>
      <ul>
        <li>學習更直接、清晰地表達自己的想法</li>
        <li>練習主動傾聽，避免急於回應或辯護</li>
        <li>減少批評性語言，增加支持性表達</li>
        <li>在情緒激動時學會暫停和冷靜</li>
      </ul>`
    }

    <h5>家庭角色與責任分析</h5>
    <p>在${userProfile.age}歲這個人生階段，${getAgeSpecificFamilyInsight(userProfile.age)} 您在家庭中的角色定位${percentage >= 60 ? '相對清晰，能夠承擔相應的責任' : '可能需要重新審視和調整'}。</p>

    <p><strong>年齡階段特殊考量：</strong></p>
    <p>${ageGroup.insight}</p>
  </div>

  <div class="professional-insights">
    <h4>👔 職業與家庭平衡深度分析</h4>
    <p>${occupationFamilyInsight}</p>

    <h5>工作壓力對家庭的影響評估</h5>
    ${userProfile.occupation ? `
    <p>作為${userProfile.occupation}，您面臨的職業特殊挑戰包括：</p>
    <ul>
      <li>時間管理：如何平衡工作時間和家庭時間</li>
      <li>角色轉換：從職業角色回到家庭角色的心理調適</li>
      <li>壓力傳導：避免將工作壓力帶入家庭環境</li>
      <li>期望管理：處理家人對您職業發展的期望</li>
    </ul>
    ` : `
    <p>無論您從事何種職業，工作與家庭的平衡都是現代人面臨的共同挑戰。關鍵在於建立清晰的界限和有效的時間管理策略。</p>
    `}
  </div>

  <div class="gender-analysis">
    <h4>⚖️ 性別心理學視角</h4>
    ${genderSpecificAdvice.suggestions}

    <h5>性別角色期待的影響</h5>
    <p>${userProfile.gender === 'male' ?
      '在傳統文化中，男性往往被期待成為家庭的支柱和決策者。您可以在保持責任感的同時，學習表達情感脆弱性，這有助於建立更深層的家庭連結。' :
      '女性在家庭中往往承擔更多的情感勞動和照護責任。學習設定健康的界限，既照顧家人也照顧自己，是建立持續健康家庭關係的關鍵。'
    }</p>
  </div>

  <div class="improvement-strategies">
    <h4>📈 全面改善策略</h4>

    <h5>認知層面的改變</h5>
    <ul>
      <li><strong>重新框架家庭衝突：</strong>將衝突視為成長和理解的機會，而非威脅</li>
      <li><strong>建立成長思維：</strong>相信家庭關係可以通過努力和學習得到改善</li>
      <li><strong>練習感恩：</strong>每天識別和表達對家人的感激</li>
    </ul>

    <h5>情緒調節技巧</h5>
    <ul>
      <li><strong>情緒識別練習：</strong>學會準確識別和命名自己的情緒</li>
      <li><strong>深呼吸技術：</strong>在緊張時刻使用4-7-8呼吸法</li>
      <li><strong>同理心訓練：</strong>練習從家人的角度理解問題</li>
    </ul>

    <h5>行為改變計劃</h5>
    <ul>
      <li><strong>每日連結時間：</strong>每天至少15分鐘的高質量家庭互動</li>
      <li><strong>定期家庭會議：</strong>每週舉行家庭會議討論重要事項</li>
      <li><strong>共同活動規劃：</strong>每月安排特殊的家庭活動</li>
    </ul>
  </div>

  <div class="action-plan">
    <h4>🎯 個人化行動計劃</h4>

    <h5>第一階段：基礎建設（第1-4週）</h5>
    <ul>
      <li><strong>本週行動：</strong>${getShortTermFamilyGoal(userProfile)}</li>
      <li><strong>每日練習：</strong>主動詢問一位家人今天的感受或想法</li>
      <li><strong>週末任務：</strong>安排一次不被電子設備打擾的家庭時間</li>
      <li><strong>自我觀察：</strong>記錄每天的家庭互動質量和自己的情緒反應</li>
    </ul>

    <h5>第二階段：技能發展（第2-3個月）</h5>
    <ul>
      <li><strong>核心目標：</strong>${getMidTermFamilyGoal(userProfile)}</li>
      <li><strong>溝通技巧訓練：</strong>學習和練習「我」語句表達法</li>
      <li><strong>衝突處理：</strong>建立家庭衝突解決的標準流程</li>
      <li><strong>角色澄清：</strong>與家人討論並明確各自的責任和期望</li>
    </ul>

    <h5>第三階段：深化整合（第4-6個月及以後）</h5>
    <ul>
      <li><strong>長期願景：</strong>${getLongTermFamilyGoal(userProfile)}</li>
      <li><strong>價值觀對話：</strong>與家人討論共同的家庭價值觀和目標</li>
      <li><strong>傳承計劃：</strong>思考如何將正面的家庭模式傳遞給下一代</li>
      <li><strong>持續評估：</strong>每季度進行家庭關係質量的自我評估</li>
    </ul>
  </div>

  <div class="resources">
    <h4>📚 專業資源推薦</h4>

    <h5>推薦書籍（針對您的情況）</h5>
    <ul>
      <li><strong>《非暴力溝通》</strong> - 學習同理心溝通技巧</li>
      <li><strong>《家庭治療概論》</strong> - 了解家庭系統動力學</li>
      <li><strong>《情緒勒索》</strong> - 識別和處理不健康的家庭互動模式</li>
    </ul>

    <h5>實用工具</h5>
    <ul>
      <li><strong>家庭溝通檢查表：</strong>每次重要對話後的自我評估工具</li>
      <li><strong>情緒日記模板：</strong>記錄和分析家庭互動中的情緒模式</li>
      <li><strong>家庭會議議程模板：</strong>結構化的家庭討論指南</li>
    </ul>
  </div>

  <div class="professional-guidance">
    <h4>🔔 專業求助指標</h4>
    <p><strong>考慮尋求專業家庭諮詢的情況：</strong></p>
    <ul>
      <li>家庭衝突持續3個月以上無改善</li>
      <li>出現嚴重的溝通中斷或冷戰</li>
      <li>家庭成員出現明顯的情緒困擾或行為問題</li>
      <li>重大生活變化（如搬家、工作變動、新成員加入）造成適應困難</li>
    </ul>

    <p><strong>個人化專業建議：</strong>考慮到您的年齡、職業和目前的表現水準，建議${getPersonalizedProfessionalAdvice(userProfile, percentage, 'family')}</p>
  </div>

  <div class="conclusion">
    <h4>🌟 結語與鼓勵</h4>
    <p>親愛的${userProfile.name}，家庭關係的建設是一個持續的過程，需要耐心、理解和不斷的努力。您已經邁出了重要的第一步 - 願意了解和改善自己在家庭中的表現。記住，每一個小的改變都可能帶來意想不到的正面影響。</p>

    <p>家庭是我們生命中最重要的支持系統，投資於家庭關係的改善不僅會提升您的生活質量，也會為您的家人創造更加和諧、溫暖的環境。相信您有能力創造一個充滿愛、理解和成長的家庭氛圍。</p>
  </div>
</div>
      `;
    }

    function getGenderSpecificFamilyAdvice(gender: string, age: number): any {
      if (gender === 'male') {
        return {
          communication: age < 35 ?
            '年輕男性往往需要學習更多的情感表達技巧，不要害怕表達脆弱和需要支持的一面。' :
            '成熟男性的溝通優勢在於理性和穩定性，但也要注意增加情感的深度和溫度。',
          suggestions: `
            <ul>
              <li>練習主動分享內心感受，而不只是事實或解決方案</li>
              <li>學習識別和表達各種情緒，擴展情感詞彙</li>
              <li>在家庭決策中多詢問其他成員的意見和感受</li>
              <li>定期安排一對一的深度對話時間</li>
            </ul>
          `
        };
      } else if (gender === 'female') {
        return {
          communication: age < 35 ?
            '年輕女性通常在情感表達方面較為自然，但要注意避免過度承擔他人的情緒責任。' :
            '成熟女性的優勢在於同理心和細膩度，但也要學會為自己的需求發聲。',
          suggestions: `
            <ul>
              <li>學習設定健康的情感界限，不過度承擔家人的情緒</li>
              <li>練習直接表達自己的需求，而非期待他人猜測</li>
              <li>在衝突中保持客觀性，避免過度情緒化</li>
              <li>培養獨立性，維持個人興趣和社交圈</li>
            </ul>
          `
        };
      } else {
        return {
          communication: '有效的家庭溝通需要平衡理性和感性，找到適合您個性的表達方式。',
          suggestions: `
            <ul>
              <li>發展適合您個性的溝通風格</li>
              <li>學習平衡邏輯思考和情感表達</li>
              <li>建立開放包容的家庭氛圍</li>
              <li>尊重每個家庭成員的獨特性</li>
            </ul>
          `
        };
      }
    }

    function getAgeSpecificFamilyInsight(age: number): string {
      if (age < 25) {
        return '您可能正在學習如何在保持獨立性的同時維持與原生家庭的健康關係，或者正在建立自己的新家庭。';
      } else if (age < 35) {
        return '您可能正在平衡伴侶關係和原生家庭關係，或者正在為建立自己的家庭做準備。';
      } else if (age < 45) {
        return '您可能正在處理照顧年邁父母和撫養子女的雙重責任，這是人生中最具挑戰性的階段之一。';
      } else if (age < 55) {
        return '您可能正在重新定義與成年子女的關係，同時面對空巢期的調適。';
      } else {
        return '您可能正在享受更多的家庭時光，並思考如何傳承家庭價值觀給下一代。';
      }
    }

    function getOccupationFamilyInsight(occupation: string): string {
      if (!occupation) return '工作與家庭的平衡是現代人的共同挑戰，找到適合您的平衡點很重要。';

      const occ = occupation.toLowerCase();
      if (occ.includes('醫') || occ.includes('護士')) {
        return '醫療工作的不規律時間和高壓環境可能會影響家庭時間的品質。建議制定明確的家庭時間界限，並在有限的時間內提高相處品質。';
      } else if (occ.includes('教師') || occ.includes('老師')) {
        return '教育工作者往往能夠很好地理解家庭成員的成長需求，但也要注意避免將工作的教育模式完全套用到家庭關係中。';
      } else if (occ.includes('主管') || occ.includes('經理')) {
        return '管理職位的責任可能會延伸到家庭中，要學會在家庭中放下「管理者」角色，成為平等的家庭成員。';
      } else if (occ.includes('業務') || occ.includes('銷售')) {
        return '業務工作的社交性和靈活性可以為家庭關係帶來活力，但也要注意在家庭中保持真實的自我。';
      } else {
        return '您的職業經驗可以為家庭關係帶來獨特的價值，關鍵是如何將職場技能轉化為家庭和諧的助力。';
      }
    }

    function getShortTermFamilyGoal(userProfile: any): string {
      const age = userProfile.age;
      if (age < 30) return '每週安排一次家庭聚餐或活動，增進感情連結';
      else if (age < 45) return '與家人進行一次深度對話，了解彼此近期的想法和感受';
      else return '回顧家庭傳統，規劃一次有意義的家庭聚會';
    }

    function getMidTermFamilyGoal(userProfile: any): string {
      const age = userProfile.age;
      if (age < 30) return '建立健康的家庭溝通模式和界限設定';
      else if (age < 45) return '改善家庭責任分工，建立更平衡的家庭動力';
      else return '創建家庭價值觀文檔，為下一代傳承做準備';
    }

    function getLongTermFamilyGoal(userProfile: any): string {
      const age = userProfile.age;
      if (age < 30) return '建立穩固的家庭基礎和長期關係維護機制';
      else if (age < 45) return '培養下一代的獨立性和家庭責任感';
      else return '成為家庭的智慧長者，提供指導而非控制';
    }

    function getPersonalizedProfessionalAdvice(userProfile: any, percentage: number, category: string): string {
      if (percentage >= 80) {
        return `繼續保持您在${category}方面的優秀表現，並考慮成為他人的榜樣和指導者。`;
      } else if (percentage >= 60) {
        return `尋求相關領域的進階課程或工作坊，將您的良好基礎提升到卓越水準。`;
      } else if (percentage >= 40) {
        return `考慮尋求一對一的專業諮詢，制定個人化的改善計劃。`;
      } else {
        return `強烈建議尋求專業心理諮詢師的協助，他們可以為您提供適合的治療方案。`;
      }
    }

    // 其他類別的詳細個人化報告函數
    function generatePersonalizedRelationshipReport(percentage: number, userProfile: any): string {
      const baseAnalysis = getAnalysisLevel(percentage);
      const ageGroup = getAgeGroup(userProfile.age);

      return `
<div class="comprehensive-relationship-report">
  <h3>親愛的${userProfile.name}，您的感情關係專業分析報告</h3>

  <div class="executive-summary">
    <h4>🎯 執行摘要</h4>
    <p>作為一位${userProfile.age}歲的${userProfile.gender === 'male' ? '男性' : '女性'}${userProfile.occupation ? `${userProfile.occupation}` : '專業人士'}，您在感情關係方面的整體表現達到${baseAnalysis.level}（${percentage}%）。這個分數反映了您在情感表達、親密建立、衝突處理等核心領域的綜合能力。</p>
  </div>

  <div class="attachment-analysis">
    <h4>💕 情感依附模式分析</h4>
    <p>基於您的答題模式，您在感情關係中展現出${percentage >= 75 ? '安全型依附' : percentage >= 50 ? '相對穩定的依附模式' : '需要關注的依附模式'}的特徵。</p>

    <h5>依附風格詳細解析</h5>
    ${percentage >= 70 ? `
    <ul>
      <li><strong>安全依附優勢：</strong>您能夠在關係中保持適當的親密度和獨立性</li>
      <li><strong>情感調節能力：</strong>在關係衝突中能保持理性和情感平衡</li>
      <li><strong>信任建立：</strong>具備建立深度信任關係的能力</li>
      <li><strong>溝通技巧：</strong>能夠有效表達需求並傾聽伴侶</li>
    </ul>
    ` : `
    <ul>
      <li><strong>依附挑戰：</strong>可能在親密和獨立之間存在平衡困難</li>
      <li><strong>情感表達：</strong>需要學習更直接、健康的情感表達方式</li>
      <li><strong>衝突處理：</strong>在關係衝突中可能出現回避或過度反應</li>
      <li><strong>信任議題：</strong>建立和維持信任關係可能需要更多努力</li>
    </ul>
    `}
  </div>

  <div class="age-stage-analysis">
    <h4>🌱 生命階段感情特徵</h4>
    <p><strong>${userProfile.age}歲的感情發展特點：</strong></p>
    <p>${ageGroup.insight}</p>

    ${userProfile.age < 30 ? `
    <h5>青年期感情發展重點</h5>
    <ul>
      <li>建立成熟的親密關係模式</li>
      <li>學習健康的界限設定</li>
      <li>發展長期承諾能力</li>
      <li>平衡個人成長與關係發展</li>
    </ul>
    ` : userProfile.age < 45 ? `
    <h5>成年期感情維護重點</h5>
    <ul>
      <li>維持長期關係的新鮮感</li>
      <li>處理生活壓力對關係的影響</li>
      <li>平衡工作、家庭與伴侶關係</li>
      <li>共同面對人生重大決策</li>
    </ul>
    ` : `
    <h5>成熟期感情深化重點</h5>
    <ul>
      <li>深化情感連結和理解</li>
      <li>重新定義關係中的角色</li>
      <li>處理生活轉變帶來的挑戰</li>
      <li>建立持久的伴侶支持系統</li>
    </ul>
    `}
  </div>

  <div class="communication-analysis">
    <h4>💬 溝通模式深度解析</h4>

    <h5>情感表達能力評估</h5>
    ${percentage >= 65 ? `
    <p>您在情感表達方面表現良好，能夠：</p>
    <ul>
      <li>清楚表達自己的感受和需求</li>
      <li>用適當的方式表達愛意和關心</li>
      <li>在困難對話中保持開放態度</li>
      <li>給予伴侶情感支持和理解</li>
    </ul>
    ` : `
    <p>您在情感表達方面有改善空間，建議：</p>
    <ul>
      <li>練習用"我"語句表達感受</li>
      <li>學習識別和命名複雜情緒</li>
      <li>增加非語言表達的溫暖度</li>
      <li>在表達批評時加入正面元素</li>
    </ul>
    `}

    <h5>衝突解決策略</h5>
    <p>在感情關係中，健康的衝突處理包括：</p>
    <ul>
      <li><strong>冷靜期設定：</strong>情緒激動時先暫停討論</li>
      <li><strong>事實與感受分離：</strong>分別處理客觀事實和主觀感受</li>
      <li><strong>尋找共同點：</strong>識別雙方的共同目標和價值觀</li>
      <li><strong>妥協與讓步：</strong>在非原則問題上展現彈性</li>
    </ul>
  </div>

  <div class="intimacy-development">
    <h4>💖 親密關係建設指南</h4>

    <h5>情感親密度提升</h5>
    <ul>
      <li><strong>深度對話：</strong>每週安排無干擾的深度交流時間</li>
      <li><strong>情感分享：</strong>分享內心的夢想、恐懼和期望</li>
      <li><strong>共同體驗：</strong>創造專屬於你們的回憶和傳統</li>
      <li><strong>相互支持：</strong>在困難時期成為彼此的堡壘</li>
    </ul>

    <h5>身體親密度維護</h5>
    <ul>
      <li><strong>非性接觸：</strong>日常的擁抱、牽手、輕撫</li>
      <li><strong>專注時刻：</strong>放下電子設備的專注相處</li>
      <li><strong>身體語言：</strong>用眼神和姿態表達愛意</li>
      <li><strong>個人空間尊重：</strong>理解和尊重對方的身體界限</li>
    </ul>
  </div>

  <div class="relationship-goals">
    <h4>🎯 個人化關係發展計劃</h4>

    <h5>短期目標（1-3個月）</h5>
    <ul>
      <li>每天至少進行一次有意義的對話</li>
      <li>學習一種新的愛語表達方式</li>
      <li>建立固定的約會時間</li>
      <li>處理一個長期存在的小摩擦</li>
    </ul>

    <h5>中期目標（3-12個月）</h5>
    <ul>
      <li>完善衝突解決機制</li>
      <li>深化情感和身體親密度</li>
      <li>建立共同的未來規劃</li>
      <li>加強與對方親友的關係</li>
    </ul>

    <h5>長期目標（1年以上）</h5>
    <ul>
      <li>建立持久的關係維護系統</li>
      <li>培養共同的興趣和價值觀</li>
      <li>創建家庭文化和傳統</li>
      <li>成為彼此最好的朋友和伴侶</li>
    </ul>
  </div>

  <div class="professional-resources">
    <h4>📚 專業資源推薦</h4>

    <h5>推薦書籍</h5>
    <ul>
      <li><strong>《愛的五種語言》</strong> - 學習表達和接收愛的不同方式</li>
      <li><strong>《依戀理論》</strong> - 理解成人依戀模式對關係的影響</li>
      <li><strong>《非暴力溝通》</strong> - 改善伴侶間的溝通質量</li>
      <li><strong>《親密關係》</strong> - 深入理解親密關係的心理機制</li>
    </ul>

    <h5>實用練習工具</h5>
    <ul>
      <li><strong>情感日記：</strong>記錄每日的情感體驗和關係互動</li>
      <li><strong>感謝練習：</strong>每天向伴侶表達三件感謝的事</li>
      <li><strong>愛語測試：</strong>了解彼此的主要愛語</li>
      <li><strong>關係檢查表：</strong>定期評估關係健康度</li>
    </ul>
  </div>

  <div class="crisis-prevention">
    <h4>🚨 關係危機預防與處理</h4>

    <h5>警示信號</h5>
    <ul>
      <li>溝通頻率和質量明顯下降</li>
      <li>出現持續的冷戰或激烈爭吵</li>
      <li>親密接觸大幅減少</li>
      <li>開始考慮關係以外的選擇</li>
    </ul>

    <h5>專業求助指標</h5>
    <p>考慮尋求伴侶諮詢的情況：</p>
    <ul>
      <li>關係問題持續3個月以上無改善</li>
      <li>出現背叛、欺騙等信任危機</li>
      <li>重大人生決策上無法達成共識</li>
      <li>個人心理問題影響關係品質</li>
    </ul>
  </div>

  <div class="conclusion">
    <h4>💝 結語</h4>
    <p>親愛的${userProfile.name}，感情關係是人生中最珍貴的禮物之一。每一段關係都是獨特的，需要雙方的用心經營和持續投入。記住，健康的關係不是沒有問題，而是能夠一起面對和解決問題。</p>

    <p>您已經展現出了${percentage >= 70 ? '優秀的' : '良好的'}關係管理能力，這是非常值得讚賞的。繼續保持開放和成長的心態，相信您能夠建立或維持一段美滿、深刻的親密關係。</p>

    <p><strong>個人化專業建議：</strong>考慮到您的年齡、性別和目前的表現，建議${getPersonalizedProfessionalAdvice(userProfile, percentage, 'relationship')}</p>
  </div>
</div>
      `;
    }

    function generatePersonalizedWorkReport(percentage: number, userProfile: any): string {
      const baseAnalysis = getAnalysisLevel(percentage);

      return `
<div class="comprehensive-work-report">
  <h3>親愛的${userProfile.name}，您的工作心理專業分析報告</h3>

  <div class="executive-summary">
    <h4>🎯 執行摘要</h4>
    <p>作為一位${userProfile.age}歲的${userProfile.occupation || '專業人士'}，您在工作心理健康方面的整體表現達到${baseAnalysis.level}（${percentage}%）。這個評估涵蓋了您的壓力管理、職場適應、工作動機、團隊合作等多個核心維度。</p>
  </div>

  <div class="stress-management">
    <h4>🧘 壓力管理能力評估</h4>
    ${percentage >= 70 ? `
    <h5>壓力管理優勢</h5>
    <ul>
      <li><strong>良好的壓力識別能力：</strong>能夠及時察覺壓力信號</li>
      <li><strong>有效的應對策略：</strong>擁有多種壓力釋放方法</li>
      <li><strong>情緒穩定性：</strong>在高壓環境中保持冷靜</li>
      <li><strong>恢復能力：</strong>能夠從壓力中快速恢復</li>
    </ul>
    ` : `
    <h5>壓力管理改善建議</h5>
    <ul>
      <li><strong>壓力監測：</strong>建立日常壓力水平的自我監測機制</li>
      <li><strong>放鬆技巧：</strong>學習深呼吸、漸進式肌肉放鬆等技巧</li>
      <li><strong>時間管理：</strong>改善工作規劃和優先級設定</li>
      <li><strong>支援網絡：</strong>建立職場和個人生活的支援系統</li>
    </ul>
    `}

    <h5>針對${userProfile.occupation || '您的職業'}的特殊建議</h5>
    ${getOccupationSpecificStressAdvice(userProfile.occupation)}
  </div>

  <div class="workplace-relationships">
    <h4>🤝 職場人際關係分析</h4>

    <h5>團隊協作能力</h5>
    <p>您在團隊協作方面${percentage >= 60 ? '表現良好，能夠有效與同事合作' : '有改善空間，建議加強團隊合作技巧'}。</p>

    <ul>
      <li><strong>溝通技巧：</strong>${percentage >= 65 ? '能夠清楚表達想法並傾聽他人' : '需要加強職場溝通的專業性和效率'}</li>
      <li><strong>衝突處理：</strong>${percentage >= 70 ? '在職場衝突中能保持專業和理性' : '學習更好的職場衝突解決策略'}</li>
      <li><strong>領導能力：</strong>${percentage >= 75 ? '展現出良好的領導潛質' : '可以培養更多的領導技巧'}</li>
      <li><strong>跨部門協作：</strong>建議加強與其他部門的協作能力</li>
    </ul>
  </div>

  <div class="career-development">
    <h4>📈 職業發展心理準備</h4>

    <h5>基於年齡階段的職業發展重點</h5>
    ${userProfile.age < 30 ? `
    <p><strong>職業探索期建議：</strong></p>
    <ul>
      <li>廣泛嘗試不同類型的工作任務</li>
      <li>積極尋求導師和職業指導</li>
      <li>投資於技能學習和專業發展</li>
      <li>建立職業網絡和人脈關係</li>
    </ul>
    ` : userProfile.age < 45 ? `
    <p><strong>職業發展期建議：</strong></p>
    <ul>
      <li>明確職業發展目標和路徑</li>
      <li>承擔更多責任和挑戰性項目</li>
      <li>培養領導和管理技能</li>
      <li>平衡職業發展與生活品質</li>
    </ul>
    ` : `
    <p><strong>職業成熟期建議：</strong></p>
    <ul>
      <li>發揮經驗優勢，指導年輕同事</li>
      <li>專注於戰略思維和決策能力</li>
      <li>考慮職業轉型或新的挑戰</li>
      <li>準備知識傳承和退休規劃</li>
    </ul>
    `}
  </div>

  <div class="work-life-balance">
    <h4>⚖️ 工作生活平衡策略</h4>

    <h5>當前平衡狀態評估</h5>
    <p>基於您的答題模式，您在工作生活平衡方面${percentage >= 65 ? '維持得較好' : '需要更多關注'}。</p>

    <h5>平衡改善策略</h5>
    <ul>
      <li><strong>邊界設定：</strong>建立明確的工作時間界限</li>
      <li><strong>優先級管理：</strong>區分重要和緊急的任務</li>
      <li><strong>休息品質：</strong>確保充足和高質量的休息時間</li>
      <li><strong>個人興趣：</strong>維持工作以外的興趣愛好</li>
      <li><strong>家庭時間：</strong>保護與家人朋友的相處時間</li>
    </ul>
  </div>

  <div class="motivation-analysis">
    <h4>🔥 工作動機深度分析</h4>

    <h5>內在動機評估</h5>
    <p>您的工作動機主要來源於${percentage >= 70 ? '內在的成就感和自我實現' : '外在的獎勵和認可，建議培養更多內在動機'}。</p>

    <h5>動機維持策略</h5>
    <ul>
      <li><strong>目標設定：</strong>設定具有挑戰性但可達成的目標</li>
      <li><strong>成長機會：</strong>主動尋求學習和發展機會</li>
      <li><strong>意義感培養：</strong>連結工作與個人價值觀</li>
      <li><strong>成就慶祝：</strong>適當慶祝工作成就和里程碑</li>
    </ul>
  </div>

  <div class="action-plan">
    <h4>🎯 工作心理改善行動計劃</h4>

    <h5>短期目標（1-3個月）</h5>
    <ul>
      <li>建立每日壓力監測和放鬆練習</li>
      <li>改善一個具體的職場溝通模式</li>
      <li>設定更清晰的工作生活界限</li>
      <li>識別並開始發展一項核心技能</li>
    </ul>

    <h5>中期目標（3-12個月）</h5>
    <ul>
      <li>完善個人的壓力管理系統</li>
      <li>提升團隊協作和領導能力</li>
      <li>建立穩定的工作生活平衡模式</li>
      <li>制定明確的職業發展計劃</li>
    </ul>

    <h5>長期目標（1年以上）</h5>
    <ul>
      <li>成為職場心理健康的榜樣</li>
      <li>實現職業發展的重要里程碑</li>
      <li>建立可持續的職業成長模式</li>
      <li>在工作中找到深層的意義和滿足</li>
    </ul>
  </div>

  <div class="conclusion">
    <h4>💼 結語</h4>
    <p>親愛的${userProfile.name}，工作是我們生活的重要組成部分，但不應該是生活的全部。健康的工作心理狀態能夠讓您在職場中發揮最佳表現，同時保持整體的生活品質和幸福感。</p>

    <p>記住，職業成功不僅僅是外在的成就，更重要的是內在的成長和滿足感。願您在職業道路上既能實現自己的目標，也能保持身心的健康和平衡。</p>

    <p><strong>個人化專業建議：</strong>${getPersonalizedProfessionalAdvice(userProfile, percentage, 'work')}</p>
  </div>
</div>
      `;
    }

    function getOccupationSpecificStressAdvice(occupation: string): string {
      if (!occupation) return '<p>根據您的職業特點，建議建立適合的壓力管理策略。</p>';

      const occ = occupation.toLowerCase();
      if (occ.includes('醫') || occ.includes('護士')) {
        return '<p>醫療工作者面臨生死壓力，建議：定期進行心理解壓、建立同事支援網絡、學習職業倦怠預防技巧。</p>';
      } else if (occ.includes('教師') || occ.includes('老師')) {
        return '<p>教育工作者需要管理多重關係壓力，建議：設定與學生家長的專業界限、定期自我充電、尋求教學技巧的持續改進。</p>';
      } else if (occ.includes('工程師') || occ.includes('程式')) {
        return '<p>技術工作者面臨快速變化的技術壓力，建議：保持學習熱忱、定期休息眼睛和身體、參與技術社群交流。</p>';
      } else {
        return '<p>根據您的職業特點，建議建立個人化的壓力管理策略，重點關注工作特有的挑戰。</p>';
      }
    }

    function generatePersonalizedPersonalReport(percentage: number, userProfile: any): string {
      const baseAnalysis = getAnalysisLevel(percentage);

      return `
<div class="comprehensive-personal-report">
  <h3>親愛的${userProfile.name}，您的個人思維發展專業分析報告</h3>

  <div class="executive-summary">
    <h4>🎯 執行摘要</h4>
    <p>作為一位${userProfile.age}歲的${userProfile.gender === 'male' ? '男性' : '女性'}，您在個人思維發展方面的整體表現達到${baseAnalysis.level}（${percentage}%）。這個評估涵蓋了您的自我認知、情緒智慧、成長思維、決策能力等核心心理素質。</p>
  </div>

  <div class="self-awareness">
    <h4>🔍 自我認知深度分析</h4>
    ${percentage >= 70 ? `
    <h5>自我認知優勢</h5>
    <ul>
      <li><strong>清晰的自我形象：</strong>對自己的優勢和弱點有準確認知</li>
      <li><strong>價值觀明確：</strong>擁有清晰的人生價值觀和原則</li>
      <li><strong>自我反思能力：</strong>能夠定期檢視和調整自己的行為</li>
      <li><strong>真實性：</strong>能夠在不同環境中保持真實的自我</li>
    </ul>
    ` : `
    <h5>自我認知提升方向</h5>
    <ul>
      <li><strong>自我探索：</strong>通過日記、冥想等方式深入了解自己</li>
      <li><strong>價值觀澄清：</strong>花時間思考什麼對您最重要</li>
      <li><strong>反饋收集：</strong>主動尋求他人對您的客觀反饋</li>
      <li><strong>行為觀察：</strong>注意自己在不同情況下的反應模式</li>
    </ul>
    `}
  </div>

  <div class="emotional-intelligence">
    <h4>💝 情緒智慧評估</h4>

    <h5>情緒管理能力</h5>
    <p>您在情緒管理方面${percentage >= 65 ? '表現良好，能夠有效識別和調節情緒' : '有改善空間，建議加強情緒認知和調節技巧'}。</p>

    <h5>四個核心維度分析</h5>
    <ul>
      <li><strong>情緒察覺：</strong>${percentage >= 70 ? '能夠準確識別自己的情緒狀態' : '需要提高對細微情緒變化的察覺能力'}</li>
      <li><strong>情緒理解：</strong>${percentage >= 65 ? '理解情緒的成因和影響' : '學習分析情緒背後的深層原因'}</li>
      <li><strong>情緒運用：</strong>${percentage >= 60 ? '能夠適當運用情緒促進思考和行動' : '練習將情緒轉化為建設性的行動'}</li>
      <li><strong>情緒調節：</strong>${percentage >= 70 ? '具備良好的情緒自我調節能力' : '學習更多的情緒調節策略和技巧'}</li>
    </ul>
  </div>

  <div class="growth-mindset">
    <h4>🌱 成長思維模式分析</h4>

    <h5>學習態度評估</h5>
    <p>您展現出${percentage >= 75 ? '強烈的成長思維，將挑戰視為學習機會' : percentage >= 50 ? '平衡的思維模式，在某些領域展現成長思維' : '相對固定的思維模式，建議培養更多成長導向的思維'}。</p>

    <h5>成長思維培養策略</h5>
    <ul>
      <li><strong>挑戰接受：</strong>主動尋求並接受具有挑戰性的任務</li>
      <li><strong>失敗重新框架：</strong>將失敗視為學習和成長的機會</li>
      <li><strong>過程專注：</strong>重視努力過程而非僅僅關注結果</li>
      <li><strong>終身學習：</strong>培養持續學習新知識和技能的習慣</li>
    </ul>
  </div>

  <div class="decision-making">
    <h4>🤔 決策能力分析</h4>

    <h5>決策風格評估</h5>
    <p>您的決策風格${percentage >= 70 ? '相對理性和全面，能夠平衡邏輯分析和直覺判斷' : '可能過於依賴某一種決策模式，建議發展更全面的決策技巧'}。</p>

    <h5>決策能力提升方案</h5>
    <ul>
      <li><strong>信息收集：</strong>學習系統性收集和評估相關信息</li>
      <li><strong>選項分析：</strong>培養創造性思考多種可能選項的能力</li>
      <li><strong>風險評估：</strong>發展對不同選擇風險和收益的評估能力</li>
      <li><strong>決策執行：</strong>提高決策後的執行力和堅持度</li>
    </ul>
  </div>

  <div class="life-purpose">
    <h4>🎯 人生目標與意義</h4>

    <h5>人生意義感評估</h5>
    <p>在${userProfile.age}歲這個人生階段，${getUserLifePurposeInsight(userProfile.age, percentage)}</p>

    <h5>目標設定與實現</h5>
    <ul>
      <li><strong>價值對齊：</strong>確保目標與個人核心價值觀一致</li>
      <li><strong>具體化：</strong>將抽象目標轉化為具體可行的行動步驟</li>
      <li><strong>時間管理：</strong>合理安排實現目標的時間規劃</li>
      <li><strong>進度追蹤：</strong>建立定期檢視和調整目標的機制</li>
    </ul>
  </div>

  <div class="resilience-building">
    <h4>💪 心理韌性建設</h4>

    <h5>當前韌性水平</h5>
    <p>您的心理韌性${percentage >= 75 ? '較強，能夠有效應對生活挑戰' : percentage >= 50 ? '中等，在某些方面需要加強' : '需要重點發展，建議系統性提升'}。</p>

    <h5>韌性提升策略</h5>
    <ul>
      <li><strong>認知重構：</strong>學習以更積極的角度解讀困難處境</li>
      <li><strong>支援網絡：</strong>建立和維護強大的社會支援系統</li>
      <li><strong>自我照顧：</strong>發展身心健康的自我照顧習慣</li>
      <li><strong>意義尋找：</strong>在困難中尋找學習和成長的意義</li>
    </ul>
  </div>

  <div class="action-plan">
    <h4>📋 個人發展行動計劃</h4>

    <h5>短期發展重點（1-3個月）</h5>
    <ul>
      <li>建立每日自我反思的習慣</li>
      <li>學習一種新的情緒調節技巧</li>
      <li>設定一個具有挑戰性的學習目標</li>
      <li>開始記錄決策過程和結果</li>
    </ul>

    <h5>中期發展計劃（3-12個月）</h5>
    <ul>
      <li>完善個人價值觀體系</li>
      <li>提升情緒智慧的四個核心能力</li>
      <li>培養更強的心理韌性</li>
      <li>建立系統性的個人成長模式</li>
    </ul>

    <h5>長期成長願景（1年以上）</h5>
    <ul>
      <li>成為情緒穩定、思維清晰的人</li>
      <li>具備持續自我更新的能力</li>
      <li>實現個人價值觀與生活方式的統一</li>
      <li>成為他人學習和成長的榜樣</li>
    </ul>
  </div>

  <div class="conclusion">
    <h4>🌟 結語</h4>
    <p>親愛的${userProfile.name}，個人思維發展是一個終身的旅程。您已經展現出了${percentage >= 70 ? '優秀的' : '良好的'}自我認知和成長潛力。記住，每一次的自我反思和改進都是珍貴的投資，將為您的人生帶來長期的回報。</p>

    <p>保持好奇心，擁抱變化，相信自己的成長能力。您有潛力成為最好版本的自己，並在這個過程中獲得深刻的滿足感和意義感。</p>

    <p><strong>個人化專業建議：</strong>${getPersonalizedProfessionalAdvice(userProfile, percentage, 'personal')}</p>
  </div>
</div>
      `;
    }

    function getUserLifePurposeInsight(age: number, percentage: number): string {
      if (age < 30) {
        return percentage >= 70 ?
          '您在人生目標方面表現出色，對未來有清晰的願景和規劃。這是建立人生基礎的重要時期。' :
          '這是探索人生方向的關鍵時期。建議多嘗試不同的經歷，逐漸明確自己的人生目標和價值觀。';
      } else if (age < 45) {
        return percentage >= 70 ?
          '您對人生意義有較深的理解，能夠在多重責任中保持方向感。這是實現人生目標的黃金時期。' :
          '這是重新評估和調整人生目標的重要階段。平衡各種責任的同時，不要忘記個人成長和自我實現。';
      } else {
        return percentage >= 70 ?
          '您已經建立了深厚的人生智慧，對生命意義有獨特的理解。這是分享智慧和指導他人的時期。' :
          '這是反思人生成就和尋找更深層意義的階段。考慮如何將累積的經驗轉化為對自己和他人的價值。';
      }
    }

    function generatePersonalizedComprehensiveReport(percentage: number, userProfile: any): string {
      const baseAnalysis = getAnalysisLevel(percentage);

      return `
<div class="comprehensive-overall-report">
  <h3>親愛的${userProfile.name}，您的綜合心理健康專業分析報告</h3>

  <div class="executive-summary">
    <h4>🎯 綜合評估概述</h4>
    <p>作為一位${userProfile.age}歲的${userProfile.occupation || '專業人士'}，您的綜合心理健康狀態達到${baseAnalysis.level}（${percentage}%）。這份報告整合了您在家庭、感情、工作和個人發展等多個生活領域的表現，為您提供全面的心理健康圖景。</p>
  </div>

  <div class="multi-domain-analysis">
    <h4>🌐 多領域平衡分析</h4>

    <h5>生活領域整合評估</h5>
    <p>您在不同生活領域的表現${percentage >= 70 ? '相對均衡，展現出良好的適應能力' : '存在一定差異，某些領域可能需要更多關注'}。</p>

    <h5>跨領域能力轉移</h5>
    <ul>
      <li><strong>溝通技巧：</strong>在家庭、工作和社交場合的溝通能力遷移</li>
      <li><strong>壓力管理：</strong>統一的壓力應對策略在各個生活領域的應用</li>
      <li><strong>情緒調節：</strong>情緒管理技巧在不同環境中的一致性表現</li>
      <li><strong>決策能力：</strong>理性決策能力在各種人生選擇中的體現</li>
    </ul>
  </div>

  <div class="life-stage-integration">
    <h4>🎭 人生階段整合分析</h4>

    <h5>當前人生階段特徵</h5>
    <p>在${userProfile.age}歲這個人生階段，您面臨的主要心理發展任務包括：</p>
    ${getLifeStageTaskAnalysis(userProfile.age)}

    <h5>跨階段連續性</h5>
    <p>您的心理發展${percentage >= 70 ? '展現出良好的連續性和適應性' : '在某些方面可能需要加強階段性調適'}。建議關注如何將過去的經驗轉化為當前和未來的心理資源。</p>
  </div>

  <div class="holistic-wellbeing">
    <h4>🌈 整體幸福感評估</h4>

    <h5>幸福感構成要素</h5>
    <ul>
      <li><strong>情感幸福：</strong>正面情緒體驗和情緒調節能力</li>
      <li><strong>認知幸福：</strong>對生活的滿意度和意義感</li>
      <li><strong>社會幸福：</strong>人際關係質量和社會支持</li>
      <li><strong>身體幸福：</strong>身心健康狀態和活力水平</li>
    </ul>

    <h5>幸福感提升策略</h5>
    <ul>
      <li><strong>正念練習：</strong>培養當下專注和覺察能力</li>
      <li><strong>感恩習慣：</strong>建立日常感恩和欣賞的心態</li>
      <li><strong>社會連結：</strong>深化有意義的人際關係</li>
      <li><strong>個人成長：</strong>持續學習和自我提升</li>
    </ul>
  </div>

  <div class="resilience-system">
    <h4>🛡️ 心理韌性系統</h4>

    <h5>韌性資源盤點</h5>
    <p>您的心理韌性系統包括：</p>
    <ul>
      <li><strong>內在資源：</strong>${percentage >= 70 ? '良好的自我認知和情緒調節能力' : '需要加強的自我認知和情緒管理技巧'}</li>
      <li><strong>外在支持：</strong>家庭、朋友和職場的支持網絡</li>
      <li><strong>應對策略：</strong>面對挑戰時的具體應對方法</li>
      <li><strong>意義系統：</strong>個人價值觀和人生意義的指導作用</li>
    </ul>
  </div>

  <div class="personalized-recommendations">
    <h4>🎯 個人化綜合建議</h4>

    <h5>基於您的年齡和職業背景的建議</h5>
    ${getAgeOccupationSpecificAdvice(userProfile.age, userProfile.occupation)}

    <h5>優先發展領域</h5>
    ${percentage >= 80 ? `
    <p>您已經展現出很高的心理健康水平，建議：</p>
    <ul>
      <li>保持當前的良好狀態</li>
      <li>考慮成為他人的心理健康榜樣</li>
      <li>探索更深層的自我實現</li>
      <li>分享您的經驗和智慧</li>
    </ul>
    ` : percentage >= 60 ? `
    <p>您具有良好的心理健康基礎，建議重點關注：</p>
    <ul>
      <li>識別並加強相對薄弱的領域</li>
      <li>建立更系統的自我提升計劃</li>
      <li>尋求專業發展的新機會</li>
      <li>深化重要的人際關係</li>
    </ul>
    ` : `
    <p>建議您優先關注以下發展重點：</p>
    <ul>
      <li>建立基本的情緒調節技巧</li>
      <li>改善最重要的人際關係</li>
      <li>尋求適當的專業支持</li>
      <li>制定系統的心理健康計劃</li>
    </ul>
    `}
  </div>

  <div class="long-term-vision">
    <h4>🔮 長期心理健康願景</h4>

    <h5>5年發展願景</h5>
    <p>基於您當前的狀態和潛力，5年後的您可能：</p>
    <ul>
      <li>在心理成熟度上達到新的高度</li>
      <li>建立更深刻和穩定的人際關係</li>
      <li>在職業和個人生活中找到更好的平衡</li>
      <li>發展出獨特的個人智慧和洞察力</li>
    </ul>

    <h5>持續成長機制</h5>
    <ul>
      <li><strong>定期自我評估：</strong>每季度進行綜合心理健康檢視</li>
      <li><strong>學習計劃：</strong>持續投資於心理健康相關的學習</li>
      <li><strong>支持網絡：</strong>維護和擴展心理健康支持系統</li>
      <li><strong>專業資源：</strong>適時尋求專業指導和支持</li>
    </ul>
  </div>

  <div class="conclusion">
    <h4>🌟 總結與展望</h4>
    <p>親愛的${userProfile.name}，這份綜合分析展現了您在心理健康各個領域的現狀和潛力。每個人的心理健康旅程都是獨特的，重要的是保持成長的心態，持續投資於自己的心理福祉。</p>

    <p>您已經展現出了${percentage >= 70 ? '優秀的' : '良好的'}心理素質和適應能力。記住，心理健康不是一個終點，而是一個持續的過程。每一次的自我覺察、每一個小的改進，都是對更美好生活的投資。</p>

    <p>願您在人生的旅程中保持好奇、勇敢和慈悲，不僅對自己，也對身邊的每一個人。您有能力創造一個充滿意義、連結和成長的人生。</p>

    <p><strong>最終專業建議：</strong>${getPersonalizedProfessionalAdvice(userProfile, percentage, 'comprehensive')}</p>
  </div>
</div>
      `;
    }

    function getLifeStageTaskAnalysis(age: number): string {
      if (age < 25) {
        return `
        <ul>
          <li>建立獨立的成人身份</li>
          <li>探索職業方向和人生目標</li>
          <li>發展成熟的人際關係技巧</li>
          <li>建立個人價值觀體系</li>
        </ul>`;
      } else if (age < 35) {
        return `
        <ul>
          <li>在職業和感情關係中建立穩定性</li>
          <li>平衡個人發展與關係承諾</li>
          <li>處理成人責任和壓力</li>
          <li>為未來的人生階段做準備</li>
        </ul>`;
      } else if (age < 45) {
        return `
        <ul>
          <li>在多重角色中保持平衡</li>
          <li>處理中年期的身份重新定義</li>
          <li>照顧家庭同時追求個人成就</li>
          <li>準備人生下半場的規劃</li>
        </ul>`;
      } else {
        return `
        <ul>
          <li>整合人生經驗和智慧</li>
          <li>重新定義成功和意義</li>
          <li>處理生命有限性的覺察</li>
          <li>準備知識和價值觀的傳承</li>
        </ul>`;
      }
    }

    function getAgeOccupationSpecificAdvice(age: number, occupation: string): string {
      const ageAdvice = age < 30 ? '在這個探索期，重點是建立穩固的心理基礎' :
                       age < 45 ? '在這個發展期，關鍵是平衡多重責任' :
                       '在這個成熟期，重點是整合經驗並尋求更深層的意義';

      const occAdvice = occupation ?
        `作為${occupation}，您的職業特點為心理發展帶來了獨特的機遇和挑戰` :
        '無論您從事何種職業，工作都是影響心理健康的重要因素';

      return `<p>${ageAdvice}。${occAdvice}。建議將職業發展與個人心理成長相結合，創造協同效應。</p>`;
    }

    function generateRelationshipReport(percentage: number): string {
      const baseAnalysis = getAnalysisLevel(percentage);
      return `
<h3>感情關係詳細分析報告</h3>

<h4>感情能力整體評估</h4>
<p>您在感情關係方面的整體表現為${baseAnalysis.level}。${baseAnalysis.description}</p>

<h4>情感表達與溝通</h4>
${percentage >= 70 ?
  '<p>您在感情表達方面表現出色，能夠真誠地向伴侶表達自己的感受和需求。您具備良好的情感智慧，能夠理解並回應伴侶的情感狀態。</p>' :
  '<p>在情感表達方面，您可能需要更多練習。建議學習如何清晰地表達內心感受，避免假設對方能夠讀懂您的心思。定期與伴侶進行深度對話，分享彼此的想法和感受。</p>'
}

<h4>親密關係建立</h4>
${percentage >= 60 ?
  '<p>您具備建立深度親密關係的能力，能夠在維持個人獨立性的同時與伴侶建立親密連結。您理解親密關係需要時間和努力來培養。</p>' :
  '<p>建立親密關係可能對您來說是個挑戰。記住，真正的親密來自於脆弱性的分享和相互接納。嘗試逐步開放自己，與伴侶分享更深層的想法和感受。</p>'
}

<h4>信任與忠誠</h4>
<p>信任是感情關係的基石。建議：</p>
<ul>
<li>保持開放和誠實的溝通</li>
<li>遵守對伴侶的承諾</li>
<li>在困難時期給予彼此支持</li>
<li>尊重伴侶的個人空間和隱私</li>
</ul>

<p><strong>專業建議：</strong>如果感情關係出現嚴重問題，建議尋求伴侶諮詢服務。專業的關係治療師能夠幫助您們改善溝通模式並重建親密連結。</p>
      `;
    }

    function generateWorkReport(percentage: number): string {
      const baseAnalysis = getAnalysisLevel(percentage);
      return `
<h3>工作心理詳細分析報告</h3>

<h4>工作心理狀態評估</h4>
<p>您在工作相關心理狀態方面的整體表現為${baseAnalysis.level}。${baseAnalysis.description}</p>

<h4>工作壓力管理</h4>
${percentage >= 70 ?
  '<p>您具備優秀的工作壓力管理能力，能夠在高壓環境中保持冷靜和效率。您懂得如何平衡工作要求和個人能力，適當地設定界限。</p>' :
  '<p>工作壓力管理是您需要加強的領域。建議學習壓力識別技巧，建立有效的壓力釋放方式，如定期休息、運動或冥想。</p>'
}

<h4>職場人際關係</h4>
${percentage >= 60 ?
  '<p>您在職場人際關係方面表現良好，能夠與同事建立正面的工作關係。您具備團隊合作精神，同時也能保持專業界限。</p>' :
  '<p>改善職場人際關係可能有助於您的工作表現和職業發展。建議主動與同事交流，參與團隊活動，學習有效的職場溝通技巧。</p>'
}

<h4>工作生活平衡</h4>
<p>健康的工作生活平衡對於長期職業發展至關重要：</p>
<ul>
<li>設定明確的工作時間界限</li>
<li>培養工作以外的興趣和社交活動</li>
<li>定期評估工作負荷，適時調整</li>
<li>重視家庭時間和個人健康</li>
</ul>

<p><strong>專業建議：</strong>如果工作壓力嚴重影響您的身心健康，建議尋求職業諮詢或心理健康專業服務。</p>
      `;
    }

    function generatePersonalReport(percentage: number): string {
      const baseAnalysis = getAnalysisLevel(percentage);
      return `
<h3>個人思維模式詳細分析報告</h3>

<h4>思維模式整體評估</h4>
<p>您在個人思維發展方面的整體表現為${baseAnalysis.level}。${baseAnalysis.description}</p>

<h4>自我認知能力</h4>
${percentage >= 70 ?
  '<p>您具備優秀的自我認知能力，能夠清楚了解自己的優勢、弱點、價值觀和動機。這種自我覺察是個人成長和良好決策的基礎。</p>' :
  '<p>提高自我認知能力將有助於您的個人發展。建議定期進行自我反思，記錄思考和感受，尋求他人的回饋。</p>'
}

<h4>情緒智慧與管理</h4>
${percentage >= 65 ?
  '<p>您在情緒管理方面表現良好，能夠識別、理解和有效調節自己的情緒。您也具備同理心，能夠理解他人的情緒狀態。</p>' :
  '<p>發展情緒智慧對於個人和人際關係都非常重要。建議學習情緒識別技巧，練習情緒調節方法，如深呼吸、正念冥想。</p>'
}

<h4>學習與成長思維</h4>
<p>培養成長思維對於終身發展至關重要：</p>
<ul>
<li>將挑戰視為學習機會而非威脅</li>
<li>從失敗中汲取教訓，不斷改進</li>
<li>保持好奇心和開放態度</li>
<li>主動尋求新的學習經驗</li>
</ul>

<p><strong>專業建議：</strong>個人思維發展是終身的課程。如果您希望更深入地探索自我，建議考慮心理諮詢或參與個人成長課程。</p>
      `;
    }

    function generateComprehensiveReport(percentage: number): string {
      const baseAnalysis = getAnalysisLevel(percentage);
      return `
<h3>綜合心理狀態詳細分析報告</h3>

<h4>整體心理健康評估</h4>
<p>您的綜合心理狀態表現為${baseAnalysis.level}。${baseAnalysis.description}這份評估涵蓋了您在家庭、感情、工作和個人思維等多個生活領域的表現。</p>

<h4>生活領域平衡分析</h4>
${percentage >= 70 ?
  '<p>您在各個生活領域都展現出良好的平衡和適應能力。您能夠有效地協調不同生活角色的需求，保持整體的心理健康和生活滿意度。</p>' :
  '<p>生活各領域的平衡是心理健康的重要指標。建議檢視您在家庭、工作、人際關係和個人發展方面的投入，尋找可能失衡的地方並進行調整。</p>'
}

<h4>壓力管理與適應能力</h4>
${percentage >= 65 ?
  '<p>您具備良好的壓力管理和適應能力，能夠在面對生活挑戰時保持穩定的心理狀態。您懂得如何尋求資源和支持來應對困難。</p>' :
  '<p>提高壓力管理能力對於整體心理健康至關重要。建議學習多種壓力釋放技巧，建立支持網絡，培養解決問題的技能。</p>'
}

<h4>個人成長與發展潛力</h4>
<p>持續的個人成長是心理健康的重要組成部分：</p>
<ul>
<li>設定個人發展目標，涵蓋各個生活領域</li>
<li>培養終身學習的態度和習慣</li>
<li>尋求新的挑戰和成長機會</li>
<li>建立自我反思和評估的習慣</li>
</ul>

<p><strong>專業建議：</strong>這份綜合評估為您提供了全面的心理狀態概覽。如果您希望在特定領域獲得更深入的指導，建議尋求相關專業服務。</p>
      `;
    }

    function getAnalysisLevel(percentage: number): { level: string; description: string } {
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

    // 生成新的獨特代碼
    const newUniqueCode = `PSY-PAID-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    console.log('更新測驗會話為已付費狀態');

    // 更新數據庫記錄
    const { data: updatedSession, error: updateError } = await supabaseClient
      .from('test_sessions')
      .update({
        is_paid: true,
        full_result: fullResult,
        unique_code: newUniqueCode,
        payment_session_id: checkoutSessionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', testSessionId)
      .select()
      .single();

    if (updateError) {
      console.error('更新測驗會話失敗:', updateError);
      throw new Error("Failed to update test session");
    }

    console.log('付費驗證成功，會話已更新');

    return new Response(JSON.stringify({ 
      success: true,
      message: "Payment verified and report unlocked",
      testSession: updatedSession 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('驗證付費失敗:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});