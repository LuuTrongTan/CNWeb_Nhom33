import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { generateRevenueData, formatDate, formatCurrency } from '../../utils/mockData';
import './RevenueChart.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueChart = ({ period = 'month' }) => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch revenue data based on period
    // In a real app, this would be an API call to get actual data
    setLoading(true);
    
    const daysToFetch = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    setTimeout(() => {
      const data = generateRevenueData(daysToFetch);
      setRevenueData(data);
      setLoading(false);
    }, 800); // Simulate API call delay
  }, [period]);
  
  // Prepare data for Chart.js
  const chartData = {
    labels: revenueData.map(item => formatDate(item.date)),
    datasets: [
      {
        label: 'Revenue',
        data: revenueData.map(item => item.revenue),
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `Revenue: ${formatCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value),
        },
      },
    },
  };
  
  // Calculate total revenue
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  
  return (
    <div className={`revenue-chart-container ${revenueData.length === 0 && !loading ? 'no-data' : ''}`}>
      <h3>Revenue Overview {period && `(${period})`}</h3>
      
      {loading ? (
        <div className="loading-indicator">Loading revenue data...</div>
      ) : revenueData.length > 0 ? (
        <>
          <div className="revenue-summary">
            <p className="total-revenue">Total: {formatCurrency(totalRevenue)}</p>
            <p className="avg-revenue">Avg: {formatCurrency(totalRevenue / revenueData.length)}</p>
          </div>
          <div className="revenue-chart">
            <Line data={chartData} options={chartOptions} />
          </div>
        </>
      ) : (
        <div className="no-data-message">No revenue data available for this period</div>
      )}
    </div>
  );
};

export default RevenueChart; 