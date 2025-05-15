import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ValuationChartProps {
  data: {
    month: string;
    value: number;
  }[];
}

export default function ValuationChart({ data }: ValuationChartProps) {
  return (
    <div className="w-full h-64 bg-white p-4 rounded-md shadow-sm">
      <h5 className="font-medium text-neutral-dark mb-2">3-Month History</h5>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`€${value}`, 'Value']}
            labelFormatter={(label) => `Period: ${label}`}
          />
          <Bar 
            dataKey="value" 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]} 
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
