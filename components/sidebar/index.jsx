'use client'

import { useState, useEffect } from 'react'
import {
  FiUser,
  FiCalendar,
  FiSettings,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiChevronLeft,
} from 'react-icons/fi'
import { CiSearch } from 'react-icons/ci'

const Sidebar = ({ activeTab, setActiveTab, profile }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [openTab, setOpenTab] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

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
  ]

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen)
    setOpenTab(null) // Close any open sub-tabs when toggling the sidebar
  }

  const toggleSubMenu = (tab) => {
    setOpenTab(openTab === tab ? null : tab)
  }

  const filteredTabs = tabs.filter(
    (tab) =>
      tab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tab.subTabs &&
        tab.subTabs.some((subTab) =>
          subTab.name.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  )

  const handleClickOutside = (event) => {
    if (event.target.closest('.sub-menu-popup')) return // Prevent closing when clicking inside the popup
    setOpenTab(null)
  }

  useEffect(() => {
    if (!isSidebarOpen && openTab) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }

    return () => document.removeEventListener('click', handleClickOutside)
  }, [openTab, isSidebarOpen])

  return (
    <div
      className={`bg-gray-900 text-white ${
        isSidebarOpen ? 'w-80' : 'w-20'
      } min-h-screen flex flex-col p-4 transition-all duration-300 relative`}
    >
      <div
        className={`mb-8 flex items-center  ${
          isSidebarOpen ? 'justify-between' : 'justify-center'
        }`}
      >
        {isSidebarOpen && (
          <div className="flex items-center space-x-4">
            <img
              src="/path/to/profile-picture.jpg"
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
            {profile && (
              <div>
                <h2 className="text-base font-semibold">{`${profile.name} ${profile.surname}`}</h2>
                <p className="text-sm">{profile.user.email}</p>
              </div>
            )}
          </div>
        )}
        <button onClick={toggleSidebar}>
          {isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
        </button>
      </div>

      {isSidebarOpen && (
        <div className="mb-4 relative">
          <CiSearch
            className="absolute top-1/2 left-2 -translate-y-1/2"
            size={22}
          />
          <input
            type="text"
            placeholder="Ara"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`p-2 rounded bg-gray-800 text-white placeholder-gray-400 pl-12 transition-all duration-300 ${
              isSidebarOpen ? 'w-full' : 'w-0'
            }`}
          />
        </div>
      )}
      <nav className="flex flex-col space-y-2">
        {filteredTabs.length > 0 ? (
          filteredTabs.map((tab) => (
            <div key={tab.key}>
              <button
                className={`flex items-center justify-between p-3 text-sm font-medium rounded-lg w-full ${
                  activeTab === tab.key ||
                  (tab.subTabs &&
                    tab.subTabs.some((subTab) => activeTab === subTab.key))
                    ? 'bg-gray-700'
                    : ''
                }`}
                onClick={() =>
                  tab.subTabs ? toggleSubMenu(tab.key) : setActiveTab(tab.key)
                }
              >
                <div className="flex items-center">
                  {tab.icon}
                  {isSidebarOpen && <span className="ml-2">{tab.name}</span>}
                </div>
                {isSidebarOpen &&
                  tab.subTabs &&
                  (openTab === tab.key ? <FiChevronUp /> : <FiChevronDown />)}
              </button>
              {tab.subTabs && openTab === tab.key && isSidebarOpen && (
                <div className="pl-4 mt-2">
                  {tab.subTabs.map((subTab) => (
                    <button
                      key={subTab.key}
                      className={`flex items-center p-2 text-sm font-medium rounded-lg w-full ${
                        activeTab === subTab.key ? 'bg-gray-600' : ''
                      }`}
                      onClick={() => setActiveTab(subTab.key)}
                    >
                      {subTab.name}
                    </button>
                  ))}
                </div>
              )}
              {tab.subTabs && !isSidebarOpen && openTab === tab.key && (
                <div className="absolute bg-gray-800 text-white p-2 rounded shadow-lg ml-20 sub-menu-popup">
                  {tab.subTabs.map((subTab) => (
                    <button
                      key={subTab.key}
                      className={`block w-full text-left p-2 text-sm font-medium rounded-lg ${
                        activeTab === subTab.key ? 'bg-gray-600' : ''
                      }`}
                      onClick={() => {
                        setActiveTab(subTab.key)
                        setOpenTab(null) // Alt tab seçildiğinde alt menüyü kapat
                      }}
                    >
                      {subTab.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">Sonuç Bulunamadı...</p>
        )}
      </nav>
      <div className="mt-auto">
        <button
          className={`flex items-center p-3 text-sm font-medium rounded-lg  w-full ${
            activeTab === 'support' ? 'bg-gray-700' : ''
          }`}
          onClick={() => setActiveTab('support')}
        >
          <FiHelpCircle className="mr-2" />
          {isSidebarOpen && 'Destek'}
        </button>
        <button
          className={`flex items-center p-3 text-sm font-medium rounded-lg w-full ${
            activeTab === 'settings' ? 'bg-gray-700' : ''
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <FiSettings className="mr-2" />
          {isSidebarOpen && 'Ayarlar'}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
