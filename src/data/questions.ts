// 分類別的心理測驗題目
import { TestQuestion } from "@/types";

// 家庭類別問題 (12題)
export const familyQuestions: TestQuestion[] = [
  {
    id: "family_1",
    question_text: "當家庭成員意見不合時，您通常：",
    question_order: 1,
    options: [
      { text: "主動調解，尋求雙方都能接受的解決方案", score: 3 },
      { text: "保持中立，讓他們自己解決", score: 2 },
      { text: "選擇支持其中一方", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_2",
    question_text: "面對家庭責任分工時，您的態度是：",
    question_order: 2,
    options: [
      { text: "主動承擔，甚至超出自己的份內工作", score: 3 },
      { text: "按照分工完成自己的責任", score: 2 },
      { text: "希望他人能多分擔一些", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_4",
    question_text: "當家人遇到困難時，您的反應是：",
    question_order: 3,
    options: [
      { text: "立即提供實質幫助和情感支持", score: 3 },
      { text: "詢問是否需要幫助，視情況提供協助", score: 2 },
      { text: "等他們主動求助再考慮如何幫忙", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_6",
    question_text: "在家庭決策過程中，您傾向於：",
    question_order: 4,
    options: [
      { text: "積極表達意見並參與討論", score: 3 },
      { text: "聽取各方意見後再表達看法", score: 2 },
      { text: "通常接受多數人的決定", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_8",
    question_text: "對於家庭中的隱私邊界，您認為：",
    question_order: 5,
    options: [
      { text: "家人之間應該開誠布公，沒有秘密", score: 1 },
      { text: "適度分享，但保留個人空間", score: 3 },
      { text: "各自保持獨立，不要過度干涉", score: 2 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_11",
    question_text: "當家庭成員犯錯時，您會：",
    question_order: 6,
    options: [
      { text: "先理解原因，然後給予建議和支持", score: 3 },
      { text: "指出錯誤，但避免過度責備", score: 2 },
      { text: "明確表達不滿，希望他們記住教訓", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_14",
    question_text: "當需要照顧年邁的父母時，您會：",
    question_order: 7,
    options: [
      { text: "主動承擔照顧責任，調整自己的生活", score: 3 },
      { text: "與兄弟姊妹分工合作照顧", score: 2 },
      { text: "提供經濟支持，由專業人員照顧", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_16",
    question_text: "對於家庭成員的個人選擇（如職業、伴侶），您：",
    question_order: 8,
    options: [
      { text: "完全尊重並支持他們的決定", score: 3 },
      { text: "給予建議但尊重最終決定", score: 2 },
      { text: "會表達自己的期望和要求", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_18",
    question_text: "當家庭面臨重大變化時（如搬家、失業），您：",
    question_order: 9,
    options: [
      { text: "積極規劃，幫助家人適應變化", score: 3 },
      { text: "保持樂觀，相信一切會好轉", score: 2 },
      { text: "感到焦慮，需要時間適應", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_20",
    question_text: "在家庭危機時（如疾病、意外），您的角色是：",
    question_order: 10,
    options: [
      { text: "成為家庭的支柱，協調各種事務", score: 3 },
      { text: "提供情感支持，分擔部分責任", score: 2 },
      { text: "配合家人的安排，盡力幫忙", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_25",
    question_text: "在家庭中表達愛意的方式，您傾向：",
    question_order: 11,
    options: [
      { text: "經常用言語和行動表達關愛", score: 3 },
      { text: "通過實際行動展現關心", score: 2 },
      { text: "認為家人之間不需要太多表達", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_30",
    question_text: "您認為理想的家庭關係應該是：",
    question_order: 12,
    options: [
      { text: "親密無間，彼此分享生活的每個細節", score: 2 },
      { text: "溫暖和諧，既親近又保持適當空間", score: 3 },
      { text: "相互尊重，各自獨立但適時聚會", score: 1 }
    ],
    created_at: new Date().toISOString()
  }
];

// 感情關係類別問題 (12題)
export const relationshipQuestions: TestQuestion[] = [
  {
    id: "relationship_1",
    question_text: "在戀愛關係中，您最重視：",
    question_order: 1,
    options: [
      { text: "情感的深度連結和心靈契合", score: 3 },
      { text: "共同的興趣和生活目標", score: 2 },
      { text: "相互的吸引力和激情", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_2",
    question_text: "當伴侶情緒低落時，您會：",
    question_order: 2,
    options: [
      { text: "主動關心並提供情感支持", score: 3 },
      { text: "給他們空間，但表示願意幫忙", score: 2 },
      { text: "等他們主動分享再提供協助", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_3",
    question_text: "在處理關係衝突時，您傾向於：",
    question_order: 3,
    options: [
      { text: "立即溝通，盡快解決問題", score: 3 },
      { text: "冷靜下來後再理性討論", score: 2 },
      { text: "避免衝突，希望時間能淡化問題", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_4",
    question_text: "對於伴侶的個人空間，您：",
    question_order: 4,
    options: [
      { text: "完全尊重，給予充分的自由", score: 3 },
      { text: "理解需要，但希望適度分享", score: 2 },
      { text: "希望能參與他們生活的各個面向", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_7",
    question_text: "對於關係中的未來規劃，您：",
    question_order: 5,
    options: [
      { text: "會主動討論並制定共同目標", score: 3 },
      { text: "有想法但等待合適時機討論", score: 2 },
      { text: "認為順其自然就好，不用急著規劃", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_10",
    question_text: "當伴侶犯錯時，您會：",
    question_order: 6,
    options: [
      { text: "先理解原因，然後一起討論解決", score: 3 },
      { text: "表達不滿但願意原諒", score: 2 },
      { text: "明確指出錯誤並要求改正", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_14",
    question_text: "當伴侶需要獨處時，您會：",
    question_order: 7,
    options: [
      { text: "完全理解並給予空間", score: 3 },
      { text: "雖然有點失落但會尊重", score: 2 },
      { text: "會想知道原因或感到被忽視", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_17",
    question_text: "當您感到被忽視時，會：",
    question_order: 8,
    options: [
      { text: "直接表達感受並討論改善方式", score: 3 },
      { text: "等待適當時機再提起", score: 2 },
      { text: "用行動暗示或等對方察覺", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_18",
    question_text: "對於關係中的信任，您認為：",
    question_order: 9,
    options: [
      { text: "是關係的基石，需要持續經營", score: 3 },
      { text: "很重要，但需要時間建立", score: 2 },
      { text: "是基本要求，一旦破壞很難修復", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_22",
    question_text: "在做重要決定時，您會：",
    question_order: 10,
    options: [
      { text: "一定要和伴侶商量並達成共識", score: 3 },
      { text: "考慮伴侶意見但保留最終決定權", score: 2 },
      { text: "自己做決定後再告知伴侶", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_25",
    question_text: "在關係中表達需求時，您：",
    question_order: 11,
    options: [
      { text: "會直接但溫和地表達需要", score: 3 },
      { text: "會暗示或等待對方察覺", score: 1 },
      { text: "只在真的很重要時才會說出來", score: 2 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_30",
    question_text: "您理想中的關係狀態是：",
    question_order: 12,
    options: [
      { text: "兩人如一體，分享生活的一切", score: 2 },
      { text: "親密但獨立，既相愛又保持自我", score: 3 },
      { text: "相互支持但各自有獨立的生活", score: 1 }
    ],
    created_at: new Date().toISOString()
  }
];

// 工作類別問題 (12題)
export const workQuestions: TestQuestion[] = [
  {
    id: "work_1",
    question_text: "面對工作壓力時，您的第一反應是：",
    question_order: 1,
    options: [
      { text: "制定計劃，分步驟解決問題", score: 3 },
      { text: "先處理緊急事務，邊做邊調整", score: 2 },
      { text: "感到焦慮，需要時間適應", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_2",
    question_text: "在團隊合作中，您通常扮演：",
    question_order: 2,
    options: [
      { text: "領導者，主動協調和分配任務", score: 3 },
      { text: "積極參與者，貢獻想法和執行", score: 2 },
      { text: "支持者，配合團隊完成工作", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_3",
    question_text: "當工作任務超出能力範圍時：",
    question_order: 3,
    options: [
      { text: "主動學習新技能，努力完成挑戰", score: 3 },
      { text: "尋求協助，與他人合作完成", score: 2 },
      { text: "坦承困難，請求重新分配任務", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_4",
    question_text: "對於工作與生活的平衡，您：",
    question_order: 4,
    options: [
      { text: "嚴格區分，下班後不處理工作", score: 2 },
      { text: "彈性調整，但優先保障個人時間", score: 3 },
      { text: "工作為重，必要時會犧牲個人時間", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_6",
    question_text: "面對工作上的批評時：",
    question_order: 5,
    options: [
      { text: "虛心接受並積極改進", score: 3 },
      { text: "分析批評的合理性再決定如何應對", score: 2 },
      { text: "感到不舒服，但會努力調適", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_9",
    question_text: "面對工作中的變化（如制度調整、人事異動）：",
    question_order: 6,
    options: [
      { text: "積極適應，甚至主動推動改變", score: 3 },
      { text: "保持開放態度，逐步適應新環境", score: 2 },
      { text: "感到不安，希望維持現狀", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_10",
    question_text: "在處理工作衝突時：",
    question_order: 7,
    options: [
      { text: "直接面對，努力找到解決方案", score: 3 },
      { text: "先了解各方立場再進行協調", score: 2 },
      { text: "避免捲入，希望由他人解決", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_12",
    question_text: "當工作遇到挫折時：",
    question_order: 8,
    options: [
      { text: "分析原因，調整方法繼續努力", score: 3 },
      { text: "稍作休息後重新投入", score: 2 },
      { text: "感到沮喪，需要時間恢復動力", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_17",
    question_text: "面對不公平的工作分配時：",
    question_order: 9,
    options: [
      { text: "直接與主管溝通，尋求合理解決", score: 3 },
      { text: "先觀察情況，選擇適當時機反映", score: 2 },
      { text: "默默承受，避免造成更多問題", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_18",
    question_text: "在工作創新方面，您：",
    question_order: 10,
    options: [
      { text: "經常提出新想法和改善建議", score: 3 },
      { text: "有好想法時會適時分享", score: 2 },
      { text: "主要執行既定的工作流程", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_22",
    question_text: "當需要做困難決定時：",
    question_order: 11,
    options: [
      { text: "收集資訊，分析利弊後決定", score: 3 },
      { text: "諮詢他人意見，綜合判斷", score: 2 },
      { text: "依直覺和經驗快速決定", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_30",
    question_text: "您理想的工作狀態是：",
    question_order: 12,
    options: [
      { text: "充滿挑戰，持續學習成長", score: 3 },
      { text: "穩定發展，工作生活平衡", score: 2 },
      { text: "輕鬆愉快，壓力不要太大", score: 1 }
    ],
    created_at: new Date().toISOString()
  }
];

// 個人思維類別問題 (12題)
export const personalQuestions: TestQuestion[] = [
  {
    id: "personal_1",
    question_text: "在面對重要決定時，您主要依據：",
    question_order: 1,
    options: [
      { text: "理性分析和邏輯思考", score: 2 },
      { text: "直覺感受和內心聲音", score: 1 },
      { text: "平衡理性和感性，綜合判斷", score: 3 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_2",
    question_text: "對於自我反思，您：",
    question_order: 2,
    options: [
      { text: "經常自省，定期檢視自己的行為和想法", score: 3 },
      { text: "偶爾會思考，特別是遇到問題時", score: 2 },
      { text: "很少自省，傾向於專注於外在事物", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_3",
    question_text: "面對挫折時，您的思維模式是：",
    question_order: 3,
    options: [
      { text: "尋找教訓和成長機會", score: 3 },
      { text: "分析失敗原因，避免重蹈覆轍", score: 2 },
      { text: "感到沮喪，需要時間恢復", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_5",
    question_text: "在學習新事物時，您傾向：",
    question_order: 4,
    options: [
      { text: "深入鑽研，徹底理解原理", score: 3 },
      { text: "掌握核心概念和實用技巧", score: 2 },
      { text: "學會基本操作就足夠了", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_7",
    question_text: "在解決問題時，您的思考方式是：",
    question_order: 5,
    options: [
      { text: "系統性分析，從多角度考慮", score: 3 },
      { text: "直接找核心問題，快速解決", score: 2 },
      { text: "依賴經驗和直覺判斷", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_9",
    question_text: "面對壓力時，您的應對策略是：",
    question_order: 6,
    options: [
      { text: "分析壓力來源，制定應對計劃", score: 3 },
      { text: "尋找放鬆方式，調節情緒狀態", score: 2 },
      { text: "忍耐等待，希望壓力自然消除", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_10",
    question_text: "對於自己的情緒管理：",
    question_order: 7,
    options: [
      { text: "能清楚識別並有效調節情緒", score: 3 },
      { text: "大多數時候能控制情緒反應", score: 2 },
      { text: "經常被情緒影響，難以控制", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_14",
    question_text: "對於失敗的看法：",
    question_order: 8,
    options: [
      { text: "是成功路上的必經階段和學習機會", score: 3 },
      { text: "雖然痛苦但能帶來經驗和成長", score: 2 },
      { text: "應該盡量避免，會打擊信心", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_17",
    question_text: "面對不確定性時：",
    question_order: 9,
    options: [
      { text: "保持開放心態，視為新機會", score: 3 },
      { text: "感到些許不安，但會努力適應", score: 2 },
      { text: "感到焦慮，希望快速獲得確定性", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_18",
    question_text: "對於自己的弱點，您會：",
    question_order: 10,
    options: [
      { text: "誠實面對，制定改善計劃", score: 3 },
      { text: "接受現實，發揮其他優勢", score: 2 },
      { text: "避免面對，希望他人不會注意", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_22",
    question_text: "對於自我改變，您的態度是：",
    question_order: 11,
    options: [
      { text: "主動尋求改變，持續自我優化", score: 3 },
      { text: "在需要時會努力改變", score: 2 },
      { text: "習慣現狀，不喜歡太大變化", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_30",
    question_text: "您理想中的個人狀態是：",
    question_order: 12,
    options: [
      { text: "內心平靜，持續成長，有明確方向", score: 3 },
      { text: "生活充實，工作順利，關係和諧", score: 2 },
      { text: "輕鬆愉快，沒有太多壓力和煩惱", score: 1 }
    ],
    created_at: new Date().toISOString()
  }
];

// 全面評估類別問題 (12題，每個類別選擇3題)
export const allQuestions: TestQuestion[] = [
  ...familyQuestions.slice(0, 3),
  ...relationshipQuestions.slice(0, 3),
  ...workQuestions.slice(0, 3),
  ...personalQuestions.slice(0, 3)
];

// 導出函數：根據類別獲取問題
export function getQuestionsByCategory(category: string): TestQuestion[] {
  switch (category) {
    case 'family':
      return familyQuestions;
    case 'relationship':
      return relationshipQuestions;
    case 'work':
      return workQuestions;
    case 'personal':
      return personalQuestions;
    case 'all':
      return allQuestions;
    default:
      return allQuestions;
  }
}
