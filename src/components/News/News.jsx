import React, { useState, useEffect } from 'react';
import styles from './News.module.css';
import NewsCard from '../NewsCard/NewsCard'; 
import news from "../../assets/icons/news.svg";
import pana from "../../assets/icons/pana.svg";
import powerpana from "../../assets/icons/poweredwithpana.svg";
import more from "../../assets/icons/showmorenews.svg"

export default function News() {
  // State برای نگهداری لیست اخبار
  const [newsItems, setNewsItems] = useState([]);
  // State برای نمایش وضعیت بارگذاری
  const [loading, setLoading] = useState(true);
  // State برای نمایش خطا در صورت بروز مشکل
  const [error, setError] = useState(null);

  useEffect(() => {
    // آدرس فید RSS
    const feedUrl = 'https://www.pana.ir/feeds/';
    // استفاده از پراکسی برای دور زدن محدودیت CORS
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;

    const fetchNews = async () => {
      try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`خطا در دریافت اطلاعات: ${response.statusText}`);
        }
        const xmlText = await response.text();

        // پارس کردن رشته XML به یک سند XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
        
        // پیدا کردن تمام آیتم‌های 'item' در فید
        const items = xmlDoc.querySelectorAll('item');
        
        const parsedItems = Array.from(items).map(item => {
          // استخراج عنوان و لینک از هر آیتم
          const title = item.querySelector('title').textContent;
          const link = item.querySelector('link').textContent;
          return { title, link };
        });

        setNewsItems(parsedItems);
        setError(null);
      } catch (err) {
        setError(err.message);
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []); // آرایه خالی به این معنی است که این افکت فقط یک بار پس از رندر اولیه اجرا می‌شود

  return (
    <div className={styles.News}>
      <div className={styles.Header}><div className={styles.Headerr}><img src={news} alt="icon" /><p>اخبار</p></div><div className={styles.Headerrr}><img src={pana} alt="icon" /><img src={powerpana} alt="icon" /></div></div>

      <div className={styles.Contents}>
      
        {!loading && !error && (
          newsItems.map((item, index) => (
            <div className={styles.n} key={index}>
              <p className={styles.ntitle}>{item.title}</p>
              <button className={styles.showMoreButton}>
                {/* لینک به خبر اصلی در یک تب جدید باز می‌شود */}
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                 <p>{"مشاهده‌ کامل‌خبر"}</p><img src={more} alt='' />
                </a>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}