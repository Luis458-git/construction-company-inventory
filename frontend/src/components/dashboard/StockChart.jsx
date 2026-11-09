import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StockChart({ materiales }) {
  if (!materiales || materiales.length === 0) {
    return <p className="text-muted text-center">No hay datos para mostrar.</p>;
  }

  const labels = materiales.map(m => m.descripcion || m.codigo_estandar);
  const stockData = materiales.map(m => m.stock_actual || 0);
  const prData = materiales.map(m => m.punto_reorden || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Stock Actual',
        data: stockData,
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderColor: '#2563EB',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Punto de Reorden (PR)',
        data: prData,
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
        borderColor: '#EF4444',
        borderWidth: 2,
        borderDash: [5, 5],
        borderRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.04)' }
      },
      x: {
        grid: { display: false },
        ticks: { maxRotation: 45, minRotation: 0, font: { size: 11 } }
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default StockChart;

