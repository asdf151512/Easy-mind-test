import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PersonalInfoForm {
  name: string;
  age: string;
  gender: string;
  occupation: string;
}

const PersonalInfo = () => {
  const [form, setForm] = useState<PersonalInfoForm>({
    name: "",
    age: "",
    gender: "",
    occupation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: keyof PersonalInfoForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.age || !form.gender) {
      toast({
        title: "請填寫必要資訊",
        description: "姓名、年齡和性別為必填項目",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('開始保存用戶資料...');
      
      // 不使用 user_id，讓它為 null（因為沒有身份認證）
      const insertData = {
        name: form.name,
        age: parseInt(form.age),
        gender: form.gender,
        occupation: form.occupation || null,
        user_id: null  // 設為 null 避免外鍵約束問題
      };
      
      console.log('準備插入的資料:', insertData);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase 錯誤詳情:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('成功保存資料:', data);
      
      // 將用戶資料存儲到 localStorage
      const profileId = data.id;
      localStorage.setItem('tempProfileId', profileId);
      localStorage.setItem('userProfile', JSON.stringify(data));
      
      toast({
        title: "資料已保存",
        description: "現在開始心理測驗"
      });

      navigate('/test');
    } catch (error: any) {
      console.error('完整錯誤信息:', error);
      
      let errorMessage = "請稍後再試";
      
      if (error.message) {
        errorMessage = `錯誤: ${error.message}`;
      }
      
      if (error.code) {
        errorMessage += ` (代碼: ${error.code})`;
      }
      
      if (error.details) {
        errorMessage += ` 詳情: ${error.details}`;
      }
      
      toast({
        title: "保存失敗",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            個人資料填寫
          </CardTitle>
          <p className="text-muted-foreground">
            請填寫基本資料，以便提供更準確的測驗結果
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名 *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="請輸入您的姓名"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">年齡 *</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="120"
                value={form.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="請輸入您的年齡"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">性別 *</Label>
              <Select onValueChange={(value) => handleInputChange('gender', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇性別" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男性</SelectItem>
                  <SelectItem value="female">女性</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">職業</Label>
              <Input
                id="occupation"
                value={form.occupation}
                onChange={(e) => handleInputChange('occupation', e.target.value)}
                placeholder="請輸入您的職業（選填）"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "保存中..." : "開始測驗"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfo;