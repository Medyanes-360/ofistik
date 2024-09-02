'use client'

import Sidebar from '@/components/sidebar'
import MyAppointments from '@/components/userAppointmentListModule/myAppointments'
import MembershipInfo from '@/containers/Home/_components/receiverProfile/MembershipInfo'
import PasswordUpdate from '@/containers/Home/_components/receiverProfile/PasswordUpdate'
import { getAPI } from '@/services/fetchAPI'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

const ProfilePage = ({ params }) => {
  const [appointments, setAppointments] = useState([])
  const [profileInfo, setProfileInfo] = useState()
  const [activeTab, setActiveTab] = useState('profile')
  const { data: session } = useSession()

  useEffect(() => {
    const getProfileInfo = async () => {
      const res = await getAPI(
        `/profile/${session.user.id}/get-profile-receiver`
      )
      setProfileInfo(res.data)
      if (res.status === 'success') {
        const appointments = await getAPI(
          `/appointment/receiver/${res.data.id}/get-appointment`
        )
        setAppointments(appointments.data)
      }
    }
    if (session?.user?.id) {
      getProfileInfo()
    }
  }, [session?.user?.id])

  return (
    <div className="flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profileInfo}
      />
      <div className="bg-grayBg w-full min-h-screen pt-20 sm:pt-36 pb-10 p-3 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <MembershipInfo profileInfo={profileInfo} />
              <PasswordUpdate />
            </div>
          )}

          {activeTab === 'appointments' && (
            <MyAppointments appointments={appointments} />
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
