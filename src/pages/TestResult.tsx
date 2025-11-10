import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lock, CheckCircle, CreditCard, Sparkles, BarChart3, Lightbulb, TrendingUp, Target, Gift } from "lucide-react";
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
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    initializeResults();
  }, [navigate]);

  // 監聽URL參數變化，如果sessionId或refresh參數改變則重新初始化
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const currentSessionId = urlParams.get('sessionId');
      const refreshParam = urlParams.get('refresh');
      const storedSessionId = storage.getTestResult()?.id;

      if ((currentSessionId && currentSessionId !== storedSessionId) || refreshParam) {
        console.log('檢測到URL參數變化，重新載入數據', { currentSessionId, refreshParam });
        initializeResults();
      }
    };

    // 監聽瀏覽器前進後退
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // 監聽location變化來檢測refresh參數
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const refreshParam = urlParams.get('refresh');

    if (refreshParam) {
      console.log('檢測到refresh參數，強制重新載入數據');
      initializeResults();
    }
  }, [location.search]);

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

      // 如果URL有sessionId但與本地結果不同，強制重新載入最新數據
      if (sessionIdFromUrl && localResult && localResult.id === sessionIdFromUrl) {
        console.log('檢查是否需要更新測驗結果數據:', sessionIdFromUrl);

        const sessionResult = await TestService.getTestSession(sessionIdFromUrl);
        if (sessionResult.success && sessionResult.data) {
          // 如果資料庫中的付費狀態或完整報告與本地不同，更新本地數據
          if (sessionResult.data.is_paid !== localResult.is_paid ||
              sessionResult.data.full_result !== localResult.full_result) {
            console.log('發現更新的測驗數據，更新本地存儲');
            localResult = sessionResult.data;
            storage.saveTestResult(localResult);
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

  // Calculate score
  const answers = testResult.answers as any;
  const category = answers._metadata?.category || 'all';
  const questions = getQuestionsByCategory(category);
  const scoreBreakdown = generateScoreBreakdown(answers, questions);
  const totalScore = Number(Object.values(testResult.answers as any).reduce((sum: number, ans: any) => sum + (ans.score || 0), 0));
  const maxPossibleScore = Object.keys(testResult.answers).length * 4;
  const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  const getAnalysisLevel = (percentage: number) => {
    if (percentage >= 85) return { level: "優秀水準", description: "您在此領域表現優秀，展現出卓越的能力和積極的態度" };
    if (percentage >= 70) return { level: "良好水準", description: "您在此領域表現良好，具備穩定的能力和正面的態度" };
    if (percentage >= 55) return { level: "中等水準", description: "您在此領域表現中等，有提升空間和發展潛力" };
    return { level: "待提升水準", description: "建議您在此領域投入更多關注，以提升整體表現" };
  };

  const analysisLevel = getAnalysisLevel(percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero Score Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-gradient-purple via-gradient-purple-light to-purple-500"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]"></div>
          <CardContent className="relative p-8 md:p-12 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium">
                整體評估
              </div>
              <Sparkles className="h-16 w-16 opacity-30" />
            </div>
            <div className="space-y-2">
              <div className="text-7xl font-bold">{percentage}分</div>
              <div className="text-2xl font-semibold opacity-95">{analysisLevel.level}</div>
              <p className="text-lg opacity-90 max-w-xl">{analysisLevel.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Core Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gradient-purple" />
              核心能力分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-gradient-purple mt-2 flex-shrink-0"></div>
              <p className="text-foreground">在個人思維發展方面，您顯示出高度的<span className="font-semibold text-gradient-purple">自我認知能力</span></p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p className="text-foreground">您在情緒管理、自我反思、目標設定等方面具備良好的基礎</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-purple-400 mt-2 flex-shrink-0"></div>
              <p className="text-muted-foreground">在壓力應對方面展現出獨特的...</p>
            </div>
            <div className="flex items-center justify-center pt-4">
              <Button 
                variant="default" 
                className="bg-gradient-purple hover:bg-gradient-purple-light"
                onClick={() => {
                  if (!testResult.is_paid) {
                    document.getElementById('unlock-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Lock className="h-4 w-4 mr-2" />
                解鎖查看更多
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards Grid */}
        {!testResult.is_paid && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <BarChart3 className="h-6 w-6 text-gradient-purple" />
                  </div>
                  <h3 className="font-semibold">詳細維度分析</h3>
                </div>
                <p className="text-sm text-muted-foreground">8個核心維度深度解讀</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer border-yellow-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <Lightbulb className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold">個性化建議</h3>
                </div>
                <p className="text-sm text-muted-foreground">專屬成長路徑規劃</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-100">
                    <TrendingUp className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold">成長追蹤</h3>
                </div>
                <p className="text-sm text-muted-foreground">持續記錄您的進步</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer border-red-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-red-100">
                    <Target className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold">行動計劃</h3>
                </div>
                <p className="text-sm text-muted-foreground">可執行的提升方案</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Unlock Section */}
        {!testResult.is_paid && (
          <Card id="unlock-section" className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-8 md:p-10">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">解鎖完整報告</h3>
                  <p className="text-muted-foreground">
                    獲取專業的深度分析和個性化建議，開啟您的成長之旅
                  </p>
                </div>

                <Button
                  onClick={handleDirectPayment}
                  disabled={isProcessingPayment}
                  size="lg"
                  className="bg-gradient-to-r from-gradient-purple to-gradient-purple-light hover:opacity-90 text-white font-semibold px-8 py-6 text-lg"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      處理中...
                    </>
                  ) : (
                    <>
                      立即解鎖完整報告
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white"></div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 border-2 border-white"></div>
                    </div>
                    <span className="font-semibold">已有 50,000+ 用戶解鎖</span>
                  </div>
                </div>

                <div className="text-sm font-medium text-muted-foreground">
                  ⭐️ 4.9分 | 用戶滿意度 98%
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Radar Chart - Only show when paid */}
        {testResult.is_paid && testResult.answers && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gradient-purple" />
                能力分析圖表
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                try {
                  const radarData = generateRadarChartData(answers, questions, category);

                  return (
                    <div>
                      <RadarChart data={radarData} title={`${category === 'family' ? '家庭' : category === 'relationship' ? '感情' : category === 'work' ? '工作' : category === 'personal' ? '個人' : '綜合'}能力雷達圖`} />

                      <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <h5 className="font-semibold mb-2">答題分析</h5>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-success">{scoreBreakdown.highScore}</div>
                            <div className="text-sm text-muted-foreground">高分回答</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-warning">{scoreBreakdown.mediumScore}</div>
                            <div className="text-sm text-muted-foreground">中等回答</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-destructive">{scoreBreakdown.lowScore}</div>
                            <div className="text-sm text-muted-foreground">低分回答</div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                          總題數：{scoreBreakdown.totalQuestions} 題
                        </p>
                      </div>
                    </div>
                  );
                } catch (error) {
                  console.error('生成雷達圖時發生錯誤:', error);
                  return (
                    <div className="text-center text-muted-foreground py-8">
                      <p>暫時無法生成圖表，請稍後再試</p>
                    </div>
                  );
                }
              })()}
            </CardContent>
          </Card>
        )}

        {/* Full Report */}
        {testResult.is_paid && testResult.full_result && (
          <Card className="border-success/20 bg-success/5">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
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

        {/* Actions */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleNewTest} variant="outline" className="flex-1">
                重新測驗
              </Button>
              {testResult.is_paid && (
                <Button 
                  onClick={handlePrintReport}
                  className="flex-1 bg-gradient-purple hover:bg-gradient-purple-light"
                >
                  列印報告
                </Button>
              )}
            </div>
            
            <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
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