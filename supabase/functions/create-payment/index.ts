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
    console.log('創建付費會話請求');
    
    // 解析請求數據
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log('Session ID:', sessionId);

    // 初始化 Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // 創建 Supabase 客戶端 - 使用 SERVICE_ROLE_KEY 來繞過 RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 檢查測驗會話是否存在
    const { data: testSession, error: sessionError } = await supabaseClient
      .from('test_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !testSession) {
      console.error('測驗會話不存在:', sessionError);
      throw new Error("Test session not found");
    }

    if (testSession.is_paid) {
      console.log('此會話已經付費');
      throw new Error("This session is already paid");
    }

    console.log('創建 Stripe 結帳會話');

    // 創建一次性付費會話
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: "price_1S0lZP2Kv0e7EGDyhGKrGsWY", // $5 USD MindTest 價格
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}&test_session_id=${sessionId}&close_tab=true`,
      cancel_url: `${req.headers.get("origin")}/payment-failed?test_session_id=${sessionId}`,
      metadata: {
        test_session_id: sessionId,
      },
    });

    console.log('Stripe 會話創建成功:', session.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      checkout_session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('創建付費會話失敗:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});