-- 創建用戶個人資料表
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  occupation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 創建心理測驗題目表
CREATE TABLE public.test_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  options JSONB NOT NULL, -- 存儲選項和分數
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 創建用戶測驗記錄表
CREATE TABLE public.test_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- 存儲所有答案
  basic_result TEXT, -- 基本結果
  full_result TEXT, -- 完整結果（付費後可見）
  unique_code TEXT UNIQUE, -- 獨特代碼
  is_paid BOOLEAN DEFAULT FALSE,
  payment_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 啟用 RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

-- 用戶個人資料 RLS 政策
CREATE POLICY "用戶可以查看自己的個人資料" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用戶可以創建自己的個人資料" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用戶可以更新自己的個人資料" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 測驗題目 RLS 政策（所有人都可以查看）
CREATE POLICY "所有人可以查看測驗題目" ON public.test_questions
  FOR SELECT USING (true);

-- 測驗記錄 RLS 政策
CREATE POLICY "用戶可以查看自己的測驗記錄" ON public.test_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用戶可以創建自己的測驗記錄" ON public.test_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用戶可以更新自己的測驗記錄" ON public.test_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- 創建更新時間戳觸發器
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_sessions_updated_at
  BEFORE UPDATE ON public.test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 插入測驗題目範例
INSERT INTO public.test_questions (question_text, question_order, options) VALUES
('當你面對壓力時，你通常會？', 1, '[
  {"text": "立即行動解決問題", "score": 3},
  {"text": "先分析問題再行動", "score": 2},
  {"text": "尋求他人意見", "score": 1},
  {"text": "避免面對問題", "score": 0}
]'),
('你在社交場合中感覺如何？', 2, '[
  {"text": "非常舒適，喜歡與人交流", "score": 3},
  {"text": "還算舒適，但不會主動交流", "score": 2},
  {"text": "有些緊張，但能應付", "score": 1},
  {"text": "非常不舒適，想要逃避", "score": 0}
]'),
('你對未來的態度是？', 3, '[
  {"text": "充滿希望和期待", "score": 3},
  {"text": "樂觀但有些擔憂", "score": 2},
  {"text": "不確定，隨遇而安", "score": 1},
  {"text": "悲觀，擔心會出問題", "score": 0}
]'),
('你如何處理與他人的衝突？', 4, '[
  {"text": "直接溝通，尋求解決方案", "score": 3},
  {"text": "嘗試理解對方立場", "score": 2},
  {"text": "避免衝突，保持距離", "score": 1},
  {"text": "情緒化回應", "score": 0}
]'),
('你對自己的評價是？', 5, '[
  {"text": "非常滿意自己", "score": 3},
  {"text": "大部分時候滿意", "score": 2},
  {"text": "有時滿意有時不滿意", "score": 1},
  {"text": "經常對自己不滿意", "score": 0}
]'),
('你如何做重要決定？', 6, '[
  {"text": "相信直覺快速決定", "score": 3},
  {"text": "仔細考慮各種因素", "score": 2},
  {"text": "尋求他人建議", "score": 1},
  {"text": "很難做決定，經常猶豫", "score": 0}
]'),
('你對變化的態度是？', 7, '[
  {"text": "喜歡變化，認為是機會", "score": 3},
  {"text": "能夠適應變化", "score": 2},
  {"text": "對變化感到不安", "score": 1},
  {"text": "非常抗拒變化", "score": 0}
]'),
('你如何管理自己的情緒？', 8, '[
  {"text": "能夠很好地控制情緒", "score": 3},
  {"text": "大部分時候能控制", "score": 2},
  {"text": "有時會情緒失控", "score": 1},
  {"text": "經常被情緒控制", "score": 0}
]'),
('你對目標的態度是？', 9, '[
  {"text": "設定明確目標並努力達成", "score": 3},
  {"text": "有目標但不太明確", "score": 2},
  {"text": "很少設定長期目標", "score": 1},
  {"text": "沒有明確的人生目標", "score": 0}
]'),
('你如何看待失敗？', 10, '[
  {"text": "失敗是學習的機會", "score": 3},
  {"text": "雖然難受但能接受", "score": 2},
  {"text": "很害怕失敗", "score": 1},
  {"text": "無法承受失敗", "score": 0}
]');