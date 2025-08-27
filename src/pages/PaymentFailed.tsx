import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";

const PaymentFailed = () => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate('/payment');
  };

  const handleBackToResult = () => {
    navigate('/result');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            付費失敗
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            很抱歉，您的付費未能成功完成。這可能是由於網絡問題、信用卡被拒絕或其他技術問題。
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleRetryPayment} 
              size="lg" 
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重新嘗試付費
            </Button>
            
            <Button 
              onClick={handleBackToResult} 
              variant="outline" 
              size="lg" 
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回測驗結果
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm">
            <p className="font-medium text-blue-900 mb-2">需要協助？</p>
            <p className="text-blue-700">
              如果持續遇到付費問題，請聯繫我們的客服團隊，我們將竭誠為您解決問題。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailed;