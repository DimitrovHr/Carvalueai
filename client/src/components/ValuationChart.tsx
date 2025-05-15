import { 
  BarChart, 
  Bar, 
  LineChart,
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from "recharts";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

interface ValuationChartProps {
  data: {
    month: string;
    value: number;
  }[];
  forecast?: {
    month: string;
    value: number;
  }[];
  marketTrend?: number; // percentage change
  compareData?: {
    month: string;
    value: number;
    comparableValue: number;
    marketAverage: number;
  }[];
  chartType?: 'bar' | 'line' | 'area' | 'comparison';
}

export default function ValuationChart({ 
  data, 
  forecast = [], 
  marketTrend = 0, 
  compareData = [],
  chartType = 'bar' 
}: ValuationChartProps) {
  const [animated, setAnimated] = useState(false);
  const [selectedChart, setSelectedChart] = useState<'bar' | 'line' | 'area' | 'comparison'>(chartType);
  
  // Animate the chart once when it's first rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Market trend indicator animation
  const trendAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: 0.8 }
  };
  
  // Chart switching buttons
  const ChartTypeSelector = () => (
    <div className="flex space-x-2 text-xs mb-3">
      <button 
        onClick={() => setSelectedChart('bar')}
        className={`px-2 py-1 rounded ${selectedChart === 'bar' ? 'bg-primary text-white' : 'bg-gray-100'}`}
      >
        Bar
      </button>
      <button 
        onClick={() => setSelectedChart('line')}
        className={`px-2 py-1 rounded ${selectedChart === 'line' ? 'bg-primary text-white' : 'bg-gray-100'}`}
      >
        Line
      </button>
      <button 
        onClick={() => setSelectedChart('area')}
        className={`px-2 py-1 rounded ${selectedChart === 'area' ? 'bg-primary text-white' : 'bg-gray-100'}`}
      >
        Area
      </button>
      {compareData.length > 0 && (
        <button 
          onClick={() => setSelectedChart('comparison')}
          className={`px-2 py-1 rounded ${selectedChart === 'comparison' ? 'bg-primary text-white' : 'bg-gray-100'}`}
        >
          Compare
        </button>
      )}
    </div>
  );
  
  // Trend indicator component with animation
  const TrendIndicator = () => (
    <motion.div 
      className={`flex items-center mt-1 text-sm ${marketTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}
      initial="initial"
      animate={animated ? "animate" : "initial"}
      variants={trendAnimation}
    >
      {marketTrend >= 0 ? (
        <ArrowUpRight className="h-4 w-4 mr-1" />
      ) : (
        <ArrowDownRight className="h-4 w-4 mr-1" />
      )}
      <span className="font-medium">{Math.abs(marketTrend)}% {marketTrend >= 0 ? 'increase' : 'decrease'}</span>
    </motion.div>
  );
  
  // Render different chart types
  const renderChart = () => {
    const commonProps = {
      margin: { top: 5, right: 20, left: 20, bottom: 5 },
      data: data
    };
    
    switch (selectedChart) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={['dataMin - 500', 'dataMax + 500']} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Value']}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              isAnimationActive={!animated}
              animationDuration={1500}
            />
            {forecast.length > 0 && (
              <Line 
                type="monotone" 
                data={forecast}
                dataKey="value" 
                stroke="#888"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2 }}
                name="Forecast"
                isAnimationActive={!animated}
                animationDuration={1500}
                animationBegin={500}
              />
            )}
            <ReferenceLine
              y={data[data.length - 1]?.value}
              stroke="#888"
              strokeDasharray="3 3"
              label="Current"
            />
          </LineChart>
        );
        
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={['dataMin - 500', 'dataMax + 500']} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Value']}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
              isAnimationActive={!animated}
              animationDuration={1500}
            />
            {forecast.length > 0 && (
              <Area 
                type="monotone" 
                data={forecast}
                dataKey="value" 
                stroke="#888"
                fill="#888"
                fillOpacity={0.1}
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Forecast"
                isAnimationActive={!animated}
                animationDuration={1500}
                animationBegin={500}
              />
            )}
          </AreaChart>
        );
        
      case 'comparison':
        if (compareData.length === 0) return renderBarChart();
        return (
          <BarChart data={compareData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={['dataMin - 500', 'auto']} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Value']}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <Bar 
              dataKey="value" 
              name="Your Car" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]} 
              barSize={15}
              isAnimationActive={!animated}
              animationDuration={1500}
            />
            <Bar 
              dataKey="comparableValue" 
              name="Similar Cars" 
              fill="#888" 
              radius={[4, 4, 0, 0]} 
              barSize={15}
              isAnimationActive={!animated}
              animationDuration={1500}
              animationBegin={300}
            />
            <Bar 
              dataKey="marketAverage" 
              name="Market Average" 
              fill="#cbd5e1" 
              radius={[4, 4, 0, 0]} 
              barSize={15}
              isAnimationActive={!animated}
              animationDuration={1500}
              animationBegin={600}
            />
          </BarChart>
        );
        
      default:
        return renderBarChart();
    }
  };
  
  // Bar chart rendering (default)
  const renderBarChart = () => (
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
      <YAxis domain={['dataMin - 500', 'dataMax + 500']} />
      <Tooltip 
        formatter={(value: number) => [formatCurrency(value), 'Value']}
        labelFormatter={(label) => `Period: ${label}`}
      />
      <Bar 
        dataKey="value" 
        fill="hsl(var(--primary))" 
        radius={[4, 4, 0, 0]} 
        barSize={40}
        isAnimationActive={!animated}
        animationDuration={1500}
      />
      {forecast.length > 0 && (
        <ReferenceLine
          y={forecast[0]?.value}
          stroke="#888"
          strokeDasharray="5 5"
          label={{
            value: "Forecast",
            position: "insideBottomRight",
          }}
        />
      )}
    </BarChart>
  );
  
  return (
    <div className="w-full bg-white p-4 rounded-md shadow-sm" style={{ minHeight: '300px' }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h5 className="font-medium text-neutral-dark">Market Value Trend</h5>
          <TrendIndicator />
        </div>
        <ChartTypeSelector />
      </div>
      <ResponsiveContainer width="100%" height={240}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
