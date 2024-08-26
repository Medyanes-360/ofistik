import { useFastboard, Fastboard } from "@netless/fastboard-react";
import React, { useEffect, useRef, useState } from "react";
import AWS from "aws-sdk";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams } from "next/navigation";

function WhiteBoardMain({
  roomToken,
  uid,
  uuid,
  showChat,
  showParticipants,
  showWhiteboardLarge,
  users,
}) {
  const [size, setSize] = useState("");
  const isMobile = window.innerWidth < 768;
  const uniqueRoomName = sessionStorage.getItem("uniqueRoomName");
  const fileInputRef = useRef(null); // Reference for hidden file input
  const { ChName } = useParams();
  const channelName = decodeURIComponent(ChName).split("=")[1];

  // Configure AWS S3
  const s3 = new AWS.S3({
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID, // Add your AWS access key
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY, // Add your AWS secret access key
    region: "us-east-1", // Adjust region as necessary
  });

  const handleFileUploadUrl = async (file) => {
    if (file) {
      const fileName = `${channelName}/${file.name}`; // Ensures the filename includes the extension
      const params = {
        Bucket: "ofistikwhiteboard", // Your bucket name
        Key: fileName, // File name you want to save as in S3
        Body: file,
        ContentType: file.type, // MIME type of the file
      };

      try {
        const data = await s3.upload(params).promise(); // Upload to S3
        return data.Location; // Return the S3 file URL
      } catch (error) {
        console.error("Failed to upload file to S3", error);
        throw error;
      }
    }
  };

  const deleteAllFilesFromS3 = async () => {
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
  };

  // Initialize Fastboard
  const fastboard = useFastboard(() => ({
    sdkConfig: {
      appIdentifier: "PFDmUAhSEe-X_REUu_elzA/iqDTdcAIEz2DlQ",
      region: "us-sv",
    },
    joinRoom: {
      uid: uid,
      uuid: uuid,
      roomToken: roomToken,
    },
  }));

  useEffect(() => {
    if (!showChat && !isMobile) {
      setSize("73vw");
    } else if (showChat && !isMobile) {
      setSize("97vw");
    } else if (showChat && isMobile) {
      setSize("96vw");
    } else if (!showChat && isMobile) {
      setSize("96vw");
    }
  }, [showChat, isMobile]);

  useEffect(() => {
    console.log(users.length);
    if (users.length === 0) {
      deleteAllFilesFromS3();
    }
  }, [users]);

  const height =
    showWhiteboardLarge === false ? "25vh" : isMobile ? "70vh" : "82vh";

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;

      try {
        Swal.fire({
          title: "Yükleniyor...",
          text: "Dosya yükleniyor lütfen bekleyin.",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        const url = await handleFileUploadUrl(file);

        if (fileType.includes("image")) {
          fastboard.insertImage(url);
          // Close the loading message and show success message
          Swal.close();
          Swal.fire({
            title: "Başarılı!",
            text: "Resim başarılı bir şekilde yüklendi.",
            icon: "success",
          });
        } else {
          const conversionResponse = await axios.post(
            `https://api.netless.link/v5/projector/tasks`,
            {
              resource: url,
              type: "static",
              preview: true,
              scale: 1.0,
            },
            {
              headers: {
                region: "us-sv",
                token: `NETLESSSDK_YWs9NkFxZl8zQXhUa0xuN0M2UCZub25jZT0wMmYyN2U1MC02MmQ0LTExZWYtYjE4MC04ZDA0NTE2Mzg1Mjcmcm9sZT0wJnNpZz05MTY0ZDY5OTE0MmU1ZDVmMGQ3OWE0Y2NlN2UzNTQ1OGIyMzhmYTBkZjA0NWE1MmIyMDg1YjViM2NiNWNhN2Yy`,
              },
            }
          );

          if (conversionResponse) {
            const uuid = conversionResponse.data.uuid;

            // Polling for the conversion status
            let conversionStatus;
            do {
              const statusResponse = await axios.get(
                `https://api.netless.link/v5/projector/tasks/${uuid}`,
                {
                  headers: {
                    region: "us-sv",
                    token: `NETLESSSDK_YWs9NkFxZl8zQXhUa0xuN0M2UCZub25jZT0wMmYyN2U1MC02MmQ0LTExZWYtYjE4MC04ZDA0NTE2Mzg1Mjcmcm9sZT0wJnNpZz05MTY0ZDY5OTE0MmU1ZDVmMGQ3OWE0Y2NlN2UzNTQ1OGIyMzhmYTBkZjA0NWE1MmIyMDg1YjViM2NiNWNhN2Yy`,
                  },
                }
              );
              conversionStatus = statusResponse.data;
              await new Promise((resolve) => setTimeout(resolve, 3000));
            } while (conversionStatus.status !== "Finished");

            if (conversionStatus.status === "Finished") {
              const file = event.target.files[0];
              await fastboard.insertDocs({
                fileType: "pdf",
                scenePath: `/pdf/${conversionStatus.uuid}`,
                scenes: Object.keys(conversionStatus.images).map((key) => ({
                  name: key, // Use the key as the name
                  ppt: {
                    width: conversionStatus.images[key].width,
                    height: conversionStatus.images[key].height,
                    src: conversionStatus.images[key].url,
                  },
                })),
                title: file.name,
              });
              Swal.close();
              Swal.fire({
                title: "Başarılı!",
                text: "Dosya başarılı bir şekilde yüklendi.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              Swal.close();
              Swal.fire({
                title: "Error!",
                text: "Conversion failed or was cancelled.",
                icon: "error",
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to handle file upload", error);
        Swal.close();
        Swal.fire({
          title: "Error!",
          text: "An error occurred during the file upload process.",
          icon: "error",
        });
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      id="white-board"
      className="relative"
      style={{
        width: showWhiteboardLarge === false ? "22vw" : size,
        height: height,
        border: "1px solid",
        borderRadius: "15px",
        borderColor: "hsl(215, 20%, 75%)",
        background: "white",
      }}
    >
      <Fastboard app={fastboard} />
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.pptx,.doc,.docx,image/*"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      {/* Plus button to trigger file upload */}
      <button
        className="absolute top-4 left-4 bg-premiumOrange text-white h-8 w-8 text-xl font-semibold rounded-full z-50"
        onClick={triggerFileInput}
      >
        +
      </button>
    </div>
  );
}

export default WhiteBoardMain;
