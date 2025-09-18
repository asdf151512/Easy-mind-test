import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { PersonalInfoForm } from "@/types";
import { ProfileService } from "@/services/profileService";
import { Users, Heart, Briefcase, Brain, Layers } from "lucide-react";

const PersonalInfo = () => {
  const [form, setForm] = useState<PersonalInfoForm>({
    name: "",
    age: "",
    gender: "",
    occupation: "",
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const categories = [
    {
      id: "family",
      name: "家庭",
      icon: Users,
      description: "家庭關係、親子互動、家庭責任分工",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: "relationship",
      name: "感情關係",
      icon: Heart,
      description: "戀愛關係、伴侶溝通、情感需求",
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      id: "work",
      name: "工作",
      icon: Briefcase,
      description: "職場壓力、工作效率、同事關係",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: "personal",
      name: "個人思維",
      icon: Brain,
      description: "自我認知、思維模式、個人成長",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      id: "all",
      name: "全面評估",
      icon: Layers,
      description: "涵蓋所有領域的綜合心理評估",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

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

    if (!selectedCategory) {
      toast({
        title: "請選擇測驗類別",
        description: "請選擇您想要專注評估的生活領域",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('開始提交個人資料:', form);
      
      const result = await ProfileService.createProfile(form);
      
      if (result.success) {
        console.log('個人資料創建成功:', result.data);

        // 保存選擇的類別到 localStorage
        localStorage.setItem('selectedCategory', selectedCategory);

        toast({
          title: "資料已保存",
          description: `開始「${categories.find(c => c.id === selectedCategory)?.name}」領域的心理測驗`
        });

        navigate('/test');
      } else {
        console.error('個人資料創建失敗:', result.error);
        
        toast({
          title: "保存失敗",
          description: result.error?.message || "請稍後再試",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('意外錯誤:', error);
      
      toast({
        title: "保存失敗",
        description: "發生意外錯誤，請稍後再試",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">
              個人資料與測驗類別
            </CardTitle>
            <p className="text-muted-foreground">
              請填寫基本資料並選擇您想要專注評估的生活領域
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 個人資料部分 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">基本資料</h3>

                <div className="grid md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                </div>
              </div>

              <Separator />

              {/* 測驗類別選擇部分 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">測驗類別 *</h3>
                <p className="text-sm text-muted-foreground">
                  選擇您希望深入了解的生活領域，我們將為您提供30道相關的專業測驗題目
                </p>

                <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                  <div className="grid md:grid-cols-2 gap-3">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const isSelected = selectedCategory === category.id;

                      return (
                        <div key={category.id} className="relative">
                          <RadioGroupItem
                            value={category.id}
                            id={category.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={category.id}
                            className={`
                              flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                              hover:shadow-md peer-checked:shadow-md
                              ${isSelected
                                ? `${category.bgColor} border-current ${category.color}`
                                : 'bg-white border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            <Icon className={`h-6 w-6 mr-3 ${isSelected ? category.color : 'text-gray-400'}`} />
                            <div className="flex-1">
                              <h4 className={`font-medium ${isSelected ? category.color : 'text-gray-700'}`}>
                                {category.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {category.description}
                              </p>
                            </div>
                            {category.id === 'all' && (
                              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                                推薦
                              </span>
                            )}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "保存中..." : "開始測驗"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalInfo;