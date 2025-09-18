import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lock, CheckCircle, CreditCard } from "lucide-react";
import { TestSession, UserProfile } from "@/types";
import { TestService } from "@/services/testService";
import { ProfileService } from "@/services/profileService";
import { storage } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RadarChart from "@/components/RadarChart";
import { generateRadarChartData, generateScoreBreakdown } from "@/utils/chartDataGenerator";
import { getQuestionsByCategory } from "@/data/questions";

const TestResult = () => {
  const [testResult, setTestResult] = useState<TestSession | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    initializeResults();
  }, [navigate]);

  const initializeResults = async () => {
    console.log('初始化測驗結果頁面...');
    setIsLoading(true);

    try {
      // 首先檢查URL參數中是否有sessionId
      const urlParams = new URLSearchParams(window.location.search);
      const sessionIdFromUrl = urlParams.get('sessionId');
      
      // 檢查本地存儲的結果
      let localResult = TestService.getLocalTestResult();
      let localProfile = ProfileService.getLocalProfile();

      console.log('資料檢查:', { 
        hasLocalResult: !!localResult, 
        hasLocalProfile: !!localProfile,
        sessionIdFromUrl 
      });

      // 如果有URL參數的sessionId，嘗試從資料庫載入
      if (sessionIdFromUrl && (!localResult || localResult.id !== sessionIdFromUrl)) {
        console.log('從資料庫載入測驗結果:', sessionIdFromUrl);
        
        const sessionResult = await TestService.getTestSession(sessionIdFromUrl);
        if (sessionResult.success && sessionResult.data) {
          localResult = sessionResult.data;
          
          // 同時載入對應的profile
          if (localResult.profile_id) {
            const profileResult = await ProfileService.getProfile(localResult.profile_id);
            if (profileResult.success && profileResult.data) {
              localProfile = profileResult.data;
              
              // 更新本地存儲
              storage.saveTestResult(localResult);
              storage.saveUserProfile(localProfile);
            }
          }
        }
      }

      if (!localResult || !localProfile) {
        console.warn('缺少必要資料，重定向到首頁');
        toast({
          title: "資料遺失",
          description: "找不到測驗結果，請重新開始測驗",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      // 驗證資料完整性
      if (localResult.profile_id !== localProfile.id) {
        console.warn('資料不一致，清理並重定向');
        TestService.clearTestData();
        navigate('/');
        return;
      }

      setTestResult(localResult);
      setUserProfile(localProfile);

      console.log('測驗結果載入成功:', {
        sessionId: localResult.id,
        profileId: localProfile.id,
        uniqueCode: localResult.unique_code,
        isPaid: localResult.is_paid,
        hasFullResult: !!localResult.full_result,
        fullResultLength: localResult.full_result ? localResult.full_result.length : 0
      });

    } catch (error) {
      console.error('初始化測驗結果頁面失敗:', error);
      
      toast({
        title: "載入失敗",
        description: "載入測驗結果時發生錯誤",
        variant: "destructive"
      });
      
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectPayment = async () => {
    if (!testResult) {
      toast({
        title: "錯誤",
        description: "無法找到測驗記錄，請重新測驗",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      console.log('直接創建付費會話');

      // 調用 edge function 創建付費會話
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { sessionId: testResult.id }
      });

      if (error) {
        console.error('創建付費會話失敗:', error);
        throw error;
      }

      console.log('付費會話創建成功:', data);

      // 儲存相關資訊
      localStorage.setItem('paymentSessionId', testResult.id);
      localStorage.setItem('checkoutSessionId', data.checkout_session_id);

      // 在當前視窗開啟 Stripe Checkout 頁面
      console.log('前往付費頁面:', data.url);
      window.location.href = data.url;

    } catch (error) {
      console.error('付費流程錯誤:', error);
      toast({
        title: "付費失敗",
        description: "創建付費會話時發生錯誤，請稍後再試",
        variant: "destructive"
      });
      setIsProcessingPayment(false);
    }
  };


  const handleNewTest = () => {
    console.log('開始新測驗，清理舊數據...');
    
    // 清除本地儲存
    TestService.clearTestData();
    ProfileService.clearProfile();
    
    toast({
      title: "資料已清理",
      description: "準備開始新的測驗"
    });
    
    navigate('/');
  };

  const handlePrintReport = () => {
    try {
      window.print();
    } catch (error) {
      console.error('列印失敗:', error);
      toast({
        title: "列印失敗",
        description: "無法列印報告，請嘗試使用瀏覽器的列印功能",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>載入測驗結果中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!testResult || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>找不到測驗結果</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              返回首頁
            </Button>
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
          </CardHeader>
        </Card>

        {/* 基本結果 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">基本結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-base leading-relaxed enhanced-basic-report"
              dangerouslySetInnerHTML={{ __html: testResult.basic_result }}
            />
          </CardContent>
        </Card>

        {/* 能力雷達圖 */}
        {testResult && testResult.answers && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">能力分析圖表</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                try {
                  // 獲取類別資訊
                  const answers = testResult.answers as any;
                  const category = answers._metadata?.category || 'all';

                  // 獲取對應的問題
                  const questions = getQuestionsByCategory(category);

                  // 生成雷達圖數據
                  const radarData = generateRadarChartData(answers, questions, category);
                  const scoreBreakdown = generateScoreBreakdown(answers, questions);

                  return (
                    <div>
                      <RadarChart data={radarData} title={`${category === 'family' ? '家庭' : category === 'relationship' ? '感情' : category === 'work' ? '工作' : category === 'personal' ? '個人' : '綜合'}能力雷達圖`} />

                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-semibold mb-2">答題分析</h5>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-600">{scoreBreakdown.highScore}</div>
                            <div className="text-sm text-gray-600">高分回答</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-yellow-600">{scoreBreakdown.mediumScore}</div>
                            <div className="text-sm text-gray-600">中等回答</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-red-600">{scoreBreakdown.lowScore}</div>
                            <div className="text-sm text-gray-600">低分回答</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 text-center">
                          總題數：{scoreBreakdown.totalQuestions} 題
                        </p>
                      </div>
                    </div>
                  );
                } catch (error) {
                  console.error('生成雷達圖時發生錯誤:', error);
                  return (
                    <div className="text-center text-gray-500 py-8">
                      <p>暫時無法生成圖表，請稍後再試</p>
                    </div>
                  );
                }
              })()}
            </CardContent>
          </Card>
        )}

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
                  <p className="text-2xl font-bold text-primary">$5 USD</p>
                  <p className="text-sm text-muted-foreground line-through">原價 $8 USD</p>
                </div>
              </div>
              
              <Button
                onClick={handleDirectPayment}
                disabled={isProcessingPayment}
                className="w-full"
                size="lg"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    處理中...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    立即付費解鎖 $5 USD
                  </>
                )}
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
                  onClick={handlePrintReport}
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