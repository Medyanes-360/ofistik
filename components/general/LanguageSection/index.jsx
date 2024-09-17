import { postAPI } from '@/services/fetchAPI'
import { useState } from 'react'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'
import { GrLanguage } from 'react-icons/gr'
import { IoIosAddCircle } from 'react-icons/io'
import { toast } from 'react-toastify'

const LanguageSection = ({ data: userInfo, isOwner, refreshProfile }) => {
  const [languages, setLanguages] = useState(userInfo.languages)
  const [editLanguagesId, setEditLanguagesId] = useState(null)
  const [editLanguagesData, setEditLanguagesData] = useState({
    languageName: '',
    level: '',
  })
  const handleEditLanguageClick = (id, languageName, level) => {
    setEditLanguagesId(id)
    setEditLanguagesData({ languageName, level })
  }

  const handleLanguageInputChange = (e) => {
    const { name, value } = e.target
    setEditLanguagesData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSaveNewLanguageClick = async () => {
    if (!editLanguagesData.languageName || !editLanguagesData.level) {
      alert('Lütfen Dil ismi ve seviye alanlarını doldurun.')
      return
    }

    let data
    if (editLanguagesId === 'new') {
      data = {
        languageName: editLanguagesData.languageName,
        level: editLanguagesData.level,
        id: null,
        hizmetVerenId: userInfo.id,
      }
    } else {
      data = {
        id: editLanguagesId,
        languageName: editLanguagesData.languageName,
        level: editLanguagesData.level,
        hizmetVerenId: userInfo.id,
      }
    }

    try {
      const res = await postAPI(
        '/profile/general/language/upsert-language',
        data
      )
      if (res.status === 'ADDED') {
        toast.success('Dil bilgisi başarıyla eklendi')
        setLanguages((prevInfo) => [
          ...prevInfo,
          { id: Date.now().toString(), ...editLanguagesData },
        ])
      } else if (res.status === 'UPDATED') {
        toast.success('Dil bilgisi güncellendi')
        setLanguages((prevInfo) =>
          prevInfo.map((language) =>
            language.id === editLanguagesId
              ? { ...language, ...editLanguagesData }
              : language
          )
        )
        refreshProfile()
      } else {
        console.log(res.message)
      }
      refreshProfile()
    } catch (error) {
      console.error('API request failed:', error)
    }

    setEditLanguagesId(null)
    setEditLanguagesData({ languageName: '', level: '' })
  }

  const handleAddLanguageClick = () => {
    setEditLanguagesId('new')
    setEditLanguagesData({ languageName: '', level: '' })
  }

  const handleCancelClickLanguage = () => {
    setEditLanguagesId(null)
    setEditLanguagesData({ languageName: '', level: '' })
  }

  const handleDeleteLanguageClick = async (id) => {
    try {
      const res = await postAPI('/profile/general/language/delete-language', {
        id: id,
      })
      if (res.status === 'DELETED') {
        toast.success('Dil bilgisi başarıyla Silindi')
        setLanguages((prevInfo) =>
          prevInfo.filter((language) => language.id !== id)
        )
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-5">
        <GrLanguage className="text-[11px] sm:text-sm telefon:text-lg md:text-[15px] font-medium text-premiumOrange" />
        <h1 className="text-[11px] sm:text-sm telefon:text-lg md:text-[15px] font-medium text-gray-700">
          Diller
        </h1>
      </div>
      <div className="bg-white p-5 rounded-md shadow-lg text-gray-800 ">
        {editLanguagesId === null && isOwner && (
          <button
            className=" text-black px-2 py-1 flex  justify-end w-full items-end"
            onClick={handleAddLanguageClick}
          >
            <IoIosAddCircle
              size={25}
              className="text-blue-600 hover:text-blue-500"
            />
          </button>
        )}

        {editLanguagesId !== null && (
          <div className="w-full flex flex-col">
            <input
              type="text"
              name="languageName"
              className="w-full p-2 border rounded mb-2"
              value={editLanguagesData.languageName}
              onChange={handleLanguageInputChange}
              placeholder="Dil"
            />
            <input
              type="text"
              name="level"
              className="w-full p-2 border rounded mb-2"
              value={editLanguagesData.level}
              placeholder="Seviye"
              onChange={handleLanguageInputChange}
            />
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-2 py-1"
                onClick={handleSaveNewLanguageClick}
              >
                Kaydet
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1"
                onClick={handleCancelClickLanguage}
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {languages.length > 0 ? (
          <ul className="w-full flex flex-col gap-3 items-start text-[11px]">
            {languages.map((language) => (
              <li
                className="w-full flex items-center justify-between border-b pb-3 mt-2"
                key={language.id}
              >
                <div className="flex items-center justify-between w-full">
                  <h1>{language.languageName}</h1>

                  <div className="flex items-center gap-4">
                    <h1>{language.level}</h1>
                    {isOwner && (
                      <div className="flex items-center">
                        <button
                          className="text-blue-500 hover:text-blue-400 px-2 py-1 ml-2"
                          onClick={() =>
                            handleEditLanguageClick(
                              language.id,
                              language.languageName,
                              language.level
                            )
                          }
                        >
                          <FaPencilAlt size={15} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-400 px-2 py-1 ml-2"
                          onClick={() => handleDeleteLanguageClick(language.id)}
                        >
                          <FaTrash size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Herhangi Bir Dil Bilgisi Bulunamadı...</p>
        )}
      </div>
    </>
  )
}
export default LanguageSection
