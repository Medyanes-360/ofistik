import React, { memo } from "react";
import profile from "@/assets/icons/profile.png";
import Image from "next/image";

const Participants = memo(
  ({ showCtrl, setShowCtrl, rtmClient, totalMembers, participants }) => {
    const getName = async (participantId) => {
      let nameOfUser = "";
      try {
        setTimeout(async () => {
          const updateNameHTML = document.getElementById(
            `user-${participantId}`
          );

          const usernamePromise = rtmClient.getUserAttributesByKeys(
            participantId,
            ["name"]
          );
          const username = await usernamePromise;
          const { name } = username;
          nameOfUser = name;

          // return name;
          updateNameHTML.textContent = nameOfUser;
        }, 100);
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <div
        className={`h-full border-r border-r-slate-400 overflow-hidden transition-[width] fixed left-0 ${
          showCtrl.showParticipants ? "w-[90vw] md:w-[40vw] top-[10vh]" : "w-0"
        } z-30 bg-gray-100 lg:relative lg:w-[17vw]`}
      >
        <div className="relative m-3 p-5 font-bold flex items-center justify-center gap-4 border-b-2 border-gray-300">
          <span className="text-xl text-gray-600">Katılımcılar</span>
          <div className="bg-premiumOrange text-white w-8 h-8 flex justify-center items-center rounded-full">
            {totalMembers}
          </div>

          <button
            className="font-bold text-2xl absolute top-[3vh] left-2 lg:hidden"
            onClick={() =>
              setShowCtrl((prev) => ({
                ...prev,
                showParticipants: !showCtrl.showParticipants,
              }))
            }
          >
            X
          </button>
        </div>
        {/* Members */}
        <div className="mt-4 px-4 flex flex-col gap-3 w-full">
          {participants.map((participantId) => {
            getName(participantId);

            return (
              <div
                key={participantId}
                className="flex flex-row items-center gap-2"
              >
                <div className="imageArea border-green-500 border-2 rounded-full">
                  <Image src={profile} width={50} height={50} />
                </div>

                <span
                  id={`user-${participantId}`}
                  className="truncate text-gray-700 font-semibold text-right"
                >
                  {participantId}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

export default Participants;
