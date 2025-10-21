import React, { useState, useEffect } from 'react';
import style from './PAbsenceGraph.module.css';
import g from '../../assets/icons/LegendNode.svg';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import api, { endpoints } from '../../config/api';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
        callbacks: {
            label: function(context) {
                return `تعداد غیبت: ${context.parsed.y}`;
            }
        }
    }
  },
  scales: {
    y: { 
        beginAtZero: true,
        ticks: {
            stepSize: 1, // برای اینکه اعداد محور عمودی صحیح باشند (0, 1, 2, ...)
        }
    },
    x: { /* ... */ },
  },
};

export default function PAbsenceGraph() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const userString = localStorage.getItem('user');
        if (!userString) {
          throw new Error("اطلاعات کاربر در سیستم موجود نیست.");
        }
        const userData = JSON.parse(userString);
        // ❗️ توجه: این مسیر را بر اساس ساختار واقعی آبجکت user خود چک کنید
        const stuid = userData?.selected_child_id; // قبلا selectedChild بود، به selected_child_id تغییر دادم
        if (!stuid) {
          throw new Error("فرزند انتخاب شده‌ای یافت نشد.");
        }

        const response = await api.get(endpoints.studentchart(stuid));
        const apiData = response.data.data;

        if (!apiData || !apiData.labels || !apiData.absents) {
            throw new Error("ساختار داده‌های دریافت شده از سرور صحیح نیست.");
        }
        
        // 📍 ۱. اصلاحیه اصلی: پردازش ساختار جدید داده‌ها
        const newChartData = {
          labels: apiData.labels, // ["مهر", "آبان", ...]
          datasets: [
            {
              label: 'تعداد غیبت‌ها', // لیبل برای نمایش در tooltip
              data: apiData.absents, // [0, 0, 0, ...]
              borderColor: '#39A8AC',
              backgroundColor: 'rgba(57,168,172,0.3)',
              tension: 0.4,
              pointBackgroundColor: '#fff',
              pointBorderColor: '#69b0b2',
              pointRadius: 6,
              fill: true, // برای پر کردن سطح زیر نمودار (اختیاری)
            },
          ],
        };

        setChartData(newChartData);

      } catch (err) {
        setError(err.message || "خطا در دریافت اطلاعات نمودار.");
        console.error("Error fetching chart data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return <div className={style.status}>در حال بارگذاری نمودار...</div>;
  }

  if (error) {
    return <div className={`${style.status} ${style.error}`}>خطا: {error}</div>;
  }

  return (
    <div className={style.main}>
      <div className={style.container}>
        {chartData.datasets.length > 0 && chartData.labels.length > 0 ? (
          <>
            <Line data={chartData} options={options} className={style.line} />
            <p className={style.p}>
              نمودار غیبت‌های سال تحصیلی <img src={g} alt='Legend Node' />
            </p>
            <button className={style.button} onClick={() => window.print()}>
              پرینت نمودار غیبت
            </button>
          </>
        ) : (
          <p>اطلاعاتی برای نمایش نمودار وجود ندارد.</p>
        )}
      </div>
    </div>
  );
}