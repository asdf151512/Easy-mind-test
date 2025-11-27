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
  return (
    <div className="w-full h-96 mb-6">
      <h4 className="text-lg font-semibold mb-4 text-center">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="60%">
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