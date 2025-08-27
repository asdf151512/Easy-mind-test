import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        const sessionId = localStorage.getItem('paymentSessionId');
        if (!sessionId) {
          navigate('/');
          return;
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

        // 更新數據庫記錄
        const { error } = await supabase
          .from('test_sessions')
          .update({
            is_paid: true,
            full_result: fullResult,
            unique_code: newUniqueCode,
            payment_session_id: `stripe_success_${Date.now()}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);

        if (error) throw error;

        // 更新本地存儲
        const currentResult = JSON.parse(localStorage.getItem('testResult') || '{}');
        const updatedResult = {
          ...currentResult,
          is_paid: true,
          full_result: fullResult,
          unique_code: newUniqueCode
        };
        localStorage.setItem('testResult', JSON.stringify(updatedResult));

        // 清除付費 session ID
        localStorage.removeItem('paymentSessionId');

        setIsProcessing(false);

        toast({
          title: "付費成功！",
          description: "完整報告已解鎖",
        });

      } catch (error) {
        console.error('Payment processing error:', error);
        toast({
          title: "處理失敗",
          description: "無法更新付費狀態，請聯繫客服",
          variant: "destructive"
        });
        setIsProcessing(false);
      }
    };

    processPaymentSuccess();
  }, [navigate, toast]);

  const handleViewReport = () => {
    navigate('/result');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            {isProcessing ? (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            ) : (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isProcessing ? "處理付費中..." : "付費成功！"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing ? (
            <p className="text-muted-foreground">
              正在處理您的付費並解鎖完整報告...
            </p>
          ) : (
            <>
              <p className="text-muted-foreground">
                您的完整心理分析報告已經解鎖！現在可以查看詳細的分析結果和個人化建議。
              </p>
              <Button onClick={handleViewReport} size="lg" className="w-full">
                查看完整報告
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;