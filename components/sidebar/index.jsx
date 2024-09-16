"use client";

import { useState, useEffect } from "react";
import {
  FiSettings,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import Image from "next/image";
import profileImg from "./man.png";
import { useRouter } from "next/navigation";
import { FiUser, FiCalendar } from "react-icons/fi";
import { MdDashboard, MdCampaign } from "react-icons/md";
import { FaAd, FaMoneyBillAlt } from "react-icons/fa";
import { RiMessage2Fill } from "react-icons/ri";
import { IoShareSocial } from "react-icons/io5";
import { FcStatistics } from "react-icons/fc";
import Page from "@/app/live/page";

const Sidebar = ({ activeTab, setActiveTab, profile, type }) => {
  console.log(type);

  const allTabs = [
    { name: "Profil", icon: <FiUser />, key: "profile" },
    {
      name: "Randevularım",
      icon: <FiCalendar />,
      key: "appointments",
      subTabs: [
        { name: "Upcoming", key: "upcoming" },
        { name: "Past", key: "past" },
      ],
    },
    { name: "Kontrol Paneli", icon: <MdDashboard />, key: "dashboard" },
    { name: "Reklamlar", icon: <FaAd />, key: "addsense" },
    { name: "Kampanyalar", icon: <MdCampaign />, key: "campaign" },
    { name: "Mesajlar", icon: <RiMessage2Fill />, key: "messages" },
    { name: "Finans", icon: <FaMoneyBillAlt />, key: "finance" },
    { name: "Sosyal", icon: <IoShareSocial />, key: "social" },
    {
      name: "Sosyal İstatistik",
      icon: <FcStatistics />,
      key: "socialStatistic",
    },
    { name: "Toplantı Oluştur", icon: <Page />, key: "create-meeting" },
  ];

  // type'a göre sekmeleri filtreleme
  const filteredTabs = allTabs.filter((tab) => {
    if (type === "BOTH") {
      return true; // Tüm sekmeler gösterilir
    }
    if (type === "RECEIVER") {
      return tab.key === "profile" || tab.key === "appointments"; // Sadece Profil ve Randevularım gösterilir
    }
    if (type === "PROVIDER") {
      return tab.key !== "appointments"; // Randevularım harici tüm sekmeler gösterilir
    }
    return false; // Default durumda hiçbir şey gösterilmez
  });

  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [openTab, setOpenTab] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
    setOpenTab(null);
  };

  const toggleSubMenu = (tab) => {
    setOpenTab(openTab === tab ? null : tab);
  };

  const handleClickOutside = (event) => {
    if (event.target.closest(".sub-menu-popup")) return;
    setOpenTab(null);
  };

  useEffect(() => {
    if (!isSidebarOpen && openTab) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [openTab, isSidebarOpen]);

  const handleTabClick = (tab) => {
    if (tab.name == "Profil") {
      router.push(`/profile/${profile.user.username}`);
      setActiveTab(tab.key);
    } else if (tab.subTabs) {
      toggleSubMenu(tab.key);
    } else {
      setActiveTab(tab.key);
    }
  };

  return (
    <div
      className={`bg-white text-gray-600 fixed top-0 left-0 h-screen ${
        isSidebarOpen ? "w-80" : "w-20"
      } min-h-screen flex flex-col p-4 transition-all duration-300 relative z-50`}
    >
      <div
        className={`mb-8 flex items-center  ${
          isSidebarOpen ? "justify-between" : "justify-center"
        }`}
      >
        {isSidebarOpen && (
          <div className="flex items-center space-x-4">
            <Image
              width={100}
              height={100}
              src={profile?.profileImg || profileImg}
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
            className={`p-2 rounded bg-gray-200 text-white placeholder-gray-400 pl-12 transition-all duration-300 ${
              isSidebarOpen ? "w-full" : "w-0"
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
                    ? "bg-premiumOrange text-white"
                    : ""
                }`}
                onClick={() => handleTabClick(tab)}
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
                        activeTab === subTab.key
                          ? "bg-premiumOrange text-white"
                          : ""
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
                        activeTab === subTab.key ? "bg-gray-600" : ""
                      }`}
                      onClick={() => {
                        setActiveTab(subTab.key);
                        setOpenTab(null);
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
          <>
            {isSidebarOpen && (
              <p className="text-center text-gray-400">Sonuç Bulunamadı...</p>
            )}
          </>
        )}
      </nav>
      <div className="mt-auto">
        <button
          className={`flex items-center p-3 text-sm font-medium rounded-lg  w-full ${
            activeTab === "support" ? "bg-premiumOrange text-white" : ""
          }`}
          onClick={() => setActiveTab("support")}
        >
          <FiHelpCircle className="mr-2" />
          {isSidebarOpen && "Destek"}
        </button>
        <button
          className={`flex items-center p-3 text-sm font-medium rounded-lg w-full ${
            activeTab === "settings" ? "bg-premiumOrange text-white" : ""
          }`}
          onClick={() => setActiveTab("settings")}
        >
          <FiSettings className="mr-2" />
          {isSidebarOpen && "Ayarlar"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
