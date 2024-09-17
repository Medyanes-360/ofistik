import { postAPI } from '@/services/fetchAPI'
import { useState } from 'react'
import { FaUserGraduate, FaTrash } from 'react-icons/fa'
import { FaPencilAlt } from 'react-icons/fa'
import { IoIosAddCircle } from 'react-icons/io'
import { toast } from 'react-toastify'

const EducationInfoSection = ({ mockData, isOwner, refreshProfile }) => {
  const [educationInfo, setEducationInfo] = useState(
    mockData?.educationInfo || []
  )
  const [editEducationId, setEditEducationId] = useState(null)
  const [editEducationData, setEditEducationData] = useState({
    university: '',
    year: '',
  })

  const handleEditEducationClick = (id, university, year) => {
    setEditEducationId(id)
    setEditEducationData({ university, year })
  }

  const handleEducationInputChange = (e) => {
    const { name, value } = e.target
    setEditEducationData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSaveNewEducationClick = async () => {
    if (!editEducationData.university || !editEducationData.year) {
      alert('Lütfen okul adı ve bitiş tarihini doldurun.')
      return
    }

    let data
    if (editEducationId === 'new') {
      // Yeni eğitim bilgisi ekleniyor
      data = {
        university: editEducationData.university,
        year: editEducationData.year,
        id: null, // id alanını null olarak bırakıyoruz.
        hizmetVerenId: mockData.id,
      }
    } else {
      // Mevcut eğitim bilgisi güncelleniyor
      data = {
        id: editEducationId,
        university: editEducationData.university,
        year: editEducationData.year,
        hizmetVerenId: mockData.id,
      }
    }

    try {
      const res = await postAPI('/profile/education/upsert-education', data)
      if (res.status === 'ADDED') {
        toast.success('Eğitim bilgisi başarıyla eklendi')

        setEducationInfo((prevInfo) => [
          ...prevInfo,
          { id: Date.now().toString(), ...editEducationData },
        ])
        // Profil verisini güncelle
        refreshProfile()
      } else if (res.status === 'UPDATED') {
        toast.success('Eğitim bilgisi başarıyla güncellendi')

        setEducationInfo((prevInfo) =>
          prevInfo.map((education) =>
            education.id === editEducationId
              ? { ...education, ...editEducationData }
              : education
          )
        )
        // Profil verisini güncelle
        refreshProfile()
      } else {
        console.log(res.message)
      }
    } catch (error) {
      console.error('API request failed:', error)
    }

    setEditEducationId(null)
    setEditEducationData({ university: '', year: '' })
  }

  const handleAddEducationClick = () => {
    if (educationInfo.length >= 2) {
      alert('Maksimum 2 eğitim bilgisi ekleyebilirsiniz.')
      return
    }
    setEditEducationId('new')
    setEditEducationData({ university: '', year: '' })
  }

  const handleCancelClickEducation = () => {
    setEditEducationId(null)
    setEditEducationData({ university: '', year: '' })
  }

  const handleDeleteEducationClick = async (id) => {
    try {
      const res = await postAPI('/profile/education/delete-education', {
        id: id,
      })
      if (res.status === 'DELETED') {
        toast.success('Eğitim bilgisi başarıyla silindi')
        setEducationInfo((prevInfo) =>
          prevInfo.filter((education) => education.id !== id)
        )
        // Profil verisini güncelle
        refreshProfile()
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-5">
        <FaUserGraduate className="text-[11px] sm:text-sm telefon:text-lg md:text-[15px] text-premiumOrange" />
        <h1 className="text-[11px] sm:text-sm telefon:text-lg md:text-[15px] font-medium text-gray-700">
          Eğitim Bilgileri
        </h1>
      </div>
      <div className="bg-white p-5 rounded-md shadow-lg text-gray-800 ">
        {editEducationId === null && educationInfo.length < 2 && isOwner && (
          <button
            className=" text-black px-2 py-1 flex  justify-end w-full items-end"
            onClick={handleAddEducationClick}
          >
            <IoIosAddCircle
              size={25}
              className="text-blue-600 hover:text-blue-500"
            />
          </button>
        )}

        {editEducationId !== null && (
          <div className="w-full flex flex-col">
            <input
              type="text"
              name="university"
              className="w-full p-2 border rounded mb-2"
              value={editEducationData.university}
              onChange={handleEducationInputChange}
              placeholder="Okul Adı"
            />
            <input
              type="text"
              name="year"
              className="w-full p-2 border rounded mb-2"
              value={editEducationData.year}
              placeholder="Bitiş Tarihi"
              onChange={handleEducationInputChange}
            />
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-2 py-1"
                onClick={handleSaveNewEducationClick}
              >
                Kaydet
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1"
                onClick={handleCancelClickEducation}
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {educationInfo.length > 0 ? (
          <ul className="w-full flex flex-col gap-3 items-start text-[11px]">
            {educationInfo.map((education) => (
              <li
                className="w-full flex items-center justify-between border-b pb-3 mt-2"
                key={education.id}
              >
                <div className="flex items-center justify-between w-full">
                  <h1>{education.university}</h1>

                  <div className="flex items-center gap-4">
                    <h1>{education.year}</h1>
                    {isOwner && (
                      <div className="flex items-center">
                        <button
                          className="text-blue-500 hover:text-blue-400 px-2 py-1 ml-2"
                          onClick={() =>
                            handleEditEducationClick(
                              education.id,
                              education.university,
                              education.year
                            )
                          }
                        >
                          <FaPencilAlt size={15} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-400 px-2 py-1 ml-2"
                          onClick={() =>
                            handleDeleteEducationClick(education.id)
                          }
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
          <p>Herhangi Bir Eğitim Bilgisi Bulunamadı...</p>
        )}
      </div>
    </>
  )
}

export default EducationInfoSection
