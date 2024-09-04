'use client'
import MessagesList from '@/components/LeftSection/MessagesList'
import Chat from '@/components/RigthSection/Chat'
import { ChakraProvider } from '@chakra-ui/react'
import PhoneBookContext from '@/context/PhoneBookContext'
import { useState, useEffect } from 'react'

import { useSession } from 'next-auth/react'
import { postAPI, getAPI } from '@/services/fetchAPI'

export default function Home() {
  const [selectedUser, setSelectedUser] = useState()
  const [inbox, setInbox] = useState([])
  const { data: session } = useSession()
  const [selectOption, setSelectOption] = useState('inbox')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMessage, setSearchMessage] = useState('')
  useEffect(() => {
    const getMessages = async () => {
      if (session?.user?.id) {
        const res = await getAPI(
          `/message/${session.user.id}/get-messages?queryType=${selectOption}`
        )

        console.log(res)

        let filteredInbox = res

        if (searchQuery) {
          const cleanedQuery = searchQuery
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase()

          filteredInbox = res.filter(
            (chat) =>
              chat.starter.username
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .includes(cleanedQuery) ||
              chat.participant.username
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .includes(cleanedQuery)
          )
        }

        setInbox(filteredInbox)
      }
    }

    getMessages()
  }, [session, selectedUser, selectOption, searchQuery])

  const showAvatar = true
  const showCheckBox = true
  const handleUserSelect = async (chatId) => {
    const data = { chatId, receiverId: session.user.id }
    const res = await postAPI('/message/get-message', data)

    setSelectedUser(res)
    setSearchMessage('')
  }

  const handleIsMutedChange = () => {
    const updatedUsers = users.map((user) => {
      if (user.id === selectedUser.id) {
        return { ...user, isMuted: !user.isMuted }
      }
      return user
    })
    setUsers(updatedUsers)
    setSelectedUser({ ...selectedUser, isMuted: !selectedUser.isMuted })
  }

  const data = {
    showCheckBox,
    showAvatar,
    selectedUser,
    handleUserSelect,
    handleIsMutedChange,
    selectOption,
    setSelectOption,
    setSearchMessage,
    searchMessage,
  }

  return (
    <PhoneBookContext.Provider value={data}>
      <ChakraProvider>
        <div className="flex  bg-inputbg">
          <MessagesList inbox={inbox} setSearchQuery={setSearchQuery} />
          <Chat selectedUser={selectedUser} />
        </div>
      </ChakraProvider>
    </PhoneBookContext.Provider>
  )
}
