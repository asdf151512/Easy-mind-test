import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  question_text: string;
  question_order: number;
  options: Array<{
    text: string;
    score: number;
  }>;
}

const PsychTest = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionIndex: number; score: number }>>({});
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // 檢查是否有用戶資料
    const userProfile = localStorage.getItem('userProfile');
    if (!userProfile) {
      navigate('/');
      return;
    }

    fetchQuestions();
  }, [navigate]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('test_questions')
        .select('*')
        .order('question_order');

      if (error) throw error;

      setQuestions((data || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)
      })));
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "載入失敗",
        description: "無法載入測驗題目，請重新整理頁面",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: { optionIndex, score }
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption("");
    } else {
      // 測驗完成，儲存結果
      finishTest({ ...answers, [currentQuestion.id]: { optionIndex, score } });
    }
  };

  const finishTest = async (finalAnswers: Record<string, { optionIndex: number; score: number }>) => {
    try {
      const tempUserId = localStorage.getItem('tempUserId');
      const userProfileData = localStorage.getItem('userProfile');
      
      if (!tempUserId || !userProfileData) {
        throw new Error('用戶資料遺失');
      }

      const userProfile = JSON.parse(userProfileData);
      
      // 計算總分
      const totalScore = Object.values(finalAnswers).reduce((sum, answer) => sum + answer.score, 0);
      const maxScore = questions.length * 3; // 每題最高3分
      const percentage = Math.round((totalScore / maxScore) * 100);

      // 生成基本結果
      let basicResult = "";
      if (percentage >= 80) {
        basicResult = "心理狀態良好：您展現出積極正向的心理特質，能夠有效應對生活中的挑戰。";
      } else if (percentage >= 60) {
        basicResult = "心理狀態穩定：您具備不錯的心理調適能力，在某些方面還有成長空間。";
      } else if (percentage >= 40) {
        basicResult = "需要關注：建議您多關注自己的心理健康，適時尋求支持和協助。";
      } else {
        basicResult = "建議專業諮詢：您可能正面臨一些心理壓力，建議考慮尋求專業心理諮詢。";
      }

      // 生成獨特代碼
      const uniqueCode = `PSY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // 保存測驗記錄
      const { data, error } = await supabase
        .from('test_sessions')
        .insert({
          user_id: tempUserId,
          profile_id: userProfile.id,
          answers: finalAnswers,
          basic_result: basicResult,
          unique_code: uniqueCode,
          is_paid: false
        })
        .select()
        .single();

      if (error) throw error;

      // 將結果存儲到 localStorage
      localStorage.setItem('testResult', JSON.stringify(data));
      
      navigate('/result');
    } catch (error) {
      console.error('Error saving test result:', error);
      toast({
        title: "保存失敗",
        description: "測驗結果保存失敗，請稍後再試",
        variant: "destructive"
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                心理測驗
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
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