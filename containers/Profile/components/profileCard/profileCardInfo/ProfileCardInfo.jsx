'use client'
import React, { useCallback, useState, useRef, useEffect } from 'react'
//Components
import Rating from '@/components/Rating'
// Icons
import { BiComment } from 'react-icons/bi'
import { FaBullseye, FaMessage } from 'react-icons/fa6'
import { HiVideoCamera } from 'react-icons/hi2'
import { BsBoxArrowUp } from 'react-icons/bs'
import { BiSolidComment } from 'react-icons/bi'
import { FiPlus } from 'react-icons/fi'
import { BsCheck } from 'react-icons/bs'
import report from '../../../../../assets/image/report.png'
import spam from '../../../../../assets/image/spam.png'
import { GrLanguage } from 'react-icons/gr'
import { FaUser } from 'react-icons/fa'
import { IoIosCloseCircleOutline } from 'react-icons/io'
import { SlOptionsVertical } from 'react-icons/sl'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { getAPI } from '@/services/fetchAPI'
import profileImg from './man.png'
import { Alert } from '@chakra-ui/react'
//This props came from <ProfilePageLayout/>  component
const ProfileCardHeader = ({
  isHearted,
  setIsHearted,
  detailControl,
  setDetailControl,
  setIsCommented,
  isCommented,
  isFollow,
  setIsFollow,
  socialRef,
  data,
  query,
  price,
  minSessionTime,
  profileInfo,
}) => {
  const optionsRef = useRef()
  const { data: session } = useSession()
  const id = session?.user.id
  const userIdToFollow = session?.user.id

  const [wideScreenImg, setWideScreenImg] = useState(false)
  const [profile, setProfile] = useState()
  const [showOptions, setShowOptions] = useState(true)
  const [loading, setLoading] = useState(true)

  const handleFollowToggle = async () => {
    if (!session) {
      // If the user is not logged in, redirect to the login page
      Alert.alert('Lütfen giriş yapınız!')
      return
    }

    try {
      await axios.post('/api/follow', { userIdToFollow })
      setIsHearted(!isHearted)
    } catch (error) {
      console.error('Failed to follow/unfollow:', error)
    }
  }

  const handleOpenCommentDetailPage = useCallback((event) => {
    event.stopPropagation()
    if (!isCommented && detailControl !== 'evaluation') {
      setIsCommented(true)
      setDetailControl('evaluation')
    } else if (isCommented && detailControl !== 'evaluation') {
      setIsCommented(true)
      setDetailControl('evaluation')
    } else if (isCommented && detailControl === 'evaluation') {
      setDetailControl('general')
    } else {
      return
    }
  })

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        showOptions &&
        optionsRef.current &&
        !optionsRef.current.contains(e.target)
      ) {
        setShowOptions(false)
      }
    }

    document.addEventListener('mousedown', checkIfClickedOutside)

    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside)
    }
  }, [showOptions])

  useEffect(() => {
    const getProfile = async () => {
      const result = await getAPI(`/profile/${query}/get-profile`)
      if (result.status === 'success') {
        setProfile(result.data)
        setLoading(false)
      }
    }

    getProfile()
  }, [id])

  return (
    !loading && (
      <>
        <div className="relative max-w-full flex flex-col sm:flex-row items-center  sm:items-start gap-3">
          <div className="relative imageArea min-w-[115px] flex flex-col items-center justify-center">
            <span
              className={`absolute h-5 w-5 ${
                1 === 1 ? 'bg-green-600' : 'bg-redOne'
              } rounded-full top-4 point right-0 border-white border-4`}
            ></span>
            <Image
              width={100}
              height={100}
              onClick={() => setWideScreenImg(true)}
              src={profile?.profileImg || profileImg}
              className={`cursor-pointer w-28 h-28 rounded-full ${
                1 !== undefined
                  ? `border-2 ${1 === 1 ? 'border-green-600' : 'border-redOne'}`
                  : ''
              }`}
            />
            {1 !== undefined && (
              <span
                className={`status bg-lightGreen  ${
                  1 === 1 ? 'text-green-600' : 'text-redOne'
                } px-3 py-1 rounded-2xl text-sm border-${
                  1 === 1 ? 'green-600' : 'redOne'
                } border relative bottom-3.5 font-semibold`}
              >
                {1 === 1 ? 'Çevrim içi' : 'Meşgul'}
              </span>
            )}
          </div>
          <div className="relative w-full flex flex-col gap-5 justify-between ">
            <div className="flex flex-col items-start gap-1">
              <h1 className="text-start text-[20px] sm:text-[22px]">
                {`${profile?.name} ${profile?.surname}`}
              </h1>
              <h3 className="text-textGray text-xs">{profile?.jobStatus}</h3>
              <div className=" flex items-center gap-2 }}mt-4 sm:mt-3 text-xs cursor-pointer">
                <button className="bg-white border-premiumOrange border-2 w-20  hover:opacity-80 text-premiumOrange  rounded-md  transition duration-300 ease-in-out flex items-center justify-center py-1  gap-1">
                  <FaMessage className="text-premiumOrange hover:opacity-90 " />
                  <h1 className="hover:opacity-90 text-[10px] font-semibold">
                    Mesaj
                  </h1>
                </button>
                {isHearted ? (
                  <div
                    onClick={handleFollowToggle}
                    className="hidden sm:flex items-center justify-center w-20 gap-1 bg-white text-premiumOrange border-2 border-premiumOrange rounded-md py-1 "
                  >
                    <BsCheck
                      size={16}
                      className={`heart-icon ${
                        isHearted
                          ? 'hearted text-premiumOrange  animate-heart '
                          : ''
                      }`}
                    />
                    <h1 className="text-[11px] font-semibold">Takip</h1>
                  </div>
                ) : (
                  <div
                    onClick={handleFollowToggle}
                    className="hidden sm:flex items-center justify-center  gap-1 w-20 bg-premiumOrange text-white  rounded-md py-1 border-premiumOrange border-2"
                  >
                    <FiPlus
                      size={14}
                      className={`heart-icon ${
                        isHearted ? 'heartedmb-1 animate-heart' : ''
                      }`}
                    />
                    <h1 className="text-[11px] font-semibold ">Takip Et</h1>
                  </div>
                )}
              </div>
            </div>
            <div
              ref={socialRef}
              className=" absolute top-0 w-full flex gap-3  items-center justify-end cursor-pointer"
            >
              {isHearted ? (
                <div
                  onClick={handleFollowToggle}
                  className="w-20 flex sm:hidden  items-center justify-center py-1 gap-1 bg-primaryBlue text-white border rounded-md  "
                >
                  <BsCheck
                    size={18}
                    className={`heart-icon ${
                      isHearted ? 'hearted text-white  animate-heart ' : ''
                    }`}
                  />
                  <h1 className="text-[11px]">Takip</h1>
                </div>
              ) : (
                <div
                  onClick={handleFollowToggle}
                  className="w-20 flex sm:hidden  items-center justify-center py-1  border rounded-md
                        text-white bg-primaryBlue"
                >
                  <FiPlus
                    size={14}
                    className={`heart-icon ${
                      isHearted ? 'heartedmb-1 animate-heart' : ''
                    }`}
                  />
                  <h1 className="text-[11px] sm:hidden telefon:block ">
                    Takip Et
                  </h1>
                </div>
              )}
              <BsBoxArrowUp
                onClick={() => {
                  setIsFollow(!isFollow)
                }}
                className={`${
                  isFollow ? 'text-primaryBlue' : ''
                } hover:opacity-60`}
              />
              <div className="relative group">
                <SlOptionsVertical
                  onClick={() => setShowOptions(!showOptions)}
                  className="group-hover:opacity-60 "
                />
                <div
                  ref={optionsRef}
                  className={`absolute top-4 right-0 ${
                    showOptions ? 'flex' : 'hidden'
                  } flex-col w-32 pt-2`}
                >
                  <div className="py-2  w-full p-3 border rounded-lg text-[10px] bg-lighBlue  text-black">
                    <div className="flex items-center gap-2 text-xs">
                      <Image src={spam} width={18} height={18} />
                      <h1 className="hover:opacity-75">Spam</h1>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <Image src={report} width={18} height={18} />
                      <h1 className="hover:opacity-75">Şikayet Et</h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className=" w-full flex gap-3 items-center justify-end cursor-pointer">
              <div
                className="flex items-center gap-1 mb-1 "
                onClick={handleOpenCommentDetailPage}
              >
                <Rating size={14} color="secondaryBlue" /> {/*Is a Component */}
                <p className="text-xs mt-1">4.95</p>
              </div>
              <div className="flex items-center gap-1 ">
                <h1 className="text-xs font-semibold">12</h1>
                {isCommented && detailControl === 'evaluation' ? (
                  <BiSolidComment onClick={handleOpenCommentDetailPage} />
                ) : (
                  <BiComment
                    onClick={handleOpenCommentDetailPage}
                    className="hover:opacity-60"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 content-start w-full  gap-[2px] my-3 text-textBoldBlue font-semibold">
          <div className="col-span-4 flex flex-col items-center justify-start w-full gap-2 py-5 px- rounded-s-xl bg-gray-100 rounded-l-xl">
            <h1 className="text-[14px]">Görüşme</h1>
            <div className="flex items-center gap-2">
              <HiVideoCamera className="text-premiumOrange" size={20} />
              <h6 className="text-[12px]">28</h6>
            </div>
          </div>
          <div className="col-span-4 flex flex-col w-full gap-2 py-5 px- bg-gray-100 ">
            <h1 className="text-[14px] ">Takipçi</h1>
            <div className="flex items-center justify-center gap-2">
              <FaUser className="text-premiumOrange" />
              <h6 className="text-[12px] ">523</h6>
            </div>
          </div>
          <div className="col-span-4 flex flex-col w-full gap-2 py-5 px- bg-gray-100 rounded-r-xl">
            <h1 className="text-[14px] ">Diller</h1>
            <div className="flex items-center justify-center gap-2">
              <GrLanguage className="text-premiumOrange" />
              <h6 className="text-[12px] ">Tr</h6>
            </div>
          </div>
        </div>
        {profile && profileInfo && profile.user.id !== profileInfo.user.id && (
          <div className="priceArea flex text-center justify-center  text-gray-600 bg-gray-100 py-2 rounded-xl">
            <h4 className="font-semibold text-lg">
              <span className="text-premiumOrange mr-1 font-semibold">₺</span>
              {price}/Seans
            </h4>
            <h4 className="ml-2 text-sm pt-1">
              {' '}
              {`(Minimum ${minSessionTime} dakika)`}
            </h4>
          </div>
        )}
        {wideScreenImg && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
            <IoIosCloseCircleOutline
              onClick={() => setWideScreenImg(false)}
              size={35}
              className="absolute top-20 md:top-28 right-4 text-white hover:opacity-80 cursor-pointer"
            />
            <img
              src="/profileImage.jpg"
              className={`rounded-full w-4/5 p-2 sm:w-3/5 md:w-2/5  md:h-2/3`}
              alt=""
            />
          </div>
        )}
      </>
    )
  )
}

export default ProfileCardHeader
