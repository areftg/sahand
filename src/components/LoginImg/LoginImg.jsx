import React, { useRef, useState } from 'react'; // useState را اضافه میکنیم
import style from './LoginImg.module.css';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Mousewheel, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// 1. آرایه‌ای برای نگهداری اطلاعات هر اسلاید
const slideData = [
  { id: 1, image: "/first.png", title: "آغاز سال تحصیلی مبارک باد" },
  { id: 2, image: "/two.png", title: "" },
  { id: 3, image: "/three.png", title: "" },
  { id: 4, image: "/four.png", title: "سامانه ای برای تمامی نیاز ها" },
];

export default function LoginImg() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // 2. یک state برای نگهداری عنوان اسلاید فعلی
  // مقدار اولیه آن، عنوان اولین اسلاید است
  const [currentTitle, setCurrentTitle] = useState(slideData[0].title);

  return (
    <div className={style.container}>
      {/* 3. عنوان ثابت که محتوای آن داینامیک است */}
      <div className={style.sliderTitle}>{currentTitle}</div>

      <Swiper
        loop={true}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        direction="horizontal"
        pagination={{ clickable: true }}
        mousewheel={true}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        // 4. با هر تغییر اسلاید، state عنوان را به‌روز میکنیم
        onSlideChange={(swiper) => {
          // swiper.realIndex اندیس اسلاید فعال در حالت loop است
          setCurrentTitle(slideData[swiper.realIndex].title);
        }}
        modules={[Navigation, Pagination, Mousewheel, Autoplay]}
        className={style.swap}
      >
        <div  ref={nextRef} className={`${style.customButton} ${style.prevButton}`}>
            <svg width="26" height="16" viewBox="0 0 26 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.1299 9.96316L4.53266 1.36591C3.60116 0.434414 2.08916 0.434414 1.15766 1.36591C0.226158 2.29741 0.226158 3.80941 1.15766 4.74091L11.5392 15.1224C12.4189 16.0022 13.8432 16.0022 14.7207 15.1224L25.1022 4.74091C26.0337 3.80941 26.0337 2.29741 25.1022 1.36591C24.1707 0.434414 22.6587 0.434414 21.7272 1.36591L13.1299 9.96316Z" fill="white"/></svg>
        </div>
        <div ref={prevRef} className={`${style.customButton} ${style.nextButton}`}>
            <svg width="26" height="16" viewBox="0 0 26 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.1299 9.96316L4.53266 1.36591C3.60116 0.434414 2.08916 0.434414 1.15766 1.36591C0.226158 2.29741 0.226158 3.80941 1.15766 4.74091L11.5392 15.1224C12.4189 16.0022 13.8432 16.0022 14.7207 15.1224L25.1022 4.74091C26.0337 3.80941 26.0337 2.29741 25.1022 1.36591C24.1707 0.434414 22.6587 0.434414 21.7272 1.36591L13.1299 9.96316Z" fill="white"/></svg>
        </div>

        {/* 5. حالا به جای یک آرایه عددی، روی آرایه داده‌ها map میزنیم */}
        {slideData.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="slide">
              <img src={slide.image} alt={slide.title} className={style.frame} />
              {/* این کپشن داخل اسلاید را میتوانید حذف کنید یا نگه دارید */}
              {/* <div className={style.caption}>روز جوان گرامی‌باد.</div> */}
            </div>
          </SwiperSlide>
        ))}
        <div className={style.bottom}/>
      </Swiper>
    </div>
  )
}