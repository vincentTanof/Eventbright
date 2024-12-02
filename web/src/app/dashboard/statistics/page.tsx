"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DataPoint {
  label: string;
  value: number;
}

interface RawData {
  year: string;
  month: string;
  day: string;
  total_earning: number;
}

export default function EventStatistics() {
  const [filterType, setFilterType] = useState<string>("year");
  const [data, setData] = useState<RawData[]>([]);
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);

  // Fetch statistics from backend
    useEffect(() => {
      const fetchStatistics = async () => {
        try {
          const response = await axiosInstance.get("/event/organizer/statistics");

          const statistics = response.data.statistics;
          console.log(statistics); // Debugging
          setData(statistics);
          setFilteredData(groupBy(statistics, "year"));
        } catch (error) {
          console.error("Error fetching statistics:", error);
        }
      };
    
      fetchStatistics();
    }, []);
    

    // Format numbers as IDR currency
  const formatIDR = (value: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };
  

  const handleFilterChange = (value: string) => {
    setFilterType(value);

    if (value === "year") {
      setFilteredData(groupBy(data, "year"));
    } else if (value === "month") {
      setFilteredData(groupBy(data, "month"));
    } else if (value === "day") {
      setFilteredData(groupBy(data, "day"));
    }
  };

  const groupBy = (data: RawData[], type: "year" | "month" | "day"): DataPoint[] => {
    const grouped: Record<string, number> = {};

    data.forEach((entry) => {
      const key = entry[type];
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += entry.total_earning;
    });

    return Object.entries(grouped).map(([key, value]) => ({
      label: key,
      value,
    }));
  };

  const chartData = {
    labels: filteredData.map((item) => item.label),
    datasets: [
      {
        label: `Total Earnings by ${filterType}`,
        data: filteredData.map((item) => item.value),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };
  

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Event Earnings by ${filterType}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Ensures Y-axis starts at 0
        ticks: {
          stepSize: 1000000, // Increment by IDR 1,000,000
          callback: (value: number | string) =>
            new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(Number(value)), // Format as IDR currency
        },
      },
    },
  };
  
  
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Event Statistics</h1>

      <div className="mb-4">
        <label className="block mb-2 font-bold">Filter By:</label>
        <select
          value={filterType}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="border border-gray-300 rounded p-2"
        >
          <option value="year">Year</option>
          <option value="month">Month</option>
          <option value="day">Day</option>
        </select>
      </div>

      <div className="mt-6">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
