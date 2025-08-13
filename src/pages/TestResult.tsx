import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock, CheckCircle } from "lucide-react";

interface TestResult {
  id: string;
  unique_code: string;
  basic_result: string;
  full_result?: string;
  is_paid: boolean;
  created_at: string;
}

const TestResult = () => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const resultData = localStorage.getItem('testResult');
    const profileData = localStorage.getItem('userProfile');
    
    if (!resultData || !profileData) {
      navigate('/');
      return;
    }

    setTestResult(JSON.parse(resultData));
    setUserProfile(JSON.parse(profileData));
  }, [navigate]);

  const handleUpgrade = () => {
    if (testResult) {
      localStorage.setItem('sessionId', testResult.id);
      navigate('/payment');
    }
  };

  const handleNewTest = () => {
    // 清除本地儲存
    localStorage.removeItem('tempUserId');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('testResult');
    navigate('/');
  };

  if (!testResult || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>載入結果中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 結果標題 */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              測驗完成！
            </CardTitle>
            <p className="text-muted-foreground">
              感謝 {userProfile.name} 完成心理測驗
            </p>
            <div className="flex justify-center">
              <Badge variant="secondary" className="text-sm">
                測驗代碼：{testResult.unique_code}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* 基本結果 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">基本結果</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">
              {testResult.basic_result}
            </p>
          </CardContent>
        </Card>

        {/* 升級提示 */}
        {!testResult.is_paid && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-500" />
                解鎖完整報告
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                完整版報告包含：
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>詳細的心理特質分析</li>
                <li>個人化建議與改善方向</li>
                <li>壓力管理技巧</li>
                <li>情緒調節策略</li>
                <li>未來發展建議</li>
              </ul>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">完整報告</p>
                  <p className="text-sm text-muted-foreground">一次性付費，永久保存</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">NT$ 299</p>
                  <p className="text-sm text-muted-foreground line-through">原價 NT$ 499</p>
                </div>
              </div>
              
              <Button onClick={handleUpgrade} className="w-full" size="lg">
                立即解鎖完整報告
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 已付費的完整結果 */}
        {testResult.is_paid && testResult.full_result && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                完整分析報告
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: testResult.full_result.replace(/\n/g, '<br>') }} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 操作按鈕 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleNewTest} variant="outline" className="flex-1">
                重新測驗
              </Button>
              {testResult.is_paid && (
                <Button 
                  onClick={() => window.print()} 
                  variant="secondary" 
                  className="flex-1"
                >
                  列印報告
                </Button>
              )}
            </div>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>測驗時間：{new Date(testResult.created_at).toLocaleString('zh-TW')}</p>
              <p>此報告僅供參考，如有心理健康疑慮，請諮詢專業心理師</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestResult;