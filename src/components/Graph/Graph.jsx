import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import style from './Graph.module.css';
import g from '../../assets/icons/LegendNode.svg';
import { Line } from 'react-chartjs-2';
import api, { endpoints } from "../../config/api";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const initialChartData = {
  labels: [],
  datasets: [
    {
      label: 'سال تحصیلی', // لیبل ثابت
      data: [],
      borderColor: '#39A8AC',
      backgroundColor: 'rgba(57,168,172,0.3)',
      tension: 0.4,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#69b0b2',
      pointRadius: 6,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      labels: {
        font: {
          family: 'bold',
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 5,
        font: {
          family: 'bold',
        },
      },
    },
    x: {
      ticks: {
        font: {
          family: 'bold',
        },
      },
    },
  },
};

export default function Graph() {
  const { studentId } = useParams(); 
  const [chartData, setChartData] = useState(initialChartData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) {
      return; 
    }

    const fetchAbsenceData = async () => {
      try {
        const response = await api.get(endpoints.studentchart(studentId));
        
        // **این بخش کلیدی و اصلاح شده است**
        // حالا به درستی به داده های تودرتو دسترسی پیدا می‌کنیم
        const apiData = response.data.data; 
        
        const newChartData = {
          // از apiData.labels استفاده می‌کنیم
          labels: apiData.labels, 
          datasets: [
            {
              ...initialChartData.datasets[0],
              // داده‌های نمودار را از apiData.absents می‌خوانیم
              data: apiData.absents, 
              // می‌توانید اینجا یک لیبل داینامیک دیگر هم قرار دهید اگر API آن را برمی‌گرداند
              label: 'نمودار غیبت',
            },
          ],
        };

        setChartData(newChartData);

      } catch (err) {
        console.error("خطا در دریافت اطلاعات نمودار:", err);
        setError("متاسفانه در بارگذاری اطلاعات مشکلی پیش آمد.");
      }
    };

    fetchAbsenceData();
  }, [studentId]);

  if (error) {
    return <div className={style.main}><p>{error}</p></div>;
  }
  
  // اگر هنوز لیبلی وجود ندارد (در حال لودینگ)
  if (chartData.labels.length === 0) {
      return <div className={style.main}><p>در حال بارگذاری اطلاعات نمودار...</p></div>;
  }

  return (
    <div className={style.main}>
      <div className={style.container} >
        <Line data={chartData} options={options} className={style.line} />
        
        <p className={style.p}>{chartData.datasets[0].label} <img src={g} alt='Legend Node'></img></p>
        <button className={style.button}
          onClick={() => window.print()}>
          پرینت نمودار غیبت 
        </button>
      </div>
    </div>
  );
}