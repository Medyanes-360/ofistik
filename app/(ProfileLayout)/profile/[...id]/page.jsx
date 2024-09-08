'use client'

import Sidebar from '@/components/sidebar'
import ProfileContainer from '@/containers/Profile/ProfileContainer'

import { useEffect, useState } from 'react'
import { postAPI, getAPI } from '@/services/fetchAPI'
import { useSession } from 'next-auth/react'

import Page from '@/app/campaign/page'
import CampaginContainer from '@/components/Campaign'
import Dashboard from '@/components/commonModules/dashboard'
import MainPage from '@/components/mainAdvertPage/mainPage'
import Home from '@/app/messages/page'
import GeneralComponentFinance from '@/components/financeComponents/generalComponentFinance'
import SocialAreaForUser from '@/components/socialStatistics/socialAreaForUser'
import SocialPageComponent from '@/components/socialStatistics/socialPage'
import MembershipInfo from '@/containers/Home/_components/receiverProfile/MembershipInfo'
import PasswordUpdate from '@/containers/Home/_components/receiverProfile/PasswordUpdate'

export default ({ params }) => {
  const [data, setData] = useState(null)
  const [profileForSidebar, setProfileForSidebar] = useState(null)
  const [profileInfo, setProfileInfo] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const { data: sessionInfo } = useSession()
  const [type, setType] = useState('')

  // async function getProfileData() {
  //   const response = await postAPI(
  //     "/auth",
  //     { email: "example@ofistik.com" },
  //     "POST"
  //   );
  //   setData(response);
  // }

  // useEffect(() => {
  //   getProfileData();
  // }, []);

  useEffect(() => {
    const getProfileInfo = async () => {
      try {
        const [profileResponse, sidebarResponse] = await Promise.all([
          getAPI(`/profile/${params.id}/get-profile-provider`),
          getAPI(`/profile/${sessionInfo.user.id}/get-profile-sidebar`),
        ])
        setProfileForSidebar(sidebarResponse.data)
        setProfileInfo(profileResponse.data)
        setType(sidebarResponse.message)
      } catch (error) {
        console.error('Error fetching profile information:', error)
      }
    }

    if (sessionInfo?.user?.id) {
      getProfileInfo()
    }
  }, [sessionInfo?.user?.id, params])

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="max-h-[100vh] w-full overflow-y-scroll">
            <ProfileContainer
              data={data?.data}
              query={params.id}
              profile={profileInfo}
            />
          </div>
        )
      case 'campaign':
        return (
          <div className="max-h-[100vh] w-full overflow-y-scroll">
            <CampaginContainer />
          </div>
        )
      case 'dashboard':
        return (
          <div className="max-h-[100vh] w-full overflow-y-scroll">
            <Dashboard />
          </div>
        )
      case 'addsense':
        return (
          <div className="max-h-[100vh] w-full overflow-y-scroll">
            <MainPage />
          </div>
        )
      case 'messages':
        return (
          <div className="max-h-[100vh] w-full overflow-y-scroll">
            <Home />
          </div>
        )
      case 'finance':
        return (
          <div className="max-h-[100vh] w-full overflow-y-scroll">
            <GeneralComponentFinance />
          </div>
        )
      case 'social':
        return (
          <div className="max-h-[100vh] w-full overflow-y-scroll">
            <SocialAreaForUser />
          </div>
        )
      case 'socialStatistic':
        return (
          <div className="max-h-[100vh] w-full overflow-y-scroll">
            <SocialPageComponent />
          </div>
        )

      case 'settings':
        return (
          <div className='bg-grayBg w-full min-h-screen pt-20 sm:pt-36 pb-10 p-3 overflow-auto"'>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <MembershipInfo profileInfo={profileInfo} type={'PROVIDER'} />
                <PasswordUpdate />
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex ">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profileForSidebar}
        type={type}
      />
      {renderContent()}
    </div>
  )
}
