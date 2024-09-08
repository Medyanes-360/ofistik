'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { FaShare } from 'react-icons/fa6'

function Card({
  image,
  name,
  status,
  category,
  starNumber,
  job,
  videoNumber,
  callNumber,
  language,
  skills,
  showedSkillsNumber,
  price,
  apointmentDate,
  commentNumber,
  minSessionTime,
}) {
  const router = useRouter()
  const [isHeartAnimating, setHeartAnimating] = useState(false)

  const heartAnimation = () => {
    setHeartAnimating(!isHeartAnimating)
  }

  const renderStars = () => {
    const stars = []

    for (let i = 0; i < starNumber; i++) {
      // yıldız sayısı kadar yıl font u ekliyor
      stars.push(
        <i key={i} className="fa-solid fa-star text-blueOne text-center"></i>
      )
    }

    return stars
  }

  return (
    <div
      className="border-2 w-72 lg:w-80 text-center rounded-xl h-full justify-between flex flex-col px-4 py-2 transition-all duration-300 ease-in-out hover:shadow-2xl"
      onClick={() => router.push('/profile/' + name)}
    >
      <div className="ml-auto flex z-10" onClick={(e) => e.stopPropagation()}>
        <button className="p-2 text-muted-foreground cursor-pointer">
          <FaShare className="text-xs" />
        </button>
        <button className="p-2 cursor-pointer">
          <DotsHorizontalIcon />
        </button>
      </div>
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="relative imageArea w-full flex flex-col items-center justify-center">
            <span
              className={`absolute h-5 w-5 ${
                status === 1 ? 'bg-blueOne' : 'bg-redOne'
              } rounded-full top-4 point right-[87px] border-white border-4`}
            ></span>
            <Link href={'/'}>
              <img
                src={image}
                className={`w-28 h-28 rounded-full ${
                  status !== undefined
                    ? `border-2 ${
                        status === 1 ? 'border-blueOne' : 'border-redOne'
                      }`
                    : ''
                }`}
                alt=""
              />
            </Link>
            {status !== undefined && (
              <span
                className={`status bg-lightBlue ${
                  status === 1 ? 'text-blueOne' : 'text-redOne'
                } px-3 py-1 rounded-2xl text-sm border-${
                  status === 1 ? 'blueOne' : 'redOne'
                } border relative bottom-3.5`}
              >
                {status === 1 ? 'Çevrim içi' : 'Meşgul'}
              </span>
            )}
          </div>
          <div className="starArea">{renderStars()}</div>
          <div className="commentArea">
            <h3 className="underline font-medium">{`${commentNumber}. Yorum`}</h3>
          </div>
          <div className="nameArea mt-1">
            <Link href={'/'}>
              <h3 className="text-center font-semibold">{name}</h3>
            </Link>
          </div>
          <div className="jobArea mt-2">
            <h4 className="text-center font-normal text-gray-600 text-sm">
              {job}
            </h4>
          </div>
          <div className="infoArea flex justify-center mt-2">
            <div className="videoCall ml-2">
              <i className="fa-solid fa-video text-infoIcon"></i>
              <span className="ml-2 font-normal text-xs mb-2">
                {videoNumber}
              </span>
            </div>
            <div className="call ml-2">
              <i className="fa-solid fa-phone text-infoIcon"></i>
              <span className="ml-2 font-normal text-xs mb-1">
                {callNumber}
              </span>
            </div>
            <div className="language ml-2">
              <i className="fa-solid fa-globe text-infoIcon"></i>
              <span className="ml-2 font-normal text-xs mb-1">{language}</span>
            </div>
          </div>
          <div className="h-[128px]">
            <div className="skillsArea mt-2 flex flex-wrap justify-center text-sm h-auto">
              {skills.slice(0, showedSkillsNumber).map((skill, index) => (
                <Link
                  href="/"
                  className="  m-1 h-[24px]  my-1 rounded-full bg-skillsBg px-3 py-1 text-xs font-myBold text-themeBlack hover:border-transparent hover:bg-gray-200"
                  key={index}
                >
                  {skill}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="viewProfileArea mt-1">
          <button className=" font-semibold border-b-2 p-2.5">
            Profili İncele<i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
      <div className="priceArea flex text-center justify-center m-3 mt-1">
        <h4 className="font-semibold text-lg">₺{price}/Seans</h4>
        <h4 className="ml-2 text-sm pt-1">
          {' '}
          {`(Minimum ${minSessionTime} dakika)`}
        </h4>
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="appointmentButtonArea"
      >
        <button className="bg-appointmentColor tracking-wider font-medium text-white w-full py-2 rounded-3xl text-sm">
          Randevu Al
        </button>
        <div className="flex justify-between">
          <button className="bg-grayButton text-white font-medium tracking-wider w-[7.75rem] lg:w-[8.6rem] py-2 rounded-3xl text-xs lg:text-sm mt-2">
            Mesaj Gönder
          </button>
          <button className="bg-blueOne text-white font-medium tracking-wider w-[7.75rem] lg:w-[8.6rem] py-2 rounded-3xl text-xs lg:text-sm mt-2">
            Takip Et
          </button>
        </div>
      </div>
    </div>
  )
}

export default Card
