import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileService } from "@/services/profileService";

const PaymentSuccess = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    processPaymentSuccess();
  }, [navigate, toast]);

  const processPaymentSuccess = async () => {
    try {
      // 從 URL 參數獲取會話 ID
      const urlParams = new URLSearchParams(window.location.search);
      const checkoutSessionId = urlParams.get('session_id');
      const testSessionId = urlParams.get('test_session_id');

      console.log('付費成功頁面參數:', { checkoutSessionId, testSessionId });

      if (!checkoutSessionId || !testSessionId) {
        // 嘗試從 localStorage 獲取
        const storedTestSessionId = localStorage.getItem('paymentSessionId');
        const storedCheckoutSessionId = localStorage.getItem('checkoutSessionId');
        
        if (!storedTestSessionId || !storedCheckoutSessionId) {
          console.error('找不到付費會話資訊');
          navigate('/');
          return;
        }
        
        console.log('從 localStorage 獲取會話資訊');
        return processPaymentVerification(storedCheckoutSessionId, storedTestSessionId);
      }

      return processPaymentVerification(checkoutSessionId, testSessionId);

    } catch (error) {
      console.error('處理付費成功失敗:', error);
      setIsProcessing(false);
      toast({
        title: "處理失敗",
        description: "驗證付費狀態時發生錯誤",
        variant: "destructive"
      });
    }
  };

  const processPaymentVerification = async (checkoutSessionId: string, testSessionId: string) => {
    console.log('驗證付費狀態...', { checkoutSessionId: checkoutSessionId.substring(0, 20) + '...', testSessionId });
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { 
          checkoutSessionId,
          testSessionId 
        }
      });

      if (error) {
        console.error('驗證付費失敗:', error);
        throw error;
      }

      console.log('付費驗證成功:', data);
      
      // 更新本地存儲
      if (data && data.session) {
        localStorage.setItem('testResult', JSON.stringify(data.session));
        localStorage.setItem('sessionId', data.session.id);
        
        // 同時更新profile資料
        if (data.session.profile_id) {
          const profileResult = await ProfileService.getProfile(data.session.profile_id);
          if (profileResult.success && profileResult.data) {
            localStorage.setItem('userProfile', JSON.stringify(profileResult.data));
          }
        }
      }
      
      // 清除付費相關的 localStorage
      localStorage.removeItem('paymentSessionId');
      localStorage.removeItem('checkoutSessionId');
      
      toast({
        title: "付費成功！",
        description: "您的完整報告已解鎖，正在載入...",
      });
      
      setIsProcessing(false);
      
    } catch (error) {
      console.error('付費驗證過程發生錯誤:', error);
      
      toast({
        title: "驗證失敗",
        description: "付費驗證時發生錯誤，請聯繫客服",
        variant: "destructive"
      });
      
      setIsProcessing(false);
    }
  };

  const handleViewReport = () => {
    // 使用sessionId參數導航，確保能正確載入資料
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      navigate(`/result?sessionId=${sessionId}`);
    } else {
      navigate('/result');
    }
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