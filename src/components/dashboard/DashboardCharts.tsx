'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

interface LineDataPoint {
  date: string;
  score: number;
}

interface BarDataPoint {
  date: string;
  content: number;
  product: number;
}

interface PieDataPoint {
  name: string;
  value: number;
}

interface Props {
  lineData: LineDataPoint[];
  barData: BarDataPoint[];
  pieData: PieDataPoint[];
}

const PIE_COLORS = ['#ef4444', '#eab308', '#22c55e', '#6b7280'];

const tooltipStyle = {
  backgroundColor: '#1a1d27',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
};

export default function DashboardCharts({ lineData, barData, pieData }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

      {/* Line Chart */}
      <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5 lg:col-span-2">
        <h3 className="text-white font-semibold mb-1">Opportunity Score Over Time</h3>
        <p className="text-gray-500 text-xs mb-4">Average opportunity score per entry</p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} activeDot={{ r: 5 }} name="Avg Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-1">Analyses Over Time</h3>
        <p className="text-gray-500 text-xs mb-4">Content vs Product analyses per day</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
            <Bar dataKey="content" name="Content" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="product" name="Product" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-1">Growth by Priority</h3>
        <p className="text-gray-500 text-xs mb-4">Distribution of growth opportunity priorities</p>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
              {pieData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}