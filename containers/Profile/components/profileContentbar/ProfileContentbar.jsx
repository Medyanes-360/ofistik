'use client'
import React, { useCallback } from 'react'
import dynamic from 'next/dynamic'
//Components
import Loading from '@/components/Loading'
//Icons
import { MdAccountBox } from 'react-icons/md'
import { FaCamera } from 'react-icons/fa'
import { RiTodoFill } from 'react-icons/ri'

// Dynamic Components
const TabItemGeneral = dynamic(() => import('./TabItemGeneral'), {
  loading: () => <Loading />,
})
const TabsItemSocial = dynamic(() => import('./TabsItemSocial'), {
  loading: () => <Loading />,
})
const TabsItemEvaluations = dynamic(() => import('./TabsItemEvaluations'), {
  loading: () => <Loading />,
})

//The props here come from the <ProfilePageLayout/> component
const ProfileContentbar = ({
  detailControl,
  setDetailControl,
  setIsCommented,
  isCommented,
  isFollow,
  setIsFollow,
  query,
  profile,
}) => {
  const MenuItems = ({ detailControl, isCommented }) => {
    switch (detailControl) {
      case 'general':
        return <TabItemGeneral query={query} profile={profile} />
      case 'social':
        return <TabsItemSocial isFollow={isFollow} setIsFollow={setIsFollow} />
      case 'evaluation':
        return isCommented ? <TabsItemEvaluations /> : null
      default:
        return null
    }
  }

  const handleEvaluationComment = useCallback(() => {
    setIsCommented(true)
    setDetailControl('evaluation')
  }, [isCommented, detailControl])

  const handleOpenGeneralInProfileDetail = useCallback(() => {
    setDetailControl('general')
  }, [detailControl])

  const handleOpenSocialInProfileDetail = useCallback(() => {
    setDetailControl('social')
  }, [detailControl])

  return (
    <div className="w-full">
      <div className="flex items-start justify-between w-full  pt-[2px]">
        <div
          onClick={handleOpenGeneralInProfileDetail}
          className="w-20 sm:w-full "
        >
          <div
            className={`flex items-center justify-start sm:justify-center  border-b py-3 ${
              detailControl === 'general'
                ? 'border-premiumOrange text-premiumOrange '
                : 'text-gray-600'
            }  gap-1 cursor-pointer`}
          >
            <MdAccountBox className="text-xs sm:text-sm telefon:text-lg md:text-xl " />
            <h1 className="text-xs sm:text-sm telefon:text-lg md:text-xl font-semibold ">
              Genel
            </h1>
          </div>
        </div>
        <div
          onClick={handleOpenSocialInProfileDetail}
          className="w-20 sm:w-full "
        >
          <div
            className={`flex items-center justify-start sm:justify-center border-b py-3 ${
              detailControl === 'social'
                ? 'border-premiumOrange text-premiumOrange'
                : 'text-gray-600'
            }  gap-1 cursor-pointer`}
          >
            <FaCamera className="text-xs sm:text-sm telefon:text-lg md:text-xl " />
            <h1 className="text-xs sm:text-sm telefon:text-lg md:text-xl font-semibold ">
              Sosyal
            </h1>
          </div>
        </div>
        <div onClick={handleEvaluationComment} className="w-28 sm:w-full ">
          <div
            className={`flex items-center justify-start sm:justify-center border-b py-3 ${
              detailControl === 'evaluation'
                ? 'border-premiumOrange text-premiumOrange'
                : 'text-gray-600'
            }  gap-1 cursor-pointer`}
          >
            <RiTodoFill
              className={`text-xs sm:text-sm telefon:text-lg md:text-xl `}
            />
            <h1 className="text-xs sm:text-sm telefon:text-lg md:text-xl font-semibold ">
              Değerlendirme
            </h1>
          </div>
        </div>
      </div>
      <MenuItems detailControl={detailControl} isCommented={isCommented} />
    </div>
  )
}

export default ProfileContentbar
