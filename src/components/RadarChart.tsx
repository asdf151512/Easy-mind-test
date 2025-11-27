import React from 'react';
import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface RadarChartProps {
  data: Array<{
    subject: string;
    score: number;
    fullMark: number;
  }>;
  title?: string;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, title = "能力雷達圖" }) => {
  // 自定義標籤渲染函數
  const renderCustomAxisTick = ({ payload, x, y, cx, cy }: any) => {
    // 計算從中心到當前點的角度
    const angle = Math.atan2(y - cy, x - cx);
    // 增加距離（offset 越大，標籤離得越遠）
    const offset = 35; // 可以調整這個值，原本大約是 15-20
    const newX = cx + (x - cx + Math.cos(angle) * offset);
    const newY = cy + (y - cy + Math.sin(angle) * offset);
    
    return (
      <text
        x={newX}
        y={newY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={14}
        fill="#374151"
        fontWeight={500}
      >
        {payload.value}
      </text>
    );
  };
  return (
    <div className="w-full h-96 mb-6">
      <h4 className="text-lg font-semibold mb-4 text-center">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 14, fill: '#374151', fontWeight: 500 }}
            tick={renderCustomAxisTick}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickCount={6}
            axisLine={false}
          />
          <Radar
            name="得分"
            dataKey="score"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
      
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 sm:p-6 shadow-sm">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">答題分析</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
          得分範圍：0-100分，分數越高表示該領域表現越好
        </p>
        
        {/* 三個統計數字 - 改用更好的響應式佈局 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          {/* 高分回答 */}
          <div className="flex flex-col items-center p-3 sm:p-4 bg-white rounded-xl shadow-sm">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-600 mb-1 sm:mb-2">
              18
            </div>
            <div className="text-xs sm:text-sm text-gray-600 text-center whitespace-nowrap">
              高分回答
            </div>
          </div>
          
          {/* 中等回答 */}
          <div className="flex flex-col items-center p-3 sm:p-4 bg-white rounded-xl shadow-sm">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-orange-500 mb-1 sm:mb-2">
              12
            </div>
            <div className="text-xs sm:text-sm text-gray-600 text-center whitespace-nowrap">
              中等回答
            </div>
          </div>
          
          {/* 低分回答 */}
          <div className="flex flex-col items-center p-3 sm:p-4 bg-white rounded-xl shadow-sm">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-red-600 mb-1 sm:mb-2">
              0
            </div>
            <div className="text-xs sm:text-sm text-gray-600 text-center whitespace-nowrap">
              低分回答
            </div>
          </div>
        </div>
        
        {/* 總題數 */}
        <div className="text-center text-sm sm:text-base text-gray-600 pt-3 sm:pt-4 border-t border-gray-200">
          總題數：<span className="font-semibold text-gray-800">30</span> 題
        </div>
      </div>
    </div>
  );
};

export default RadarChart;