import React, { useContext } from 'react'
import PhoneBookContext from '@/context/PhoneBookContext'
import { PiSpeakerSimpleXLight } from 'react-icons/pi'
import { MdCheck } from 'react-icons/md'
import { IoCheckmarkDoneSharp } from 'react-icons/io5'
import { formatMessageDate } from '@/lib/utilities/dayGenerator'
import { useSession } from 'next-auth/react'

function DirectMessages({ inbox, filterType }) {
  const { handleUserSelect } = useContext(PhoneBookContext)
  const { data: session } = useSession()

  return (
    <div className="mt-[250px]  ">
      <div className="flex justify-between items-center pr-7"></div>
      <div className="mt-5">
        {inbox.map((person) => (
          <React.Fragment key={person.id}>
            <div
              className="flex justify-between items-center hover:bg-inputbg pr-8 pl-10 py-3 cursor-pointer"
              onClick={() => handleUserSelect(person.id)}
            >
              <div className="flex">
                <div className="relative">
                  <img
                    src="https://w7.pngwing.com/pngs/340/946/png-transparent-avatar-user-computer-icons-software-developer-avatar-child-face-heroes.png"
                    alt="avatar"
                    className="w-14 h-14 object-cover"
                  />
                  <div className="absolute bg-dotBg w-3 h-3 rounded-full right-0 bottom-2 border border-[2px] border-inputbg"></div>
                </div>
                <div className="ml-3">
                  <h2 className="text-ms font-semibold text-favTxt">
                    {person.starter.id === session.user.id
                      ? person.participant.username
                      : person.starter.username}
                  </h2>
                  <div className="flex flex-col text-personMesTxt font-[400]">
                    <span className="text-md">
                      {person.lastMessage.content}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-muted flex items-center space-x-2">
                  {/* Uncomment and use this if needed */}
                  {/* {person.isMuted && (
                      <div className="text-muted">
                        <span>
                          <PiSpeakerSimpleXLight />
                        </span>
                      </div>
                    )} */}
                  <div>{formatMessageDate(person.lastMessage.createdAt)}</div>
                  <div>
                    {!person.lastMessage.isRead && (
                      <IoCheckmarkDoneSharp className="text-checktxt" />
                    )}
                    {person.lastMessage.isRead && (
                      <IoCheckmarkDoneSharp className="text-premiumOrange" />
                    )}
                  </div>
                </div>
                <div>
                  {person.unreadMessagesCount > 0 && (
                    <div className="w-5 h-5 bg-premiumOrange text-xs text-plusTxt font-bold flex items-center rounded-full p-3 justify-center">
                      <span>{person.unreadMessagesCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="border-b w-[75%] ml-10" />
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default DirectMessages
