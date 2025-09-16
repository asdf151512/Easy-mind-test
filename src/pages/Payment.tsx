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

  const handleStripePayment = async () => {
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
    
    setIsProcessing(true);
    
    try {
      console.log('調用創建付費會話 API');
      
      // 調用 edge function 創建付費會話
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { sessionId }
      });

      if (error) {
        console.error('創建付費會話失敗:', error);
        throw error;
      }

      console.log('付費會話創建成功:', data);
      
      // 儲存相關資訊
      localStorage.setItem('paymentSessionId', sessionId);
      localStorage.setItem('checkoutSessionId', data.checkout_session_id);
      
      // 在新分頁開啟 Stripe Checkout 頁面
      const newWindow = window.open(data.url, '_blank');
      
      if (newWindow) {
        console.log('Stripe Checkout 頁面已開啟');
        toast({
          title: "付費頁面已開啟",
          description: "請在新分頁完成付費，付費完成後頁面會自動跳轉",
        });
      } else {
        console.error('無法開啟新視窗，可能被瀏覽器阻擋');
        toast({
          title: "無法開啟付費頁面",
          description: "請檢查瀏覽器是否阻擋彈出視窗",
          variant: "destructive"
        });
        // 如果無法開啟新視窗，在當前視窗開啟
        window.location.href = data.url;
      }
      
    } catch (error) {
      console.error('付費流程錯誤:', error);
      toast({
        title: "付費失敗",
        description: "創建付費會話時發生錯誤，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 暫時移除手動付費確認功能以防止安全漏洞
  // 需要實現真正的 Stripe 付費驗證

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
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  點擊下方按鈕開啟 Stripe 安全付費頁面
                </p>
                <Button 
                  onClick={handleStripePayment}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      處理中...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      立即付費 $5 USD
                    </>
                  )}
                </Button>
                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-green-800">
                    ✅ 使用 Stripe 安全付費系統，支援多種付費方式
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    付費完成後將自動跳轉回結果頁面並解鎖完整報告
                  </p>
                </div>
              </div>
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