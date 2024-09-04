'use client'

import Sidebar from '@/components/sidebar'
import ProfileContainer from '@/containers/Profile/ProfileContainer'

import { useEffect, useState } from 'react'
import { postAPI, getAPI } from '@/services/fetchAPI'
import { useSession } from 'next-auth/react'
import { FiUser, FiCalendar } from 'react-icons/fi'
import { FaAd, FaMoneyBillAlt } from 'react-icons/fa'
import { MdCampaign, MdDashboard } from 'react-icons/md'
import { RiMessage2Fill } from 'react-icons/ri'
import { IoShareSocial } from 'react-icons/io5'
import { FcStatistics } from 'react-icons/fc'
import Page from '@/app/campaign/page'
import CampaginContainer from '@/components/Campaign'
import Dashboard from '@/components/commonModules/dashboard'
import MainPage from '@/components/mainAdvertPage/mainPage'
import Home from '@/app/messages/page'
import GeneralComponentFinance from '@/components/financeComponents/generalComponentFinance'
import SocialAreaForUser from '@/components/socialStatistics/socialAreaForUser'
import SocialPageComponent from '@/components/socialStatistics/socialPage'

export default ({ params }) => {
  const [data, setData] = useState(null)
  const [profileInfo, setProfileInfo] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const { data: sessionInfo } = useSession()

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
    console.log(sessionInfo)
    const getProfileInfo = async () => {
      const res = await getAPI(
        `/profile/${sessionInfo.user.id}/get-profile-receiver`
      )
      console.log(res.data)
      setProfileInfo(res.data)
    }
    if (sessionInfo?.user?.id) {
      getProfileInfo()
    }
  }, [sessionInfo?.user?.id])

  const tabs = [
    { name: 'Profil', icon: <FiUser />, key: 'profile' },
    { name: 'Kontrol Paneli', icon: <MdDashboard />, key: 'dashboard' },

    { name: 'Reklamlar', icon: <FaAd />, key: 'addsense' },
    { name: 'Kampanyalar', icon: <MdCampaign />, key: 'campaign' },
    { name: 'Mesajlar', icon: <RiMessage2Fill />, key: 'messages' },
    { name: 'Finans', icon: <FaMoneyBillAlt />, key: 'finance' },
    { name: 'Sosyal', icon: <IoShareSocial />, key: 'social' },
    {
      name: 'Sosyal İstatistik',
      icon: <FcStatistics />,
      key: 'socialStatistic',
    },
  ]

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

      default:
        return null
    }
  }

  return (
    <div className="flex ">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profileInfo}
        tabs={tabs}
      />
      {renderContent()}
    </div>
  )
}
