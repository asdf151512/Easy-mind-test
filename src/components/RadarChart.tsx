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
    const offset = 50; // 可以調整這個值，原本大約是 15-20
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
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={18}
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
      <div className="text-center text-sm text-gray-600 mt-2">
        <p>得分範圍：0-100分，分數越高表示該領域表現越好</p>
      </div>
    </div>
  );
};

export default RadarChart;