import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ScenarioDataPoint {
  month: string;
  realistic: number;
  optimistic: number;
  pessimistic: number;
  baseline?: number;
}

interface MultiScenarioChartProps {
  data: ScenarioDataPoint[];
  height?: number;
}

export const MultiScenarioChart: React.FC<MultiScenarioChartProps> = ({
  data,
  height = 400,
}) => {
  const hasBaseline = data.some((d) => d.baseline !== undefined);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradRealistic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e65000" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#e65000" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradOptimistic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPessimistic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }}
            dy={15}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />

          <Tooltip
            contentStyle={{
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              fontWeight: 'bold',
              fontSize: '12px',
            }}
          />

          <Legend
            verticalAlign="top"
            height={40}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: '10px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          />

          {/* Pessimistic - bottom layer */}
          <Area
            type="monotone"
            dataKey="pessimistic"
            name="Pessimiste"
            stroke="#ef4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#gradPessimistic)"
            animationDuration={1200}
          />

          {/* Optimistic - middle layer */}
          <Area
            type="monotone"
            dataKey="optimistic"
            name="Optimiste"
            stroke="#22c55e"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#gradOptimistic)"
            animationDuration={1200}
          />

          {/* Realistic - top layer */}
          <Area
            type="monotone"
            dataKey="realistic"
            name="Realiste"
            stroke="#e65000"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#gradRealistic)"
            animationDuration={1200}
          />

          {/* Baseline dashed line */}
          {hasBaseline && (
            <Area
              type="monotone"
              dataKey="baseline"
              name="Reference"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="8 4"
              fillOpacity={0}
              fill="none"
              dot={false}
              animationDuration={1200}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MultiScenarioChart;
