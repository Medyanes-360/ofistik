import React, { useState } from 'react'
import Header from '../Header'
import DirectMessages from '../DirectMessages'
import styles from './styles.module.css'

function MessagesList({ inbox, setSearchQuery }) {
  const [filterType, setFilterType] = useState('inbox') // Yeni state

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (type) => {
    setFilterType(type)
  }

  return (
    <div
      className={`${styles.scrollStyle} md:w-[50%] lg:w-[50%] xl:w-[25%] w-[100%]  overflow-y-auto bg-messageBodyBg  min-h-[100vh] pb-10 max-h-[120vh]   }`}
    >
      <Header onSearch={handleSearch} onFilterChange={handleFilterChange} />
      <DirectMessages inbox={inbox} filterType={filterType} />
    </div>
  )
}

export default MessagesList
