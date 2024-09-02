"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import AgoraRTC from "agora-rtc-sdk-ng";
import AgoraRTM from "agora-rtm-sdk";
import MainScreen from "./MainScreen";
import { Toaster, toast } from "react-hot-toast";
import Participants from "./Participants";
import LiveChat from "./LiveChat";
import Swal from "sweetalert2";
import { firebaseDb } from "./firebase";
const APP_ID = "b524a5780b4c4657bf7c8501881792be";
import AC from "agora-chat";
import { deleteObject, listAll, ref } from "firebase/storage";
import AWS from "aws-sdk";
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
const conn = new AC.connection({
  appKey: "611139134#1334578",
});
function Room() {
  const router = useRouter();
  const [whiteboardOpen, setWhiteboardOpen] = useState(true);
  const base = useParams();
  const fullChName = base.ChName;
  const chNameParts = fullChName.split("%3D");
  const chName = chNameParts[1];
  const channel = chName;
  const screenShareRef = useRef();
  const [token, setToken] = useState(null);
  const [joined, setJoined] = useState(false);
  const [chatShow, setChatShow] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showCamera, setShowCamera] = useState(true);
  const [UID, setUID] = useState("");
  const [role, setRole] = useState("");
  const [users, setUsers] = useState([]);
  const [timeElapsed1, setTimeElapsed1] = useState(0);
  const [localTracks, setLocalTracks] = useState({ audio: "", video: "" });
  const [screenShare, setScreenShare] = useState({ mode: false, track: "" });
  const [participants, setParticipants] = useState([]);
  const [rtmClient, setRtmClient] = useState(null);
  const [channelRes, setChannelRes] = useState(null);
  const [totalMembers, setTotalMembers] = useState(0);
  const [screenShareOpen, setScreenShareOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [showCtrl, setShowCtrl] = useState({
    showParticipants: false,
    showLiveChat: false,
  });
  const [inputUsername, setInputUsername] = useState("");
  const displayName = sessionStorage.getItem("username");
  const isMobile = window.innerWidth < 768;

  const [whiteboardStartTime, setWhiteboardStartTime] = useState(null);
  const [cameraStartTime, setCameraStartTime] = useState(null);
  const [screenShareStartTime, setScreenShareStartTime] = useState(null);
  const [whiteboardDuration, setWhiteboardDuration] = useState(0);
  const [cameraDuration, setCameraDuration] = useState(0);
  const [screenShareDuration, setScreenShareDuration] = useState(0);
  useEffect(() => {
    if (whiteboardOpen) {
      setWhiteboardStartTime(Date.now());
    } else if (whiteboardStartTime) {
      const now = Date.now();
      setWhiteboardDuration(
        (prev) => prev + (now - whiteboardStartTime) / 1000
      );
      setWhiteboardStartTime(null);
    }
  }, [whiteboardOpen]);

  useEffect(() => {
    if (screenShareOpen) {
      setScreenShareStartTime(Date.now());
    } else if (screenShareStartTime) {
      const now = Date.now();
      setScreenShareDuration(
        (prev) => prev + (now - screenShareStartTime) / 1000
      );
      setScreenShareStartTime(null);
    }
  }, [screenShareOpen]);

  useEffect(() => {
    if (showCamera) {
      setCameraStartTime(Date.now());
    } else if (cameraStartTime) {
      const now = Date.now();
      setCameraDuration((prev) => prev + (now - cameraStartTime) / 1000);
      setCameraStartTime(null);
    }
  }, [showCamera]);

  useEffect(() => {
    if (showCamera && cameraStartTime) {
      const intervalId = setInterval(() => {
        setCameraDuration(
          (prev) => prev + (Date.now() - cameraStartTime) / 1000
        );
        setCameraStartTime(Date.now());
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [showCamera, cameraStartTime]);

  useEffect(() => {
    if (isMobile) {
      setChatShow(true);
      setShowParticipants(false);
    }
  }, []);
  useEffect(() => {
    if (showCtrl.showParticipants || showCtrl.showLiveChat) {
      const elem = document.getElementById("video-holder");
      elem.scrollTop = 0;
      elem.style.overflow = "hidden";
    }
  }, [showCtrl.showParticipants, showCtrl.showLiveChat]);

  const updateMemberTotal = async (members) => {
    setTotalMembers(members.length);
  };

  const handleMemberJoined = async (MemberId) => {
    const members = await channelRes.getMembers();
    updateMemberTotal(members);
    setParticipants((prev) => [...prev, MemberId]);
    await rtmClient.getUserAttributesByKeys(String(MemberId), ["name"]);
  };

  const handleMemberLeft = async (MemberId) => {
    const members = await channelRes.getMembers();
    updateMemberTotal(members);
    setParticipants((prev) => prev.filter((id) => id !== MemberId));
  };
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };
  const leaveRoom = async () => {
    const now = Date.now();

    // Süre hesaplamalarını bitir
    const newWhiteboardDuration = whiteboardStartTime
      ? (now - whiteboardStartTime) / 1000
      : 0;
    const newScreenShareDuration = screenShareStartTime
      ? (now - screenShareStartTime) / 1000
      : 0;

    // Durasyonları güncelle
    setWhiteboardDuration((prev) => prev + newWhiteboardDuration);
    setScreenShareDuration((prev) => prev + newScreenShareDuration);

    // Durasyonlar güncellenene kadar bekle
    await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms bekle

    // Debugging için konsol çıktısı
    console.log(
      "Whiteboard duration:",
      whiteboardDuration + newWhiteboardDuration
    );
    console.log(
      "Screen share duration:",
      screenShareDuration + newScreenShareDuration
    );

    Swal.fire({
      title: "Çıkış yapılıyor...",
      html: "Lütfen bekleyin.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await channelRes.leave();
      await rtmClient.logout();

      if (participants.length === 1) {
        const params = {
          Bucket: "ofistikwhiteboard", // Your bucket name
        };

        try {
          const listObjectsResponse = await s3.listObjectsV2(params).promise();
          if (listObjectsResponse.Contents.length > 0) {
            const deleteParams = {
              Bucket: "ofistikwhiteboard",
              Delete: {
                Objects: listObjectsResponse.Contents.map((item) => ({
                  Key: item.Key,
                })),
              },
            };

            await s3.deleteObjects(deleteParams).promise();
            console.log("All files deleted from S3.");
          }
        } catch (error) {
          console.error("Failed to delete files from S3", error);
        }
        try {
          const folderRef = ref(firebaseDb, `${base.ChName.split("%3D")[1]}/`); // oda ismini al

          listAll(folderRef) // odada bulunan tüm dosyaları siler. klasör boş kalınca kendini siliyor.
            .then((result) => {
              // Klasördeki her dosya için
              result.items.forEach((itemRef) => {
                // Dosyayı sil
                deleteObject(itemRef)
                  .then(() => {
                    console.log(
                      `${itemRef.fullPath} dosyası başarıyla silindi.`
                    );
                  })
                  .catch((error) => {
                    console.error(
                      `${itemRef.fullPath} dosyası silinirken hata oluştu: `,
                      error
                    );
                  });
              });
            })
            .catch((error) => {
              console.error(
                "Klasör içeriği listelenirken hata oluştu: ",
                error
              );
            });
        } catch (error) {
          console.error("Error deleting folder contents:", error);
        }
      }

      // Çıkış başarılıysa loading ekranını kapat ve rating penceresini göster
      Swal.close();

      // Kullanıcının rolü

      if (role === "admin") {
        Swal.fire({
          title: "Randevudan ayrıldınız!",
          html: `
            <div>
              <ul>
                <li style="margin-bottom:3px;">Beyaz tahta süresi: ${formatTime(
                  whiteboardDuration + newWhiteboardDuration
                )}</li>
                <li style="margin-bottom:3px;">Kamera süresi: ${formatTime(
                  cameraDuration
                )}</li>
                <li style="margin-bottom:3px;">Ekran paylaşım süresi: ${formatTime(
                  screenShareDuration + newScreenShareDuration
                )}</li>
                <li style="margin-bottom:3px;">Toplam randevu süresi: ${formatTime(
                  timeElapsed1
                )}</li>
              </ul>
            </div>
            <div style="margin-top: 10px;">
              <p style="margin-bottom: 3px; color: #f66451;">
                Randevu esnasında hizmet alana istediği hizmeti sunamadığınızı düşünüyorsanız ücreti iade et butonuna tıklayabilirsiniz. 
                Randevunuz başarıyla gerçekleşti ise ücreti al butonuna tıklayarak devam edebilirsiniz.
              </p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "Ücreti Al",
          cancelButtonText: "Ücreti İade Et",
          confirmButtonColor: "#4CAF50",
          cancelButtonColor: "#f66451",
          preConfirm: (isConfirm) => {
            return new Promise((resolve, reject) => {
              Swal.fire({
                title: "Emin misiniz?",
                text: isConfirm
                  ? "Ücreti almayı onaylıyor musunuz?"
                  : "Bu işlemi geri alamazsınız! Ücreti iade etmek istediğinize emin misiniz?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: isConfirm
                  ? "Evet, ücreti al!"
                  : "Evet, iade et!",
                cancelButtonText: "Hayır, vazgeç!",
                confirmButtonColor: isConfirm ? "#4CAF50" : "#f66451",
                cancelButtonColor: "#d33",
              }).then((result) => {
                if (result.isConfirmed) {
                  resolve();
                } else {
                  reject();
                }
              });
            });
          },
        })
          .then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: "İşlem Tamamlandı",
                text: "Randevunuz başarıyla tamamlandı. Randevularım bölümünden randevu detaylarına ulaşabilir, finans bölümünden ödemenizi takip edebilirsiniz.",
                icon: "success",
                timer: 3000,
                showConfirmButton: false,
                willClose: () => {
                  // Yönlendirme işlemini yap
                  window.location.href = "/";
                },
              });
            }
          })
          .catch(() => {
            // İptal edildiğinde yapılacak işlemler
          });
      } else {
        Swal.fire({
          title: "Randevudan ayrıldınız!",
          html: `
      <div>
        <ul>
          <li style="margin-bottom:3px;">Beyaz tahta süresi: ${formatTime(
            whiteboardDuration + newWhiteboardDuration
          )}</li>
          <li style="margin-bottom:3px;">Kamera süresi: ${formatTime(
            cameraDuration
          )}</li>
          <li style="margin-bottom:3px;">Ekran paylaşım süresi: ${formatTime(
            screenShareDuration + newScreenShareDuration
          )}</li>
          <li style="margin-bottom:3px;">Toplam randevu süresi: ${formatTime(
            timeElapsed1
          )}</li>
        </ul>
      </div>
      <div>
        <p style="margin-bottom:3px;">Randevuyu nasıl değerlendirdiniz?</p>
        <div id="rating-stars">
          ${[1, 2, 3, 4, 5]
            .map(
              (star) =>
                `<i class="fa fa-star hover:text-[#f66451]" data-value="${star}" style="font-size: 24px; color: gray; cursor: pointer;"></i>`
            )
            .join("")}
        </div>
      </div>
      <div style="margin-top: 10px;">
        <p style="margin-bottom:3px;">Randevu hakkında yorum yapın:</p>
        <textarea
id="feedback-comment"
rows="4"
style="background-color: #f3f4f6; width: 100%; border-radius: 0.5rem; margin-top: 0.75rem; margin-bottom: 0.75rem; padding: 0.5rem; outline: none; border: none;">
</textarea>


      </div>
    `,
          showCancelButton: true,
          confirmButtonColor: "#f66451",
          confirmButtonText: "Gönder",
          cancelButtonText: "İptal",
          preConfirm: () => {
            const rating = document.querySelector("#rating-stars .selected");
            const comment = document
              .getElementById("feedback-comment")
              .value.trim();
            if (!rating) {
              Swal.showValidationMessage("Lütfen bir yıldız seçin.");
              return false;
            }
            return { rating: rating.dataset.value, comment };
          },
        }).then((result) => {
          if (result.isConfirmed) {
            const { rating, comment } = result.value;
            // Yıldız değeri ve yorum alınıp işlemler yapılabilir
            console.log("Kullanıcı yıldız değerlendirmesi:", rating);
            console.log("Kullanıcı yorumu:", comment);

            // Değerlendirmeniz için teşekkürler mesajını göster
            Swal.fire({
              title: "Teşekkürler!",
              html: "Değerlendirmeniz için teşekkürler, ana sayfaya yönlendiriliyorsunuz...",
              icon: "success",
              timer: 3000,
              showConfirmButton: false,
              willClose: () => {
                // Yönlendirme işlemini yap
                window.location.href = "/";
              },
            });
          }
        });

        // Yıldızları dinleyerek seçilen yıldıza göre renklendirme yapıyoruz
        const stars = document.querySelectorAll("#rating-stars i");

        stars.forEach((star) => {
          star.addEventListener("click", (e) => {
            stars.forEach((s) => s.classList.remove("selected"));
            e.target.classList.add("selected");
            stars.forEach(
              (s) =>
                (s.style.color =
                  s.dataset.value <= e.target.dataset.value
                    ? "#f66451"
                    : "gray")
            );
          });
        });
      }

      // Yıldız değerlendirme ve süreler için bir Swal kutusu açıyoruz
    } catch (error) {
      Swal.close();
      console.error("Error leaving the room:", error);
    }
  };

  const getMembers = async (channelResIn) => {
    const members = await channelResIn.getMembers();
    updateMemberTotal(members);
    members.forEach((id) => {
      setParticipants((prev) => [...prev, id]);
    });
  };

  const handleChannelMessage = async (messageData, MemberId) => {
    let data = JSON.parse(messageData.text);
    if (data.type === "chat") {
      setChats((prev) => [
        ...prev,
        { displayName: data.displayName, message: data.message },
      ]);
    }
  };

  const sendFile = async ({ url, name, type }) => {
    if (joined) {
      const displayName = sessionStorage.getItem("username");
      //const file = { url, name, type };

      try {
        const fileMessage = JSON.stringify({
          type: "chat",
          message: [{ url, name }],
          displayName,
        });

        await channelRes.sendMessage({
          text: fileMessage,
        });

        setChats((prev) => [
          ...prev,
          { displayName, message: [{ url, name }] },
        ]);
      } catch (error) {
        console.log("Fail: ", error);
      }
    } else {
      alert("You must join the room first");
    }
  };

  const openChat = () => {
    setChatShow(!chatShow);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (joined) {
      const displayName = sessionStorage.getItem("username");
      let message = e.target.message.value;
      await channelRes.sendMessage({
        text: JSON.stringify({ type: "chat", message, displayName }),
      });
      setChats((prev) => [...prev, { displayName, message }]);
    } else {
      alert("You must join the room first");
    }
    e.target.reset();
  };
  const initRTM = async (uid) => {
    try {
      let rtmClientIn = AgoraRTM.createInstance(APP_ID);
      await rtmClientIn.login({ uid: String(uid), token });
      await rtmClientIn.addOrUpdateLocalUserAttributes({
        name: sessionStorage.getItem("username"),
      });
      let channelResIn = rtmClientIn.createChannel(channel);
      await channelResIn.join();
      await Promise.all([
        setChannelRes(channelResIn),
        setRtmClient(rtmClientIn),
      ]);
      await rtmClientIn.getUserAttributesByKeys(String(uid), ["name"]);
    } catch (err) {
      console.error("Failed to initialize RTM:", err);
    }
  };

  useEffect(() => {
    client.on("user-published", handleUserPublished);
    client.on("user-left", handleUserLeft);

    window.addEventListener("beforeunload", leaveRoom);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-left", handleUserLeft);

      window.removeEventListener("beforeunload", leaveRoom);
    };
  }, []);

  useEffect(() => {
    if (channelRes && rtmClient) {
      channelRes.on("MemberJoined", handleMemberJoined);
      channelRes.on("MemberLeft", handleMemberLeft);
      channelRes.on("ChannelMessage", handleChannelMessage);
      getMembers(channelRes);
    }
  }, [channelRes, rtmClient]);
  // Join as a subscriber method
  const joinAsSubscriber = async (channelName) => {
    client.on("stream-added", async function (evt) {
      const stream = evt.stream;
      console.log("New stream added: " + stream.getId());

      client.subscribe(stream, async function (err) {
        if (err) {
          console.log("Subscribe stream failed", err);
          return;
        }
      });
    });

    client.on("stream-subscribed", async function (evt) {
      const stream = evt.stream;
      console.log("Successfully subscribed to stream: " + stream.getId());
      stream.play("video-container");

      // Kullanıcıyı users arrayine ekle
      const uid = stream.getId();
      setUsers((prev) => [
        ...prev,
        { uid, audioTrack: null, videoTrack: null },
      ]);
      setLocalTracks({ audioTrack: null, videoTrack: null });

      // Client'a publish et
      try {
        await client.publish([stream]);
        console.log("Stream published successfully");
      } catch (err) {
        console.log("Publish stream failed", err);
      }
    });
  };

  const joinRoom = async () => {
    Swal.fire({
      title: "Giriş yapılıyor...",
      html: "Lütfen bekleyin.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      // Kamera ve mikrofon izinlerini kontrol et
      const permissionStatusCam = await navigator.permissions.query({
        name: "camera",
      });
      const permissionStatusMic = await navigator.permissions.query({
        name: "microphone",
      });

      const uid = await client.join(APP_ID, channel, token, null);
      setUID(uid);

      let audioTrack = null;
      let videoTrack = null;

      if (
        permissionStatusCam.state !== "denied" &&
        permissionStatusMic.state !== "denied"
      ) {
        // Hem kamera hem mikrofon izni var
        const [audioTrackLocal, videoTrackLocal] =
          await AgoraRTC.createMicrophoneAndCameraTracks();
        audioTrack = audioTrackLocal;
        videoTrack = videoTrackLocal;
        await client.publish([audioTrack, videoTrack]);
        setLocalTracks({ audio: audioTrack, video: videoTrack });
      } else if (
        permissionStatusCam.state === "denied" &&
        permissionStatusMic.state !== "denied"
      ) {
        // Sadece mikrofon izni var
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish(audioTrack);
        setLocalTracks({ audio: audioTrack });
      } else if (
        permissionStatusCam.state !== "denied" &&
        permissionStatusMic.state === "denied"
      ) {
        // Sadece kamera izni var
        videoTrack = await AgoraRTC.createCameraVideoTrack();
        await client.publish(videoTrack);
        setLocalTracks({ video: videoTrack });
      } else if (
        permissionStatusCam.state === "denied" &&
        permissionStatusMic.state === "denied"
      ) {
        // Hem kamera hem mikrofon izni yok
        joinAsSubscriber(channel);
      }

      setUsers((prev) => [...prev, { uid, audioTrack, videoTrack }]);
      setJoined(true);
      Swal.close();
      initRTM(uid);
    } catch (error) {
      console.error("Error joining the room:", error);
    }
  };

  const handleUserPublished = async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    setUsers((prevUsers) => {
      const userExists = prevUsers.some((u) => u.uid === user.uid);

      if (!userExists) {
        return [...prevUsers, user];
      } else {
        return prevUsers.map((u) =>
          u.uid === user.uid
            ? { ...u, [mediaType + "Track"]: user[mediaType + "Track"] }
            : u
        );
      }
    });

    if (mediaType === "audio") {
      const remoteAudioTrack = user.audioTrack;
      remoteAudioTrack.play();
    }
  };

  const handleUserLeft = (user) => {
    setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
  };

  const handleMuteCamera = async (user) => {
    if (user.videoTrack.muted) {
      await user.videoTrack.setMuted(false);
    } else {
      await user.videoTrack.setMuted(true);
    }
  };

  const handleMuteMic = async (user) => {
    if (user.audioTrack.muted === false) {
      await user.audioTrack.setMuted(true);
    } else if (user.audioTrack.muted === true) {
      await user.audioTrack.setMuted(false);
    }
  };
  const handleScreenShare = async () => {
    const userContainer = document.getElementById("usersContainer");
    const videoHolder = document.getElementById("share-screen");
    const shareScreenDiv = videoHolder.querySelector("div");
    if (shareScreenDiv) {
      const targetDivId = shareScreenDiv.id;
      const targetDiv = document.getElementById(`userBoxForCam-${targetDivId}`);
      if (targetDiv) {
        videoHolder.removeChild(shareScreenDiv);
        videoHolder.classList.add("hidden");
        targetDiv.insertBefore(shareScreenDiv, targetDiv.firstChild);
        setTimeout(() => {
          const newVideo = targetDiv.querySelector("div");
          newVideo.classList.remove("large");
        }, 1000);
      } else {
        console.error(`Div with ID ${targetDivId} not found in userVideo`);
      }
    }
    if (whiteboardOpen) {
      setWhiteboardOpen(false);
    }
    while (videoHolder.firstChild) {
      userContainer.appendChild(videoHolder.firstChild);
      setLarge(false);
    }
    if (!screenShare.mode) {
      try {
        const screenShareTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: "720p_1",
        });
        if (localTracks.video) {
          await client.unpublish(localTracks.video);
        }
        setScreenShareOpen(true);
        setUsers((prev) =>
          prev.map((user) =>
            user.uid === UID ? { ...user, screenShareTrack } : user
          )
        );

        await client.publish(screenShareTrack);
        screenShareTrack.play(screenShareRef.current);
        setScreenShare({ mode: true, track: screenShareTrack });
        screenShareRef.current.classList.remove("hidden");
        toast.success("Ekran Paylaşımı Başarılı bir şekilde Açıldı");
      } catch (error) {
        console.error("Error starting screen share:", error);
      }
    } else {
      try {
        // Ekran paylaşımını durdur
        setScreenShareOpen(false);
        if (screenShare.track) {
          await client.unpublish(screenShare.track);
          screenShare.track.stop();
        }
        users.forEach((user) => {
          if (user.screenShareTrack) {
            client.unpublish(user.screenShareTrack);
            user.screenShareTrack.stop();
          }
        });

        setUsers((prev) =>
          prev.map((user) =>
            user.uid === UID ? { ...user, screenShareTrack: null } : user
          )
        );

        if (localTracks.video) {
          await client.publish(localTracks.video);
        }

        setScreenShare({ mode: false, track: null });
        if (large) {
          screenShareRef.current.classList.add("hidden");
        }
        toast.success("Ekran Paylaşımı Başarılı bir şekilde Kapatıldı");
      } catch (error) {
        console.error("Error stopping screen share:", error);
      }
    }
  };

  const [roomToken, setRoomToken] = useState(null);
  const [uuid, setUuid] = useState(null);

  useEffect(() => {
    const parts = window.location.href.split("/");
    const uuidTokenString = parts[parts.length - 3];
    const roomTokenString = parts[parts.length - 2];
    const [uuidData] = uuidTokenString
      .split("/")
      .map((part) => part.split("=")[1]);
    const [roomTokenData] = roomTokenString
      .split("/")
      .map((part) => part.split("=")[1]);
    setUuid(uuidData);
    setRoomToken(roomTokenData);
  }, []);

  const [timeElapsed, setTimeElapsed] = useState(0);
  const intervalRef = useRef(null);
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const parts = window.location.href.split("/");
    const role = parts[parts.length - 1];
    const [roleData] = role.split("/").map((part) => part.split("=")[1]);
    setRole(roleData);
  }, []);
  const openParticipants = () => {
    setShowParticipants((prevShowParticipants) => !prevShowParticipants);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const userVideoDivs = document.querySelectorAll("#userVideo .userCam");
      userVideoDivs.forEach((div) => {
        if (div.querySelector("div") !== null) {
          div.style.display = "block";
        } else {
          div.style.display = "none";
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const openWhiteboard = async () => {
    const container = document.getElementById("userVideo");
    const userContainer = document.getElementById("usersContainer");
    const videoHolder = document.getElementById("share-screen");
    const shareScreenDiv = videoHolder.querySelector("div");
    if (shareScreenDiv) {
      const targetDivId = shareScreenDiv.id;
      const targetDiv = document.getElementById(`userBoxForCam-${targetDivId}`);
      if (targetDiv) {
        videoHolder.removeChild(shareScreenDiv);
        videoHolder.classList.add("hidden");
        targetDiv.insertBefore(shareScreenDiv, targetDiv.firstChild);
        setTimeout(() => {
          const newVideo = targetDiv.querySelector("div");
          newVideo.classList.remove("large");
        }, 1000);
        setWhiteboardOpen(true);
      } else {
        console.error(`Div with ID ${targetDivId} not found in userVideo`);
      }
    }
    while (videoHolder.firstChild) {
      videoHolder.removeChild(videoHolder.firstChild);
      videoHolder.classList.add("hidden");

      setScreenShareOpen(false);
      if (screenShare.track) {
        await client.unpublish(screenShare.track);
        screenShare.track.stop();
      }
      users.forEach((user) => {
        if (user.screenShareTrack) {
          client.unpublish(user.screenShareTrack);
          user.screenShareTrack.stop();
        }
      });

      setUsers((prev) =>
        prev.map((user) =>
          user.uid === UID ? { ...user, screenShareTrack: null } : user
        )
      );

      if (localTracks.video) {
        await client.publish(localTracks.video);
      }

      setScreenShare({ mode: false, track: null });
      screenShareRef.current.classList.add("hidden");
    }
    setLarge(false);
    userContainer.appendChild(container);
    setWhiteboardOpen(true);
    setLarge(false);
    toast.success("Beyaz Tahta Başarılı bir şekilde Açıldı");
  };

  const closeWhiteboard = () => {
    setWhiteboardOpen(false);
  };
  const [showWhiteboardLarge, setShowWhiteboardLarge] = useState(true);
  const [hasSmallViewScreen1, setHasSmallViewScreen1] = useState(false);
  const [screenShareLarge, setShowScreenShareLarge] = useState(true);
  const [large, setLarge] = useState(false);
  return displayName !== null ? (
    <div className="h-screen bg-gray-100">
      <Toaster />
      <section className=" flex justify-between overflow-hidden">
        {/* Participants */}
        {/* <Participants
          closeWhiteboard={closeWhiteboard}
          users={users}
          openParticipants={openParticipants}
          show={showParticipants}
          showCtrl={showCtrl}
          setShowCtrl={setShowCtrl}
          rtmClient={rtmClient}
          totalMembers={totalMembers}
          participants={participants}
          UID={UID}
          whiteboardOpen={whiteboardOpen}
          showWhiteboardLarge={showWhiteboardLarge}
          hasSmallViewScreen1={hasSmallViewScreen1}
        /> */}

        {/* Main Screen */}
        <MainScreen
          setScreenShareOpen={setScreenShareOpen}
          screenShare={screenShare}
          setUsers={setUsers}
          client={client}
          setScreenShare={setScreenShare}
          large={large}
          setLarge={setLarge}
          setTimeElapsed={setTimeElapsed1}
          timeElapsed={timeElapsed1}
          showCamera={showCamera}
          setShowCamera={setShowCamera}
          whiteboardDuration={whiteboardDuration}
          cameraDuration={cameraDuration}
          screenShareDuration={screenShareDuration}
          hasSmallViewScreen1={hasSmallViewScreen1}
          setHasSmallViewScreen1={setHasSmallViewScreen1}
          screenShareLarge={screenShareLarge}
          setShowScreenShareLarge={setShowScreenShareLarge}
          closeWhiteboard={closeWhiteboard}
          openWhiteboard={openWhiteboard}
          openChat={openChat}
          openParticipants={openParticipants}
          showWhiteboardLarge={showWhiteboardLarge}
          setShowWhiteboardLarge={setShowWhiteboardLarge}
          whiteboardOpen={whiteboardOpen}
          setWhiteboardOpen={setWhiteboardOpen}
          shareScreenOpen={screenShareOpen}
          leaveRoom={leaveRoom}
          channel={channel}
          setShowParticipants={setShowParticipants}
          showParticipants={showParticipants}
          setChatShow={setChatShow}
          chatShow={chatShow}
          handleMuteMic={handleMuteMic}
          rtmClient={rtmClient}
          joined={joined}
          setJoined={setJoined}
          joinRoom={joinRoom}
          localTracks={localTracks}
          setLocalTracks={setLocalTracks}
          handleMuteCamera={handleMuteCamera}
          users={users}
          UID={UID}
          screenShareRef={screenShareRef}
          handleScreenShare={() => handleScreenShare(screenShareRef)}
          roomToken={roomToken}
          uid={UID}
          uuid={uuid}
        />

        <LiveChat
          handleScreenShare={handleScreenShare}
          localTracks={localTracks}
          screenShareOpen={screenShareOpen}
          setWhiteboardOpen={setWhiteboardOpen}
          setScreenShareOpen={setScreenShareOpen}
          screenShare={screenShare}
          setUsers={setUsers}
          client={client}
          setScreenShare={setScreenShare}
          screenShareRef={screenShareRef}
          large={large}
          setLarge={setLarge}
          showWhiteboard={whiteboardOpen}
          closeWhiteboard={closeWhiteboard}
          users={users}
          openParticipants={openParticipants}
          showCtrl={showCtrl}
          setShowCtrl={setShowCtrl}
          rtmClient={rtmClient}
          totalMembers={totalMembers}
          participants={participants}
          UID={UID}
          whiteboardOpen={whiteboardOpen}
          showWhiteboardLarge={showWhiteboardLarge}
          hasSmallViewScreen1={hasSmallViewScreen1}
          chatShow={chatShow}
          openFunction={openChat}
          show={chatShow}
          sendFile={sendFile}
          sendMessage={sendMessage}
          chats={chats}
        />
      </section>

      {(showCtrl.showLiveChat || showCtrl.showParticipants) && (
        <div
          className="fixed z-[22] h-[90vh] w-full top-[10vh] left-0 bg-slate-400/50"
          onClick={() =>
            setShowCtrl((prev) => ({
              ...prev,
              showLiveChat: false,
              showParticipants: false,
            }))
          }
        ></div>
      )}
    </div>
  ) : (
    <div className="w-screen h-screen top-0 left-0 flex flex-col items-center justify-center bg-gray-100">
      <div className="titleArea m-5">
        <h1 className="text-xl lg:text-3xl text-center text-premiumOrange font-bold">
          Ofistik Randevu Servisi
        </h1>
      </div>
      <div className=" h-auto max-h-screen overflow-y-auto bg-gray-50 rounded-3xl p-8 mx-8 lg:mx-0">
        <div className="flex w-full flex-col gap-2">
          <label
            htmlFor="name"
            className="text-gray-600 font-semibold text-sm lg:text-base"
          >
            İsminiz
          </label>
          <input
            type="text"
            className="h-[44px] bg-gray-200 rounded-xl p-5 focus:outline-none"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            required
          />
          <button
            className="mt-3 text-md lg:text-base rounded-2xl bg-premiumOrange text-white px-3 py-3 font-semibold hover:bg-gray-200 hover:text-premiumOrange transition-all duration-500"
            onClick={() => {
              if (inputUsername) {
                sessionStorage.setItem("username", inputUsername);
                joinRoom();
              } else {
                alert("Lütfen bir isim giriniz");
              }
            }}
          >
            Katıl
          </button>
        </div>
      </div>
    </div>
  );
}

export default Room;
