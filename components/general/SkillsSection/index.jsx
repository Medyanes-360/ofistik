import { postAPI } from '@/services/fetchAPI'
import { useState } from 'react'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'
import { IoIosAddCircle } from 'react-icons/io'
import { PiStethoscopeFill } from 'react-icons/pi'
import { toast } from 'react-toastify'

const SkillsSection = ({ data: userInfo, isOwner, refreshProfile }) => {
  const [skills, setSkills] = useState(userInfo.skills)
  const [editSkillId, setEditSkillId] = useState(null)
  const [editSkillData, setEditSkillData] = useState({
    name: '',
  })
  const handleEditSkillClick = (id, name) => {
    setEditSkillId(id)
    setEditSkillData({ name })
  }

  const handleSkillInputChange = (e) => {
    const { name, value } = e.target
    setEditSkillData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSaveNewSkillClick = async () => {
    if (!editSkillData.name) {
      alert('Lütfen Hizmet Alanını Doldurunuz.')
      return
    }

    let data
    if (editSkillId === 'new') {
      data = {
        name: editSkillData.name,
        id: null,
        hizmetVerenId: userInfo.id,
      }
    } else {
      data = {
        id: editSkillId,
        name: editSkillData.name,
        hizmetVerenId: userInfo.id,
      }
    }

    try {
      const res = await postAPI('/profile/general/skill/upsert-skill', data)
      if (res.status === 'ADDED') {
        toast.success('Hizmet Alanı bilgisi başarıyla eklendi')
        setSkills((prevInfo) => [
          ...prevInfo,
          { id: Date.now().toString(), ...editSkillData },
        ])
      } else if (res.status === 'UPDATED') {
        toast.success('Hizmet Alanı bilgisi güncellendi')
        setSkills((prevInfo) =>
          prevInfo.map((skill) =>
            skill.id === editSkillId ? { ...skill, ...editSkillData } : skill
          )
        )
      } else {
        console.log(res.message)
      }
      refreshProfile()
    } catch (error) {
      console.error('API request failed:', error)
    }

    setEditSkillId(null)
    setEditSkillData({ name: '' })
  }

  const handleAddSkillClick = () => {
    setEditSkillId('new')
    setEditSkillData({ name: '' })
  }

  const handleCancelClickSkill = () => {
    setEditSkillId(null)
    setEditSkillData({ name: '' })
  }

  const handleDeleteSkillClick = async (id) => {
    try {
      const res = await postAPI('/profile/general/skill/delete-skill', {
        id: id,
      })
      if (res.status === 'DELETED') {
        toast.success('Hizmet Alanı bilgisi başarıyla Silindi')
        setSkills((prevInfo) => prevInfo.filter((skill) => skill.id !== id))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-5">
        <PiStethoscopeFill className="text-[11px] sm:text-sm telefon:text-lg md:text-[15px] font-medium text-premiumOrange" />
        <h1 className="text-[11px] sm:text-sm telefon:text-lg md:text-[15px] font-medium text-gray-700">
          Hizmet Alanı
        </h1>
      </div>
      <div className="bg-white p-5 rounded-md shadow-lg text-gray-800 ">
        {isOwner && editSkillId === null && (
          <button
            className=" text-black px-2 py-1 flex  justify-end w-full items-end"
            onClick={handleAddSkillClick}
          >
            <IoIosAddCircle
              size={25}
              className="text-blue-600 hover:text-blue-500"
            />
          </button>
        )}

        {isOwner && editSkillId !== null && (
          <div className="w-full flex flex-col">
            <input
              type="text"
              name="name"
              className="w-full p-2 border rounded mb-2"
              value={editSkillData.name}
              onChange={handleSkillInputChange}
              placeholder="Sertifika"
            />

            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-2 py-1"
                onClick={handleSaveNewSkillClick}
              >
                Kaydet
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1"
                onClick={handleCancelClickSkill}
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {skills.length > 0 ? (
          <ul className="w-full flex flex-col gap-3 items-start text-[11px]">
            {skills.map((skill) => (
              <li
                className="w-full flex items-center justify-between border-b pb-3 mt-2"
                key={skill.id}
              >
                <div className="flex items-center justify-between w-full">
                  <h1>{skill.name}</h1>

                  {isOwner && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <button
                          className="text-blue-500 hover:text-blue-400 px-2 py-1 ml-2"
                          onClick={() =>
                            handleEditSkillClick(skill.id, skill.name)
                          }
                        >
                          <FaPencilAlt size={15} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-400 px-2 py-1 ml-2"
                          onClick={() => handleDeleteSkillClick(skill.id)}
                        >
                          <FaTrash size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Herhangi Bir Hizmet Alanı Bilgisi Bulunamadı...</p>
        )}
      </div>
    </>
  )
}
export default SkillsSection
