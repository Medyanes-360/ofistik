import { postAPI } from '@/services/fetchAPI'
import { useState } from 'react'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'
import { IoIosAddCircle } from 'react-icons/io'
import { LiaCertificateSolid } from 'react-icons/lia'
import { toast } from 'react-toastify'

const Certificate = ({ mockData, isOwner, refreshProfile }) => {
  const [certificates, setSertificates] = useState(mockData.certificates)
  const [editCertificateId, setEditCertificateId] = useState(null)
  const [editCertificationData, setEditCertificationData] = useState({
    certificate: '',
    year: '',
  })

  const handleEditCertificateClick = (id, certificate, year) => {
    setEditCertificateId(id)
    setEditCertificationData({ certificate, year })
  }

  const handleCertificateInputChange = (e) => {
    const { name, value } = e.target
    setEditCertificationData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSaveNewCertificateClick = async () => {
    if (!editCertificationData.certificate || !editCertificationData.year) {
      alert('Lütfen Sertifika ismi ve bitiş tarihini doldurun.')
      return
    }

    let data
    if (editCertificateId === 'new') {
      refreshProfile()
      data = {
        certificate: editCertificationData.certificate,
        year: editCertificationData.year,
        id: null,
        hizmetVerenId: mockData.id,
      }
    } else {
      refreshProfile()
      data = {
        id: editCertificateId,
        certificate: editCertificationData.certificate,
        year: editCertificationData.year,
        hizmetVerenId: mockData.id,
      }
    }

    try {
      const res = await postAPI(
        '/profile/general/certificate/upsert-certificate',
        data
      )
      if (res.status === 'ADDED') {
        toast.success('Sertifika bilgisi başarıyla eklendi')
        setSertificates((prevInfo) => [
          ...prevInfo,
          { id: Date.now().toString(), ...editCertificationData },
        ])
      } else if (res.status === 'UPDATED') {
        toast.success('Sertifika bilgisi güncellendi')
        setSertificates((prevInfo) =>
          prevInfo.map((certificate) =>
            certificate.id === editCertificateId
              ? { ...certificate, ...editCertificationData }
              : certificate
          )
        )
      } else {
        console.log(res.message)
      }
    } catch (error) {
      console.error('API request failed:', error)
    }

    setEditCertificateId(null)
    setEditCertificationData({ certificate: '', year: '' })
  }

  const handleAddCertificateClick = () => {
    setEditCertificateId('new')
    setEditCertificationData({ certificate: '', year: '' })
  }

  const handleCancelClickCertificate = () => {
    setEditCertificateId(null)
    setEditCertificationData({ certificate: '', year: '' })
  }

  const handleDeleteCertificateClick = async (id) => {
    try {
      const res = await postAPI(
        '/profile/general/certificate/delete-certificate',
        {
          id: id,
        }
      )
      if (res.status === 'DELETED') {
        toast.success('Sertifika bilgisi başarıyla silindi')
        setSertificates((prevInfo) =>
          prevInfo.filter((certificate) => certificate.id !== id)
        )
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-5">
        <LiaCertificateSolid className="text-[11px] sm:text-sm telefon:text-lg md:text-[15px] font-medium text-premiumOrange" />
        <h1 className="text-[11px] sm:text-sm telefon:text-lg md:text-[15px] font-medium text-gray-700">
          Sertifikalar
        </h1>
      </div>
      <div className="bg-white p-5 rounded-md shadow-lg text-gray-800 ">
        {isOwner && editCertificateId === null && (
          <button
            className="text-black px-2 py-1 flex justify-end w-full items-end"
            onClick={handleAddCertificateClick}
          >
            <IoIosAddCircle
              size={25}
              className="text-blue-600 hover:text-blue-500"
            />
          </button>
        )}

        {editCertificateId !== null && (
          <div className="w-full flex flex-col">
            <input
              type="text"
              name="certificate"
              className="w-full p-2 border rounded mb-2"
              value={editCertificationData.certificate}
              onChange={handleCertificateInputChange}
              placeholder="Sertifika"
            />
            <input
              type="text"
              name="year"
              className="w-full p-2 border rounded mb-2"
              value={editCertificationData.year}
              placeholder="Bitiş Tarihi"
              onChange={handleCertificateInputChange}
            />
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-2 py-1"
                onClick={handleSaveNewCertificateClick}
              >
                Kaydet
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1"
                onClick={handleCancelClickCertificate}
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {certificates.length > 0 ? (
          <ul className="w-full flex flex-col gap-3 items-start text-[11px]">
            {certificates.map((certificate) => (
              <li
                className="w-full flex items-center justify-between border-b pb-3 mt-2"
                key={certificate.id}
              >
                <div className="flex items-center justify-between w-full">
                  <h1>{certificate.certificate}</h1>

                  <div className="flex items-center gap-4">
                    <h1>{certificate.year}</h1>
                    {isOwner && (
                      <div className="flex items-center">
                        <button
                          className="text-blue-500 hover:text-blue-400 px-2 py-1 ml-2"
                          onClick={() =>
                            handleEditCertificateClick(
                              certificate.id,
                              certificate.certificate,
                              certificate.year
                            )
                          }
                        >
                          <FaPencilAlt size={15} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-400 px-2 py-1 ml-2"
                          onClick={() =>
                            handleDeleteCertificateClick(certificate.id)
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
          <p>Herhangi Bir Sertifika Bilgisi Bulunamadı...</p>
        )}
      </div>
    </>
  )
}

export default Certificate
