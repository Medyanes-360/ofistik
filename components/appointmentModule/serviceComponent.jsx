"use client";
import React, { useState, useEffect } from "react";
import "../../style/serviceComponent.css";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Navigation, Pagination } from "swiper/modules";
import ServiceBox from "./serviceBox";

function ServiceComponent({ services, setReturnService }) {
  const [selectedService, setSelectedService] = useState(null);
  const [isMobile, setIsMobile] = useState(false); //ekranın mobil olup olmadığını kontrol ettiğimiz değişken

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleAppointmentBoxClick = (clickedService) => {
    //service e tıkladığımızda çalışan fonksiyon
    const formattedReturnService = `${clickedService}`;
    setReturnService(formattedReturnService);
    setSelectedService(clickedService);
  };

  const renderSwiper = (times) => {
    const itemsPerSlide = isMobile ? 8 : 10;
    const swiperSlides = [];
    for (let i = 0; i < times.length; i += itemsPerSlide) {
      const currentTimes = times.slice(i, i + itemsPerSlide);
      const swiperSlide = (
        <SwiperSlide key={i}>
          <div className="flex flex-wrap items-center justify-center h-auto serviceBoxArea ">
            {currentTimes.map((title, index) => (
              <ServiceBox
                key={index}
                title={title}
                onServiceClick={handleAppointmentBoxClick}
                selectedService={selectedService}
              />
            ))}
          </div>
        </SwiperSlide>
      );
      swiperSlides.push(swiperSlide);
    }

    if (isMobile) {
      return (
        <Swiper
          pagination={{ clickable: true }}
          modules={[Pagination]}
          className="mySwiper"
        >
          {swiperSlides}
        </Swiper>
      );
    } else {
      return (
        <Swiper
          navigation={{
            prevEl: ".custom-swiper-button-prev",
            nextEl: ".custom-swiper-button-next",
          }}
          modules={[Navigation]}
          className="mySwiper"
        >
          {swiperSlides}
        </Swiper>
      );
    }
  };

  const servicesArray = services;

  return (
    <div className="serviceArea animate__animated animate__fadeInLeft lg:w-[35rem] lg:h-[20rem] md:w-[24rem] max-[768px]:w-[23rem] max-[768px]:h-auto md:h-auto md:mr-[0px]">
      <div className="title">
        <h2 className=" text-center text-lg md:text-[2.8vh] lg:text-[2.6vh] xl:text-[2.4vh] text-gray-700 font-bold p-3">
          Hizmet Seçiniz
        </h2>
      </div>
      <div className="serviceBoxes lg:w-[33.5rem] relative  rounded-2xl shadow-xl m-3 bg-white mb-5 lg:h-[16rem] md:w-[24rem] max-[768px]:h-[37rem]">
        {!isMobile && (
          <>
            <div className="custom-swiper-button-prev absolute left-2 text-xl text-premiumOrange top-[45%] z-[2] cursor-pointer">
              <i className="fa-solid fa-arrow-left" alt="Previous"></i>
            </div>
            <div className="custom-swiper-button-next top-[45%] absolute right-2 text-xl text-premiumOrange z-[2] cursor-pointer">
              <i className="fa-solid fa-arrow-right" alt="Next"></i>
            </div>
          </>
        )}
        {renderSwiper(servicesArray)}
      </div>
    </div>
  );
}

export default ServiceComponent;
