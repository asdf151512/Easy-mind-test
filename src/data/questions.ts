// 分類別的心理測驗題目
import { TestQuestion } from "@/types";

// 家庭類別問題 (30題)
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
    id: "family_3",
    question_text: "在家庭聚會中，您通常：",
    question_order: 3,
    options: [
      { text: "積極參與對話，關心每個人的近況", score: 3 },
      { text: "適度參與，主要聽別人分享", score: 2 },
      { text: "比較安靜，除非被直接問到", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_4",
    question_text: "當家人遇到困難時，您的反應是：",
    question_order: 4,
    options: [
      { text: "立即提供實質幫助和情感支持", score: 3 },
      { text: "詢問是否需要幫助，視情況提供協助", score: 2 },
      { text: "等他們主動求助再考慮如何幫忙", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_5",
    question_text: "對於家庭傳統和價值觀，您：",
    question_order: 5,
    options: [
      { text: "非常重視並努力傳承給下一代", score: 3 },
      { text: "尊重傳統但會適度調整", score: 2 },
      { text: "認為應該與時俱進，不必拘泥於傳統", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_6",
    question_text: "在家庭決策過程中，您傾向於：",
    question_order: 6,
    options: [
      { text: "積極表達意見並參與討論", score: 3 },
      { text: "聽取各方意見後再表達看法", score: 2 },
      { text: "通常接受多數人的決定", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_7",
    question_text: "當您與父母或長輩意見不同時：",
    question_order: 7,
    options: [
      { text: "耐心溝通，努力讓他們理解我的想法", score: 3 },
      { text: "保持尊重，但堅持自己的立場", score: 2 },
      { text: "為了和諧，通常會妥協", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_8",
    question_text: "對於家庭中的隱私邊界，您認為：",
    question_order: 8,
    options: [
      { text: "家人之間應該開誠布公，沒有秘密", score: 1 },
      { text: "適度分享，但保留個人空間", score: 3 },
      { text: "各自保持獨立，不要過度干涉", score: 2 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_9",
    question_text: "在處理家庭衝突時，您最注重：",
    question_order: 9,
    options: [
      { text: "解決問題的實際效果", score: 2 },
      { text: "維護每個人的情感和關係", score: 3 },
      { text: "確保公平和原則", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_10",
    question_text: "對於家庭財務管理，您的參與程度：",
    question_order: 10,
    options: [
      { text: "積極參與規劃和決策", score: 3 },
      { text: "了解狀況但主要由他人負責", score: 2 },
      { text: "很少關心，相信家人會處理好", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_11",
    question_text: "當家庭成員犯錯時，您會：",
    question_order: 11,
    options: [
      { text: "先理解原因，然後給予建議和支持", score: 3 },
      { text: "指出錯誤，但避免過度責備", score: 2 },
      { text: "明確表達不滿，希望他們記住教訓", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_12",
    question_text: "在家庭時間的安排上，您優先考慮：",
    question_order: 12,
    options: [
      { text: "全家人的共同活動和相處時光", score: 3 },
      { text: "平衡家庭時間和個人空間", score: 2 },
      { text: "個人的興趣和需求", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_13",
    question_text: "對於家庭成員的成就，您的反應是：",
    question_order: 13,
    options: [
      { text: "由衷感到驕傲並大力慶祝", score: 3 },
      { text: "表達恭喜並給予鼓勵", score: 2 },
      { text: "認為這是他們應該做到的", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_14",
    question_text: "當需要照顧年邁的父母時，您會：",
    question_order: 14,
    options: [
      { text: "主動承擔照顧責任，調整自己的生活", score: 3 },
      { text: "與兄弟姊妹分工合作照顧", score: 2 },
      { text: "提供經濟支持，由專業人員照顧", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_15",
    question_text: "在家庭聚餐時，您通常：",
    question_order: 15,
    options: [
      { text: "主動準備食物和安排聚會", score: 3 },
      { text: "協助準備並參與聚會", score: 2 },
      { text: "參加聚會，主要享受家人陪伴", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_16",
    question_text: "對於家庭成員的個人選擇（如職業、伴侶），您：",
    question_order: 16,
    options: [
      { text: "完全尊重並支持他們的決定", score: 3 },
      { text: "給予建議但尊重最終決定", score: 2 },
      { text: "會表達自己的期望和要求", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_17",
    question_text: "在家庭溝通中，您最擅長：",
    question_order: 17,
    options: [
      { text: "傾聽他人的想法和感受", score: 3 },
      { text: "表達自己的觀點和需求", score: 2 },
      { text: "協調不同的意見和立場", score: 2 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_18",
    question_text: "當家庭面臨重大變化時（如搬家、失業），您：",
    question_order: 18,
    options: [
      { text: "積極規劃，幫助家人適應變化", score: 3 },
      { text: "保持樂觀，相信一切會好轉", score: 2 },
      { text: "感到焦慮，需要時間適應", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_19",
    question_text: "對於家庭成員的缺點，您的態度是：",
    question_order: 19,
    options: [
      { text: "接納並嘗試幫助他們改善", score: 3 },
      { text: "學習包容，但會適時提醒", score: 2 },
      { text: "直接指出，希望他們能改正", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_20",
    question_text: "在家庭危機時（如疾病、意外），您的角色是：",
    question_order: 20,
    options: [
      { text: "成為家庭的支柱，協調各種事務", score: 3 },
      { text: "提供情感支持，分擔部分責任", score: 2 },
      { text: "配合家人的安排，盡力幫忙", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_21",
    question_text: "對於家庭記憶和歷史，您：",
    question_order: 21,
    options: [
      { text: "積極記錄和保存，經常與家人分享", score: 3 },
      { text: "珍惜這些回憶，偶爾會談起", score: 2 },
      { text: "認為重要的是現在和未來", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_22",
    question_text: "當您的配偶與您的家人有摩擦時：",
    question_order: 22,
    options: [
      { text: "努力協調雙方，尋求理解", score: 3 },
      { text: "保持中立，避免選邊站", score: 2 },
      { text: "支持自己的家人", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_23",
    question_text: "在教育子女方面，您認為最重要的是：",
    question_order: 23,
    options: [
      { text: "培養他們的品格和價值觀", score: 3 },
      { text: "讓他們獲得良好的教育和技能", score: 2 },
      { text: "給他們自由探索和選擇的空間", score: 2 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_24",
    question_text: "對於家庭的未來規劃，您：",
    question_order: 24,
    options: [
      { text: "會詳細規劃並與家人討論", score: 3 },
      { text: "有大概的想法，但保持彈性", score: 2 },
      { text: "相信順其自然，不用過度規劃", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_25",
    question_text: "在家庭中表達愛意的方式，您傾向：",
    question_order: 25,
    options: [
      { text: "經常用言語和行動表達關愛", score: 3 },
      { text: "通過實際行動展現關心", score: 2 },
      { text: "認為家人之間不需要太多表達", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_26",
    question_text: "當家庭成員需要您的時間和陪伴時：",
    question_order: 26,
    options: [
      { text: "會調整自己的安排優先陪伴", score: 3 },
      { text: "在可能的情況下提供陪伴", score: 2 },
      { text: "如果時間允許會陪伴他們", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_27",
    question_text: "對於家庭規則和界限，您認為：",
    question_order: 27,
    options: [
      { text: "應該明確制定並大家共同遵守", score: 2 },
      { text: "需要但要保持彈性，因人而異", score: 3 },
      { text: "不需要太多規則，相互尊重就好", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_28",
    question_text: "在家庭聚會中遇到敏感話題時：",
    question_order: 28,
    options: [
      { text: "巧妙轉移話題，維護和諧氣氛", score: 3 },
      { text: "保持沈默，避免參與討論", score: 1 },
      { text: "會表達自己的真實想法", score: 2 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_29",
    question_text: "對於家庭成員的個人隱私，您：",
    question_order: 29,
    options: [
      { text: "完全尊重，不會主動打聽", score: 3 },
      { text: "基於關心會適度了解", score: 2 },
      { text: "認為家人之間不應該有秘密", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "family_30",
    question_text: "您認為理想的家庭關係應該是：",
    question_order: 30,
    options: [
      { text: "親密無間，彼此分享生活的每個細節", score: 2 },
      { text: "溫暖和諧，既親近又保持適當空間", score: 3 },
      { text: "相互尊重，各自獨立但適時聚會", score: 1 }
    ],
    created_at: new Date().toISOString()
  }
];

// 感情關係類別問題 (30題)
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
    id: "relationship_5",
    question_text: "在表達愛意方面，您最常：",
    question_order: 5,
    options: [
      { text: "用言語直接表達愛和關心", score: 2 },
      { text: "通過貼心的行動表現愛意", score: 3 },
      { text: "通過身體接觸傳達感情", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_6",
    question_text: "當您和伴侶意見不合時：",
    question_order: 6,
    options: [
      { text: "努力理解對方的觀點並尋求共識", score: 3 },
      { text: "堅持自己的立場但願意妥協", score: 2 },
      { text: "認為各有各的想法是正常的", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_7",
    question_text: "對於關係中的未來規劃，您：",
    question_order: 7,
    options: [
      { text: "會主動討論並制定共同目標", score: 3 },
      { text: "有想法但等待合適時機討論", score: 2 },
      { text: "認為順其自然就好，不用急著規劃", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_8",
    question_text: "在關係中遇到挫折時，您會：",
    question_order: 8,
    options: [
      { text: "積極面對，努力改善關係", score: 3 },
      { text: "給彼此時間和空間冷靜思考", score: 2 },
      { text: "考慮是否這段關係適合繼續", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_9",
    question_text: "對於伴侶的朋友圈，您的態度是：",
    question_order: 9,
    options: [
      { text: "積極融入，努力與他們建立友誼", score: 3 },
      { text: "保持友善，但維持適當距離", score: 2 },
      { text: "不太在意，各自維持自己的朋友圈", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_10",
    question_text: "當伴侶犯錯時，您會：",
    question_order: 10,
    options: [
      { text: "先理解原因，然後一起討論解決", score: 3 },
      { text: "表達不滿但願意原諒", score: 2 },
      { text: "明確指出錯誤並要求改正", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_11",
    question_text: "在財務管理方面，您傾向：",
    question_order: 11,
    options: [
      { text: "完全透明，共同討論所有支出", score: 3 },
      { text: "大額支出討論，小額支出各自決定", score: 2 },
      { text: "各自管理自己的財務", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_12",
    question_text: "對於伴侶的職業發展，您：",
    question_order: 12,
    options: [
      { text: "全力支持，甚至願意犧牲自己的機會", score: 3 },
      { text: "支持但也考慮對關係的影響", score: 2 },
      { text: "支持但不會因此改變自己的計劃", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_13",
    question_text: "在日常溝通中，您最注重：",
    question_order: 13,
    options: [
      { text: "深度的心靈交流和情感分享", score: 3 },
      { text: "實用的資訊交換和計劃討論", score: 2 },
      { text: "輕鬆愉快的聊天和互動", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_14",
    question_text: "當伴侶需要獨處時，您會：",
    question_order: 14,
    options: [
      { text: "完全理解並給予空間", score: 3 },
      { text: "雖然有點失落但會尊重", score: 2 },
      { text: "會想知道原因或感到被忽視", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_15",
    question_text: "對於關係中的浪漫元素，您：",
    question_order: 15,
    options: [
      { text: "認為非常重要，會主動創造浪漫", score: 3 },
      { text: "喜歡但不強求，順其自然", score: 2 },
      { text: "認為實際的關心比浪漫更重要", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_16",
    question_text: "在處理伴侶家人關係時：",
    question_order: 16,
    options: [
      { text: "努力融入，視如己出", score: 3 },
      { text: "保持禮貌友善的關係", score: 2 },
      { text: "維持基本尊重，但保持距離", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_17",
    question_text: "當您感到被忽視時，會：",
    question_order: 17,
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
    question_order: 18,
    options: [
      { text: "是關係的基石，需要持續經營", score: 3 },
      { text: "很重要，但需要時間建立", score: 2 },
      { text: "是基本要求，一旦破壞很難修復", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_19",
    question_text: "在面對長距離關係時，您會：",
    question_order: 19,
    options: [
      { text: "努力維持聯繫，增加見面機會", score: 3 },
      { text: "保持關係但也為分離做心理準備", score: 2 },
      { text: "認為長距離關係很難維持", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_20",
    question_text: "當關係進入平淡期時：",
    question_order: 20,
    options: [
      { text: "主動創造新鮮感和驚喜", score: 3 },
      { text: "接受這是關係的自然階段", score: 2 },
      { text: "開始質疑關係是否還有激情", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_21",
    question_text: "對於伴侶的過去，您：",
    question_order: 21,
    options: [
      { text: "完全接受，過去不影響現在", score: 3 },
      { text: "需要了解但不會過度追究", score: 2 },
      { text: "會在意某些過去的經歷", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_22",
    question_text: "在做重要決定時，您會：",
    question_order: 22,
    options: [
      { text: "一定要和伴侶商量並達成共識", score: 3 },
      { text: "考慮伴侶意見但保留最終決定權", score: 2 },
      { text: "自己做決定後再告知伴侶", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_23",
    question_text: "對於關係中的個人成長，您認為：",
    question_order: 23,
    options: [
      { text: "兩人應該一起成長，相互促進", score: 3 },
      { text: "在關係中保持個人發展很重要", score: 2 },
      { text: "個人成長可能會影響關係穩定", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_24",
    question_text: "當伴侶成功時，您的感受是：",
    question_order: 24,
    options: [
      { text: "由衷為他們感到驕傲和高興", score: 3 },
      { text: "感到高興，同時也有動力提升自己", score: 2 },
      { text: "高興之餘也有些壓力或競爭感", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_25",
    question_text: "在關係中表達需求時，您：",
    question_order: 25,
    options: [
      { text: "會直接但溫和地表達需要", score: 3 },
      { text: "會暗示或等待對方察覺", score: 1 },
      { text: "只在真的很重要時才會說出來", score: 2 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_26",
    question_text: "對於關係中的妥協，您認為：",
    question_order: 26,
    options: [
      { text: "是維持關係和諧的必要手段", score: 2 },
      { text: "應該建立在相互理解的基礎上", score: 3 },
      { text: "不應該妥協核心價值和原則", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_27",
    question_text: "當感到關係出現問題時：",
    question_order: 27,
    options: [
      { text: "會主動提出討論並尋求解決", score: 3 },
      { text: "觀察一段時間後再決定是否討論", score: 2 },
      { text: "希望問題能自然解決", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_28",
    question_text: "對於伴侶的缺點，您會：",
    question_order: 28,
    options: [
      { text: "接納並嘗試幫助改善", score: 3 },
      { text: "接受是人都有缺點的事實", score: 2 },
      { text: "期望他們能為了關係而改變", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_29",
    question_text: "在節慶或特殊日子時，您：",
    question_order: 29,
    options: [
      { text: "會精心準備慶祝和禮物", score: 3 },
      { text: "會慶祝但不會過度隆重", score: 2 },
      { text: "認為心意比形式更重要", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "relationship_30",
    question_text: "您理想中的關係狀態是：",
    question_order: 30,
    options: [
      { text: "兩人如一體，分享生活的一切", score: 2 },
      { text: "親密但獨立，既相愛又保持自我", score: 3 },
      { text: "相互支持但各自有獨立的生活", score: 1 }
    ],
    created_at: new Date().toISOString()
  }
];

// 工作類別問題 (30題)
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
    id: "work_5",
    question_text: "在職場溝通中，您最注重：",
    question_order: 5,
    options: [
      { text: "清晰準確地傳達資訊", score: 2 },
      { text: "建立良好的人際關係", score: 3 },
      { text: "高效率地完成溝通目的", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_6",
    question_text: "面對工作上的批評時：",
    question_order: 6,
    options: [
      { text: "虛心接受並積極改進", score: 3 },
      { text: "分析批評的合理性再決定如何應對", score: 2 },
      { text: "感到不舒服，但會努力調適", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_7",
    question_text: "對於職業發展，您的策略是：",
    question_order: 7,
    options: [
      { text: "制定明確目標，按部就班地執行", score: 3 },
      { text: "把握機會，靈活調整發展方向", score: 2 },
      { text: "順其自然，相信努力會有回報", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_8",
    question_text: "當同事需要幫助時：",
    question_order: 8,
    options: [
      { text: "主動提供協助，即使影響自己的進度", score: 3 },
      { text: "在不影響自己工作的前提下幫忙", score: 2 },
      { text: "等他們主動求助再考慮是否幫助", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_9",
    question_text: "面對工作中的變化（如制度調整、人事異動）：",
    question_order: 9,
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
    question_order: 10,
    options: [
      { text: "直接面對，努力找到解決方案", score: 3 },
      { text: "先了解各方立場再進行協調", score: 2 },
      { text: "避免捲入，希望由他人解決", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_11",
    question_text: "對於工作的完美程度，您：",
    question_order: 11,
    options: [
      { text: "追求高品質，即使需要更多時間", score: 2 },
      { text: "在品質和效率間找到平衡", score: 3 },
      { text: "優先完成任務，品質符合要求即可", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_12",
    question_text: "當工作遇到挫折時：",
    question_order: 12,
    options: [
      { text: "分析原因，調整方法繼續努力", score: 3 },
      { text: "稍作休息後重新投入", score: 2 },
      { text: "感到沮喪，需要時間恢復動力", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_13",
    question_text: "在職場學習方面，您：",
    question_order: 13,
    options: [
      { text: "主動尋找學習機會，持續提升技能", score: 3 },
      { text: "根據工作需要進行相關學習", score: 2 },
      { text: "主要依靠工作經驗累積", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_14",
    question_text: "對於加班的態度：",
    question_order: 14,
    options: [
      { text: "必要時願意加班，但會提高工作效率", score: 2 },
      { text: "盡量在工作時間內完成，避免加班", score: 3 },
      { text: "經常加班，認為這是工作投入的表現", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_15",
    question_text: "在工作報告或簡報時：",
    question_order: 15,
    options: [
      { text: "充分準備，力求內容完整準確", score: 3 },
      { text: "重點準備，確保核心資訊清楚", score: 2 },
      { text: "感到緊張，但會努力完成", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_16",
    question_text: "當工作缺乏挑戰性時：",
    question_order: 16,
    options: [
      { text: "主動尋找新的挑戰和學習機會", score: 3 },
      { text: "專注做好本職工作，等待機會", score: 2 },
      { text: "享受輕鬆的工作環境", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_17",
    question_text: "面對不公平的工作分配時：",
    question_order: 17,
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
    question_order: 18,
    options: [
      { text: "經常提出新想法和改善建議", score: 3 },
      { text: "有好想法時會適時分享", score: 2 },
      { text: "主要執行既定的工作流程", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_19",
    question_text: "對於工作績效評估：",
    question_order: 19,
    options: [
      { text: "積極配合，視為改善的機會", score: 3 },
      { text: "正常參與，關注評估結果", score: 2 },
      { text: "感到壓力，擔心評估結果", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_20",
    question_text: "在處理多項任務時：",
    question_order: 20,
    options: [
      { text: "制定優先順序，系統性地處理", score: 3 },
      { text: "靈活切換，根據情況調整", score: 2 },
      { text: "感到壓力，容易出現疏漏", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_21",
    question_text: "對於職場人際關係：",
    question_order: 21,
    options: [
      { text: "主動建立良好關係，認為很重要", score: 3 },
      { text: "保持友善，但專注於工作本身", score: 2 },
      { text: "維持基本禮貌，避免過度互動", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_22",
    question_text: "當需要做困難決定時：",
    question_order: 22,
    options: [
      { text: "收集資訊，分析利弊後決定", score: 3 },
      { text: "諮詢他人意見，綜合判斷", score: 2 },
      { text: "依直覺和經驗快速決定", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_23",
    question_text: "面對工作中的道德兩難時：",
    question_order: 23,
    options: [
      { text: "堅持原則，即使可能面臨困難", score: 3 },
      { text: "在原則和現實間尋找平衡", score: 2 },
      { text: "優先考慮實際利益和後果", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_24",
    question_text: "對於工作環境的要求：",
    question_order: 24,
    options: [
      { text: "希望有挑戰性，能促進成長", score: 3 },
      { text: "平衡挑戰與穩定，適度成長", score: 2 },
      { text: "穩定安全，工作壓力不要太大", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_25",
    question_text: "在工作溝通中遇到誤解時：",
    question_order: 25,
    options: [
      { text: "立即澄清，確保理解一致", score: 3 },
      { text: "找適當機會解釋清楚", score: 2 },
      { text: "希望誤解能自然消除", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_26",
    question_text: "對於工作中的競爭：",
    question_order: 26,
    options: [
      { text: "視為成長動力，良性競爭", score: 3 },
      { text: "接受競爭但重視團隊合作", score: 2 },
      { text: "不喜歡競爭，希望和諧共事", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_27",
    question_text: "當工作影響健康時：",
    question_order: 27,
    options: [
      { text: "立即調整工作方式，健康優先", score: 3 },
      { text: "尋找平衡，逐步改善情況", score: 2 },
      { text: "為了工作目標願意暫時犧牲", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_28",
    question_text: "面對職場變革時：",
    question_order: 28,
    options: [
      { text: "積極參與，努力成為變革的推動者", score: 3 },
      { text: "保持開放，配合組織的變革", score: 2 },
      { text: "被動接受，希望變革盡快穩定", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_29",
    question_text: "對於工作成就的定義：",
    question_order: 29,
    options: [
      { text: "個人成長和能力提升", score: 3 },
      { text: "團隊成功和組織貢獻", score: 2 },
      { text: "薪資增長和職位晉升", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "work_30",
    question_text: "您理想的工作狀態是：",
    question_order: 30,
    options: [
      { text: "充滿挑戰，持續學習成長", score: 3 },
      { text: "穩定發展，工作生活平衡", score: 2 },
      { text: "輕鬆愉快，壓力不要太大", score: 1 }
    ],
    created_at: new Date().toISOString()
  }
];

// 個人思維類別問題 (30題)
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
    id: "personal_4",
    question_text: "對於未來的規劃，您：",
    question_order: 4,
    options: [
      { text: "制定詳細的長期和短期目標", score: 3 },
      { text: "有大方向，但保持彈性調整", score: 2 },
      { text: "相信順其自然，不做過多規劃", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_5",
    question_text: "在學習新事物時，您傾向：",
    question_order: 5,
    options: [
      { text: "深入鑽研，徹底理解原理", score: 3 },
      { text: "掌握核心概念和實用技巧", score: 2 },
      { text: "學會基本操作就足夠了", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_6",
    question_text: "對於他人的批評，您會：",
    question_order: 6,
    options: [
      { text: "仔細思考其合理性，取其精華", score: 3 },
      { text: "有選擇性地接受，過濾負面情緒", score: 2 },
      { text: "感到受傷，難以客觀看待", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_7",
    question_text: "在解決問題時，您的思考方式是：",
    question_order: 7,
    options: [
      { text: "系統性分析，從多角度考慮", score: 3 },
      { text: "直接找核心問題，快速解決", score: 2 },
      { text: "依賴經驗和直覺判斷", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_8",
    question_text: "對於個人價值觀，您：",
    question_order: 8,
    options: [
      { text: "有明確的核心價值，並努力踐行", score: 3 },
      { text: "在不同情況下會有所調整", score: 2 },
      { text: "還在探索和形成過程中", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_9",
    question_text: "面對壓力時，您的應對策略是：",
    question_order: 9,
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
    question_order: 10,
    options: [
      { text: "能清楚識別並有效調節情緒", score: 3 },
      { text: "大多數時候能控制情緒反應", score: 2 },
      { text: "經常被情緒影響，難以控制", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_11",
    question_text: "在思考人生意義時，您關注：",
    question_order: 11,
    options: [
      { text: "如何實現自我價值和幫助他人", score: 3 },
      { text: "如何在工作和生活中找到滿足", score: 2 },
      { text: "如何享受當下的快樂時光", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_12",
    question_text: "對於個人成長，您認為最重要的是：",
    question_order: 12,
    options: [
      { text: "持續學習和自我提升", score: 3 },
      { text: "建立良好的人際關係", score: 2 },
      { text: "維持身心健康和生活平衡", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_13",
    question_text: "在做重要決定前，您會：",
    question_order: 13,
    options: [
      { text: "廣泛收集資訊，深思熟慮", score: 3 },
      { text: "諮詢信任的人，聽取建議", score: 2 },
      { text: "相信第一直覺，快速決定", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_14",
    question_text: "對於失敗的看法：",
    question_order: 14,
    options: [
      { text: "是成功路上的必經階段和學習機會", score: 3 },
      { text: "雖然痛苦但能帶來經驗和成長", score: 2 },
      { text: "應該盡量避免，會打擊信心", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_15",
    question_text: "在獨處時，您通常：",
    question_order: 15,
    options: [
      { text: "思考人生，進行深度自省", score: 3 },
      { text: "放鬆休息，做自己喜歡的事", score: 2 },
      { text: "感到孤單，希望有人陪伴", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_16",
    question_text: "對於他人的建議，您：",
    question_order: 16,
    options: [
      { text: "認真考慮，結合自己的判斷", score: 3 },
      { text: "選擇性接受，保持獨立思考", score: 2 },
      { text: "容易受影響，經常改變想法", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_17",
    question_text: "面對不確定性時：",
    question_order: 17,
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
    question_order: 18,
    options: [
      { text: "誠實面對，制定改善計劃", score: 3 },
      { text: "接受現實，發揮其他優勢", score: 2 },
      { text: "避免面對，希望他人不會注意", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_19",
    question_text: "在設定目標時，您傾向：",
    question_order: 19,
    options: [
      { text: "設定挑戰性目標，推動自己成長", score: 3 },
      { text: "設定現實可達成的目標", score: 2 },
      { text: "避免設定太具體的目標，保持彈性", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_20",
    question_text: "對於過去的經歷，您：",
    question_order: 20,
    options: [
      { text: "從中學習，不後悔任何決定", score: 3 },
      { text: "大多能釋懷，偶爾會有遺憾", score: 2 },
      { text: "經常回想，有些經歷讓您耿耿於懷", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_21",
    question_text: "在面對道德兩難時：",
    question_order: 21,
    options: [
      { text: "堅持核心價值，做對的事", score: 3 },
      { text: "權衡利弊，尋找最佳平衡", score: 2 },
      { text: "感到困惑，難以做出決定", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_22",
    question_text: "對於自我改變，您的態度是：",
    question_order: 22,
    options: [
      { text: "主動尋求改變，持續自我優化", score: 3 },
      { text: "在需要時會努力改變", score: 2 },
      { text: "習慣現狀，不喜歡太大變化", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_23",
    question_text: "在思考問題時，您更關注：",
    question_order: 23,
    options: [
      { text: "深層原因和根本邏輯", score: 3 },
      { text: "實際影響和具體後果", score: 2 },
      { text: "直接的表面現象", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_24",
    question_text: "對於個人隱私，您：",
    question_order: 24,
    options: [
      { text: "非常重視，只與信任的人分享", score: 3 },
      { text: "適度分享，保持一定界限", score: 2 },
      { text: "相對開放，不太在意隱私", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_25",
    question_text: "在追求理想時，您會：",
    question_order: 25,
    options: [
      { text: "全力以赴，即使面臨困難", score: 3 },
      { text: "努力追求，但也考慮現實因素", score: 2 },
      { text: "量力而行，不給自己太大壓力", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_26",
    question_text: "對於內心的聲音，您：",
    question_order: 26,
    options: [
      { text: "經常傾聽並重視直覺感受", score: 3 },
      { text: "偶爾關注，但以理性為主", score: 2 },
      { text: "很少注意內心感受", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_27",
    question_text: "面對他人的期望時：",
    question_order: 27,
    options: [
      { text: "會考慮但不會完全受其左右", score: 3 },
      { text: "努力滿足，但保持自己的底線", score: 2 },
      { text: "容易被期望影響，改變自己的決定", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_28",
    question_text: "在評價自己時，您傾向：",
    question_order: 28,
    options: [
      { text: "客觀分析自己的優缺點", score: 3 },
      { text: "比較注重自己的優點", score: 2 },
      { text: "經常自我批評，關注缺點", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_29",
    question_text: "對於人生的意義，您認為：",
    question_order: 29,
    options: [
      { text: "在於實現自我價值和幫助他人", score: 3 },
      { text: "在於體驗豐富的人生經歷", score: 2 },
      { text: "在於獲得快樂和滿足感", score: 1 }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: "personal_30",
    question_text: "您理想中的個人狀態是：",
    question_order: 30,
    options: [
      { text: "內心平靜，持續成長，有明確方向", score: 3 },
      { text: "生活充實，工作順利，關係和諧", score: 2 },
      { text: "輕鬆愉快，沒有太多壓力和煩惱", score: 1 }
    ],
    created_at: new Date().toISOString()
  }
];

// 全面評估類別問題 (30題，每個類別選擇代表性問題)
export const allQuestions: TestQuestion[] = [
  // 家庭相關 (7題)
  ...familyQuestions.slice(0, 7),
  // 感情關係相關 (8題)
  ...relationshipQuestions.slice(0, 8),
  // 工作相關 (8題)
  ...workQuestions.slice(0, 8),
  // 個人思維相關 (7題)
  ...personalQuestions.slice(0, 7)
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