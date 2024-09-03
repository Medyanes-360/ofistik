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

export default ({ params }) => {
  const [data, setData] = useState(null)
  const [profileInfo, setProfileInfo] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const { data: session } = useSession()

  async function getProfileData() {
    const response = await postAPI(
      '/auth',
      { email: 'example@ofistik.com' },
      'POST'
    )
    setData(response)
  }

  useEffect(() => {
    getProfileData()
  }, [])

  useEffect(() => {
    const getProfileInfo = async () => {
      const res = await getAPI(
        `/profile/${session.user.id}/get-profile-receiver`
      )
      setProfileInfo(res.data)
    }
    if (session?.user?.id) {
      getProfileInfo()
    }
  }, [session?.user?.id])

  const tabs = [
    { name: 'Profil', icon: <FiUser />, key: 'profile' },
    {
      name: 'Randevularım',
      icon: <FiCalendar />,
      key: 'appointments',
      subTabs: [
        { name: 'Upcoming', key: 'upcoming' },
        { name: 'Past', key: 'past' },
      ],
    },
    { name: 'Addsense', icon: <FaAd />, key: 'addsense' },
    { name: 'Kampanyalar', icon: <MdCampaign />, key: 'campaign' },
    { name: 'Dashboard', icon: <MdDashboard />, key: 'dashboard' },
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
          <ProfileContainer
            data={data?.data}
            query={params.id}
            profile={profileInfo}
          />
        )
      case 'appointments':
        return <div>test</div>
      // Add more cases as needed for different tabs
      default:
        return null
    }
  }

  return (
    <div className="flex">
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
