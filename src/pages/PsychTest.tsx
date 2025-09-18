import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { TestQuestion, TestAnswers } from "@/types";
import { TestService } from "@/services/testService";
import { ProfileService } from "@/services/profileService";
import { getQuestionsByCategory } from "@/data/questions";

const PsychTest = () => {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswers>({});
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    initializeTest();
  }, [navigate]);

  const initializeTest = async () => {
    console.log('初始化測驗...');
    
    // 檢查用戶資料
    const hasValidProfile = ProfileService.validateLocalProfile();
    if (!hasValidProfile) {
      console.warn('用戶資料無效，重定向到首頁');
      toast({
        title: "用戶資料遺失",
        description: "請重新填寫個人資料",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    // 載入測驗題目
    await loadQuestions();
  };

  const loadQuestions = async () => {
    console.log('載入測驗題目...');
    setIsLoading(true);

    try {
      // 從 localStorage 獲取選擇的類別
      const selectedCategory = localStorage.getItem('selectedCategory') || 'all';
      console.log('選擇的測驗類別:', selectedCategory);

      // 根據類別載入對應題目
      const categoryQuestions = getQuestionsByCategory(selectedCategory);

      console.log('測驗題目載入成功:', categoryQuestions.length, '題');
      setQuestions(categoryQuestions);

      toast({
        title: "題目載入成功",
        description: `已準備好 ${categoryQuestions.length} 道${getCategoryName(selectedCategory)}測驗題目`,
      });

    } catch (error) {
      console.error('載入測驗題目時發生錯誤:', error);
      toast({
        title: "載入失敗",
        description: "載入測驗題目時發生錯誤",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (category: string): string => {
    const categoryNames: { [key: string]: string } = {
      'family': '家庭',
      'relationship': '感情關係',
      'work': '工作',
      'personal': '個人思維',
      'all': '綜合'
    };
    return categoryNames[category] || '綜合';
  };

  const handleNext = () => {
    if (!selectedOption) {
      toast({
        title: "請選擇答案",
        description: "請先選擇一個選項再繼續",
        variant: "destructive"
      });
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const optionIndex = parseInt(selectedOption);
    const score = currentQuestion.options[optionIndex].score;

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: { optionIndex, score }
    };

    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption("");
    } else {
      // 測驗完成，儲存結果
      finishTest(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      
      // 恢復上一題的選擇
      const prevQuestion = questions[currentQuestionIndex - 1];
      const prevAnswer = answers[prevQuestion.id];
      setSelectedOption(prevAnswer ? prevAnswer.optionIndex.toString() : "");
    }
  };

  const finishTest = async (finalAnswers: TestAnswers) => {
    console.log('完成測驗，保存結果...', { answerCount: Object.keys(finalAnswers).length });
    setIsSaving(true);

    try {
      // 獲取用戶資料
      const profile = ProfileService.getLocalProfile();
      if (!profile) {
        throw new Error('用戶資料遺失');
      }

      // 保存測驗結果
      const result = await TestService.saveTestSession(finalAnswers, questions, profile);
      
      if (result.success) {
        console.log('測驗結果保存成功:', result.data);
        
        toast({
          title: "測驗完成",
          description: "正在為您生成測驗結果..."
        });

        // 使用sessionId參數導航，確保資料正確載入
        navigate(`/result?sessionId=${result.data.id}`);
      } else {
        console.error('保存測驗結果失敗:', result.error);
        
        toast({
          title: "保存失敗",
          description: result.error?.message || "測驗結果保存失敗",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('完成測驗時發生錯誤:', error);
      
      toast({
        title: "保存失敗",
        description: "測驗結果保存失敗，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>載入測驗題目中...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>無法載入測驗題目</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              返回首頁
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const selectedCategory = localStorage.getItem('selectedCategory') || 'all';
  const categoryName = getCategoryName(selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                {categoryName}心理測驗
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              專注於{categoryName}領域的深度評估
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">
              {currentQuestion.question_text}
            </h3>
            
            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(prev => prev - 1);
                  setSelectedOption("");
                }
              }}
              disabled={currentQuestionIndex === 0}
            >
              上一題
            </Button>
            
            <Button onClick={handleNext}>
              {currentQuestionIndex === questions.length - 1 ? "完成測驗" : "下一題"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PsychTest;