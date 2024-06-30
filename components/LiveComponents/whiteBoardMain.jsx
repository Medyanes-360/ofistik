import { useFastboard, Fastboard } from "@netless/fastboard-react";
import React, { useEffect, useState } from "react";

function WhiteBoardMain({ roomToken, uid, uuid, showChat, showParticipants }) {
  const [fastboard, setFastboard] = useState(null);
  const [size, setSize] = useState("");

  useEffect(() => {
    // Fastboard başlatma işlemini burada güvenli bir şekilde gerçekleştirin
    try {
      const fb = useFastboard(() => ({
        sdkConfig: {
          appIdentifier: "PFDmUAhSEe-X_REUu_elzA/kmPn7ALITrakJQ",
          region: "us-sv",
        },
        joinRoom: {
          uid: uid,
          uuid: uuid,
          roomToken: roomToken,
        },
      }));
      setFastboard(fb);
    } catch (error) {
      console.error("An error occurred while initializing fastboard:", error);
    }
  }, [roomToken, uid, uuid]);

  useEffect(() => {
    // showChat ve showParticipants durumlarına göre genişliği ayarlayın
    if (showChat && showParticipants) {
      setSize("55vw");
    } else if (showChat && !showParticipants) {
      setSize("70vw");
    } else if (showParticipants && !showChat) {
      setSize("70vw");
    } else if (!showParticipants && !showChat) {
      setSize("80vw");
    }
  }, [showChat]);
  useEffect(() => {
    // showChat ve showParticipants durumlarına göre genişliği ayarlayın
    if (showChat && showParticipants) {
      setSize("55vw");
    } else if (showChat && !showParticipants) {
      setSize("70vw");
    } else if (showParticipants && !showChat) {
      setSize("70vw");
    } else if (!showParticipants && !showChat) {
      setSize("80vw");
    }
  }, [showParticipants]);

  return (
    <div
      id="white-board"
      style={{
        width: size,
        height: "100%",
        border: "1px solid",
        borderRadius: "15px",
        borderColor: "hsl(215, 20%, 75%)",
        background: "#f1f2f3",
      }}
    >
      {fastboard && <Fastboard app={fastboard} />}
    </div>
  );
}

export default WhiteBoardMain;
