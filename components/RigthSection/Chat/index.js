import React from 'react'
import ChatHeader from '../ChatHeader'
import Messages from '../Messages'

function Chat({ selectedUser }) {
  return selectedUser ? (
    <div className="md:w-[75%] w-full bg-messageBodyBg flex flex-col">
      <ChatHeader />
      <Messages />
    </div>
  ) : (
    <div className=" w-full bg-gray-300 flex justify-center items-center  fixed z-10 h-full">
      <span className="text-gray-700">Lütfen Bir Sohbet Seçiniz...</span>
    </div>
  )
}

export default Chat
