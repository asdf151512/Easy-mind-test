import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Users, Award, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const startTest = () => {
    // 清除之前的測驗數據
    localStorage.removeItem('tempUserId');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('testResult');
    localStorage.removeItem('sessionId');
    
    navigate('/personal-info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            專業心理測驗平台
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            透過科學化的心理測驗，深入了解您的心理狀態，獲得專業的分析與建議
          </p>
          <Button onClick={startTest} size="lg" className="text-lg px-8 py-6">
            <Brain className="mr-2 h-5 w-5" />
            開始心理測驗
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Brain className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <CardTitle className="text-lg">科學測驗</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                基於心理學理論設計的專業測驗題目
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <CardTitle className="text-lg">個人化分析</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                根據您的回答提供量身定制的分析報告
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Award className="h-12 w-12 mx-auto text-orange-500 mb-4" />
              <CardTitle className="text-lg">專業建議</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                獲得實用的心理健康維護與改善建議
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto text-purple-500 mb-4" />
              <CardTitle className="text-lg">隱私保護</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                嚴格保護您的個人資料與測驗結果
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Process */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">測驗流程</CardTitle>
            <p className="text-muted-foreground">簡單四步驟，深入了解自己</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  1
                </div>
                <h3 className="font-semibold mb-2">填寫基本資料</h3>
                <p className="text-sm text-muted-foreground">
                  提供基本個人資訊以獲得更準確的分析
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  2
                </div>
                <h3 className="font-semibold mb-2">完成心理測驗</h3>
                <p className="text-sm text-muted-foreground">
                  回答10道精心設計的心理測驗題目
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  3
                </div>
                <h3 className="font-semibold mb-2">查看基本結果</h3>
                <p className="text-sm text-muted-foreground">
                  立即獲得初步的心理狀態評估
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  4
                </div>
                <h3 className="font-semibold mb-2">解鎖完整報告</h3>
                <p className="text-sm text-muted-foreground">
                  付費獲得詳細分析與專業建議
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-16">
          <Card className="max-w-md mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">準備開始了嗎？</h3>
              <p className="text-muted-foreground mb-6">
                只需要5-10分鐘，就能獲得關於自己的深入見解
              </p>
              <Button onClick={startTest} size="lg" className="w-full">
                立即開始測驗
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
