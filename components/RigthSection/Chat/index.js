import React from 'react'
import ChatHeader from '../ChatHeader'
import Messages from '../Messages'

function Chat({ selectedUser }) {
  return selectedUser ? (
    <div className="md:w-[75%] w-full bg-messageBodyBg flex flex-col  z-20 h-full">
      <ChatHeader />
      <Messages />
    </div>
  ) : (
    <div></div>
  )
}

export default Chat
