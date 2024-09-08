import ResumeSection from '@/components/general/ResumeSection'
import EducationInfoSection from '@/components/general/EducationInfoSection'
import Certificate from '@/components/general/CertificateSection'
import { useEffect, useState } from 'react'
import { getAPI } from '@/services/fetchAPI'

import SkillsSection from '@/components/general/SkillsSection'
import LanguageSection from '@/components/general/LanguageSection'
import { useSession } from 'next-auth/react'

const TabItemsGeneral = ({ query }) => {
  const { data: session } = useSession()
  const id = session?.user.id

  const [profileInfo, setProfileInfo] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false) // isOwner state'i oluşturuldu

  useEffect(() => {
    const getProfile = async () => {
      const result = await getAPI(`/profile/${query}/get-profile`)
      if (result.status === 'success') {
        setProfileInfo(result.data)
        console.log(result.data.user.id)

        // API'den dönen id ile session id'sini karşılaştır
        if (result.data.user.id === id) {
          setIsOwner(true)
        } else {
          setIsOwner(false)
        }

        setLoading(false)
      }
    }
    getProfile()
  }, []) // useEffect bağımlılığına query'yi de ekledik

  return (
    !loading && (
      <div className="lg:h-[calc(100vh_-_200px)] w-full mx-auto lg:overflow-y-scroll top-0 bottom-0 flex flex-col gap-3 pt-5">
        <ResumeSection
          mockData={profileInfo}
          loading={loading}
          isOwner={isOwner}
        />
        <EducationInfoSection mockData={profileInfo} isOwner={isOwner} />
        <Certificate mockData={profileInfo} isOwner={isOwner} />
        <SkillsSection data={profileInfo} isOwner={isOwner} />
        <LanguageSection data={profileInfo} isOwner={isOwner} />
      </div>
    )
  )
}

export default TabItemsGeneral
