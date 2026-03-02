"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface PieChartProps {
  title: string;
  description: string;
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

export function SimplePieChart({ title, description, data }: PieChartProps) {
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
    fill: item.color,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-[#3d6c58]" />
          <CardTitle className="text-[#1f3f2c]">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 0,
              }}
              formatter={(value, name) => {
                const numValue = Number(value ?? 0);
                return [
                  `₱${numValue.toLocaleString()} (${((numValue / total) * 100).toFixed(1)}%)`,
                  name as string,
                ];
              }}
            />
            <Legend verticalAlign="middle" align="right" layout="vertical" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface DonutChartProps {
  title: string;
  description: string;
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

export function DonutChart({ title, description, data }: DonutChartProps) {
  const chartData = data.map((item) => ({
    name: item.label,
    value: item.value,
    fill: item.color,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-[#3d6c58]" />
          <CardTitle className="text-[#1f3f2c]">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={40}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 0,
              }}
              formatter={(value, name) => {
                const numValue = Number(value ?? 0);
                return [
                  `${numValue.toLocaleString()} (${((numValue / total) * 100).toFixed(1)}%)`,
                  name as string,
                ];
              }}
            />
            <Legend verticalAlign="middle" align="right" layout="vertical" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
