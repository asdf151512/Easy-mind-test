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

    // 生成完整的心理分析報告
    const fullResult = `
<h3>詳細心理特質分析</h3>

<h4>情緒穩定性分析</h4>
<p>根據您的測驗結果，您在情緒管理方面展現出良好的自控能力。您能夠在面對壓力時保持相對冷靜，並且具備一定的情緒調節技巧。建議您繼續保持這種積極的態度，並在必要時尋求適當的放鬆方式。</p>

<h4>社交能力評估</h4>
<p>您在人際互動方面表現出適度的社交技巧。您能夠在團體中找到自己的位置，既不會過分依賴他人，也不會完全孤立自己。建議您可以嘗試擴展社交圈，接觸不同背景的人群，這將有助於您的個人成長。</p>

<h4>壓力應對策略</h4>
<p>您在面對挑戰時傾向於採用解決問題的方式，這是一個非常積極的特質。您不會輕易被困難擊倒，而是會尋找切實可行的解決方案。建議您學習更多的壓力管理技巧，如深呼吸、冥想或規律運動。</p>

<h4>未來發展建議</h4>
<p>基於您的測驗結果，我們建議您：</p>
<ul>
<li>持續培養自我反思的習慣，定期檢視自己的情緒狀態</li>
<li>建立穩定的日常作息，確保充足的睡眠和休息</li>
<li>培養至少一項有益身心的興趣愛好</li>
<li>學習時間管理技巧，平衡工作與生活</li>
<li>在感到壓力過大時，不要猶豫尋求專業協助</li>
</ul>

<h4>長期心理健康維護</h4>
<p>心理健康是一個持續的過程，需要長期的關注和維護。建議您每3-6個月進行一次自我評估，觀察自己的心理狀態變化。同時，保持開放的心態，願意學習新的心理調適技巧。</p>

<p><strong>免責聲明：</strong>此報告僅供參考，不能替代專業心理諮詢。如您感到嚴重的心理困擾，請及時尋求專業心理健康服務。</p>
    `;

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