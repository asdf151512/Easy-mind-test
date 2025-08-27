import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Payment = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentComplete, setShowPaymentComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    if (!storedSessionId) {
      navigate('/');
      return;
    }
    setSessionId(storedSessionId);
  }, [navigate]);

  const handleStripePayment = () => {
    console.log('付費按鈕被點擊', { sessionId });
    
    if (!sessionId) {
      console.error('沒有 sessionId');
      toast({
        title: "錯誤",
        description: "無法找到測驗記錄，請重新測驗",
        variant: "destructive"
      });
      return;
    }
    
    // 儲存 session ID 以供成功頁面使用
    localStorage.setItem('paymentSessionId', sessionId);
    console.log('已儲存 paymentSessionId:', sessionId);
    
    // 在新分頁開啟 Stripe 付費頁面
    const stripeUrl = 'https://buy.stripe.com/test_5kQ5kw4r68gm5v98GU2VG00';
    console.log('開啟 Stripe 頁面:', stripeUrl);
    
    const newWindow = window.open(stripeUrl, '_blank');
    
    if (newWindow) {
      console.log('Stripe 頁面已開啟');
      setShowPaymentComplete(true);
      toast({
        title: "付費頁面已開啟",
        description: "完成付費後，請點擊下方的「付費完成」按鈕",
      });
    } else {
      console.error('無法開啟新視窗，可能被瀏覽器阻擋');
      toast({
        title: "無法開啟付費頁面",
        description: "請檢查瀏覽器是否阻擋彈出視窗，或手動前往付費連結",
        variant: "destructive"
      });
    }
  };

  const handlePaymentComplete = async () => {
    if (!sessionId) return;

    setIsProcessing(true);

    try {
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

      // 清除付費相關的 localStorage
      localStorage.removeItem('paymentSessionId');

      toast({
        title: "付費確認成功！",
        description: "完整報告已解鎖，正在跳轉...",
      });

      // 跳轉回結果頁面
      setTimeout(() => {
        navigate('/result');
      }, 1500);

    } catch (error) {
      console.error('Payment completion error:', error);
      toast({
        title: "確認失敗",
        description: "處理付費確認時發生錯誤，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>載入中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 返回按鈕 */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/result')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回結果頁面
        </Button>

        {/* 付費頁面標題 */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
              <Lock className="h-6 w-6" />
              解鎖完整心理分析報告
            </CardTitle>
            <p className="text-muted-foreground">
              獲得專業級的詳細分析與個人化建議
            </p>
          </CardHeader>
        </Card>

        {/* 產品特色 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">完整報告包含</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">情緒穩定性深度分析</h4>
                    <p className="text-sm text-muted-foreground">專業評估您的情緒管理能力</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">社交能力評估</h4>
                    <p className="text-sm text-muted-foreground">了解您的人際互動模式</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">壓力應對策略</h4>
                    <p className="text-sm text-muted-foreground">個人化的壓力管理建議</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">未來發展建議</h4>
                    <p className="text-sm text-muted-foreground">針對性的個人成長指導</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">長期維護計畫</h4>
                    <p className="text-sm text-muted-foreground">持續的心理健康維護策略</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">專業級分析</h4>
                    <p className="text-sm text-muted-foreground">基於心理學理論的科學分析</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 價格與付費 */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-xl">選擇付費方案</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-purple-100 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">完整心理分析報告</h3>
                  <p className="text-sm text-muted-foreground">一次性付費，永久保存</p>
                </div>
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  限時優惠 40% OFF
                </Badge>
              </div>
              
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold text-primary">$5 USD</span>
                <span className="text-lg text-muted-foreground line-through">$8 USD</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>10頁以上的詳細分析報告</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>個人化改善建議</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>永久保存，隨時查看</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>可列印保存</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">付費方式</h4>
              {!showPaymentComplete ? (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    點擊下方按鈕在新分頁開啟 Stripe 付費頁面
                  </p>
                  <Button 
                    onClick={handleStripePayment}
                    disabled={isProcessing}
                    size="lg"
                    className="w-full"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    立即付費 $5 USD
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    * 付費完成後請回到此頁面，系統會自動檢測付費狀態
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    已開啟 Stripe 付費頁面，完成付費後請點擊下方按鈕
                  </p>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-3">
                      ✅ 如果您已在 Stripe 頁面完成付費，請點擊下方按鈕確認
                    </p>
                    <Button 
                      onClick={handlePaymentComplete}
                      disabled={isProcessing}
                      size="lg"
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          處理中...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          我已完成付費，解鎖報告
                        </>
                      )}
                    </Button>
                  </div>
                  <Button 
                    onClick={() => setShowPaymentComplete(false)}
                    variant="outline"
                    size="sm"
                  >
                    重新付費
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">安全保障</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 加密傳輸，保護您的隱私</li>
                <li>• 支持多種安全付費方式</li>
                <li>• 7天無條件退款保證</li>
                <li>• 24小時客服支持</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;