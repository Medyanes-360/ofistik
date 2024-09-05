"use client";
import React, { useState, useEffect } from "react";
import Steps from "../commonModules/steps";
import TimeAndDate from "./timeAndDate";
import ContactForm from "./contactInfo";
import ServiceComponent from "./serviceComponent";
import Swal from "sweetalert2";
import AppointmentView from "./appointmentView";
import { getAPI, postAPI } from "@/services/fetchAPI";
import { useSession } from "next-auth/react";

function AppointmentComponent() {
  const [step, setStep] = useState(1); // en üstte gözüken stepleri tutan değişken
  const [returnDate, setReturnDate] = useState(""); // seçtiğimiz saat ve tarihi tutan değişken
  const [returnService, setReturnService] = useState(""); // seçtiğimiz service i tutan değişken
  const [showFinishScreen, setShowFinishScreen] = useState(false); // finishScreen i göstereceğimiz değişken
  const [forWho, setForWho] = useState(""); //Appointment view ekranında kullandığımız kim için i atadığımız değişkern
  const [notes, setNotes] = useState(""); //Appointment view ekranında kullandığımız notları i atadığımız değişkern
  const [language, setLanguage] = useState(""); //Appointment view ekranında kullandığımız dili i atadığımız değişkern
  const [firstName, setFirstName] = useState(""); //Appointment view ekranında kullandığımız ilk ismi i atadığımız değişkern
  const [lastName, setLastName] = useState(""); //Appointment view ekranında kullandığımız soyismi i atadığımız değişkern
  const [gender, setGender] = useState(""); //Appointment view ekranında kullandığımız cinsiyet i atadığımız değişkern
  const [birthDay, setBirthday] = useState(""); //Appointment view ekranında kullandığımız doğum datiri i atadığımız değişkern
  const [isOwn, setIsOwn] = useState(true); // kendim için ve başkası için değişkenlerini tutan değişken (true false yapısı)
  const [request, setRequest] = useState(false); //Appointment view ekranında kullandığımız talep olup olmadığını i atadığımız değişkern
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [duration, setDuration] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]); //saatleri atadığımız değişken

  const { data: session } = useSession();
  const openModal = () => {
    setIsModalOpen(true);
  };
  console.log(session);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getSelectedTimes = async () => {
    try {
      const times = await getAPI("/selectedtimes");
      setSelectedTimes(times);
      return times;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const handleNext = () => {
    // ileri butonu fonksiyonu (seçim yapmadan ileri gitmeye çalıştığımızda hata veriyor)
    if (step === 2) {
      if (!returnService) {
        Swal.fire({
          title: "Hata !",
          text: "Lütfen bir servis seçin.",
          icon: "error",
          confirmButtonText: "Kapat",
        });
        return;
      }
    }
    if (step === 1) {
      if (!returnDate) {
        Swal.fire({
          title: "Hata !",
          text: "Devam etmeden önce lütfen randevu saati seçiniz.",
          icon: "error",
          confirmButtonText: "Kapat",
        });
        return;
      }
    }
    setStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    //back butonu fonksiyonu
    if (step > 1) {
      setStep((prevStep) => prevStep - 1);
    }
  };

  useEffect(() => {
    //DATABASE DEN OKUCAAK SAATLER
    getSelectedTimes();
  }, []);

  useEffect(() => {
    console.log(selectedTimes);
  }, [selectedTimes]);

  const skills = session?.skills ? JSON.parse(session.skills) : [];

  const obje = skills.map((skill) => skill.name);

  const handleFinish = async (formDataa) => {
    // randevuyu tamamlamamızı sağlayan fonksiyon
    setForWho(formDataa.kimIçin);
    setNotes(formDataa.notes);
    setLanguage(formDataa.language);
    setGender(formDataa.gender);
    setBirthday(formDataa.dateOfBirth);
    setFirstName(formDataa.firstName);
    setLastName(formDataa.lastName);
    if (step === 3) {
      // Check if any required field is empty except for "kendim" or "başkası"
      const isFormValid = Object.keys(formDataa).every(
        (key) => formDataa[key] !== ""
      );

      if (isFormValid) {
        const existingSelectedTimes = await getSelectedTimes();

        const selectedDateTime = returnDate.split(" ")[2];
        const selectedDate = returnDate.split(" ")[0];

        // Gününüze bir gün ekleyin
        const parts = selectedDate.split(".");
        const formattedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        formattedDate.setDate(formattedDate.getDate() + 1);

        const timeIndex = existingSelectedTimes.findIndex(
          (timeObj) =>
            timeObj.time === selectedDateTime &&
            timeObj.date === formattedDate.toISOString().split("T")[0]
        );

        if (timeIndex !== -1) {
          await postAPI(
            `/selectedtimes?id=${existingSelectedTimes[timeIndex].id}`,
            {
              active: false,
            },
            "PUT"
          );

          const times = await getSelectedTimes();
        }

        const data = await postAPI(
          "/date",
          {
            confirm: formDataa["confirm"],
            date_of_birth: formDataa["dateOfBirth"],
            delete: formDataa["delete"],
            duration: formDataa["duration"],
            service: formDataa["service"],
            notes: formDataa["notes"],
            language: formDataa["language"],
            kim_icin: formDataa["kimIçin"],
            gender: formDataa["gender"],
            firstName: formDataa["firstName"],
            lastName: formDataa["lastName"],
            time: formDataa["time"],
          },
          "POST"
        );

        setShowFinishScreen(true);
        openModal();
      } else {
        Swal.fire({
          title: "Hata !",
          text: "Lütfen tüm alanları doldurunuz.",
          icon: "error",
          confirmButtonText: "Kapat",
        });
      }
    }
  };

  const openAlert = () => {
    //onaylama alerti
    Swal.fire({
      title: "Başarılı",
      html: request
        ? '<h2 className="text-center text-base font-semibold p-4">' +
          "Randevu talebiniz başarılı bir şekilde oluşturuldu." +
          '<a className="text-deepSlateBlue text-lg font-semibold" href="/myAppointments"> Randevularım </a>' +
          "bölümünden randevunuzun detaylarını inceleyebilir ve yönetebilirsiniz." +
          "</h2>"
        : '<h2 className="text-center text-base font-semibold p-4">' +
          "Sizinle buluşmayı büyük bir heyecan ile bekliyoruz." +
          '<a className="text-deepSlateBlue text-lg font-semibold" href="/myAppointments"> Randevularım </a>' +
          "bölümünden randevunuzun detaylarını inceleyebilir ve yönetebilirsiniz." +
          "</h2>",
      icon: "success",
      confirmButtonText: "Kapat",
    });
    closeModal();
  };

  const handleOptionChange = (option) => {
    // forOwn ve forSomeone ögeleri arasında değişimi sağlıyor
    setIsOwn(option);
  };

  const parseDateTime = (returnDate) => {
    // date i day.month.year formuna dönüştüren fonksiyon
    const dateTimeParts = returnDate.split(" ");
    if (dateTimeParts.length === 5) {
      const [day, month, year] = dateTimeParts[0].split(".");
      const dateFormatted = `${day}.${month}.${year}`;
      return {
        date: dateFormatted,
        time: dateTimeParts[2],
      };
    }

    // Varsayılan olarak returnDate'i direkt olarak date prop'una ekleyebilirsiniz
    return {
      date: returnDate,
      time: "",
    };
  };

  const appointmentDuration = 90; //KULLANICI PROFİLİNDEN ALDIĞIMIZ SÜRE

  // Kullanım
  const returnDateFinal = returnDate;
  const { date, time } = parseDateTime(returnDateFinal);

  return (
    <>
      {showFinishScreen && (
        <AppointmentView
          isRequest={request}
          isOpen={isModalOpen}
          confirmButton={openAlert}
          onClose={closeModal}
          time={time}
          service={returnService}
          date={date}
          forWho={forWho}
          language={language}
          notes={notes}
          gender={gender}
          birthday={birthDay}
          firstName={firstName}
          lastName={lastName}
          duration={appointmentDuration}
          price={"100"}
          serviceProviderName={"Bayram Çınar"} //DATABASE DEN ALINAN SERVİSİ VEREN KİŞİNİN ADI
          serviceProviderJob={"Uzman, Klinik Psikoloji"} //DATABASE DEN ALINAN SERVİSİ VEREN KİŞİNİN MESLEĞİ
        />
      )}
      {!showFinishScreen && (
        <div className="generalDiv w-full h-fit flex flex-col items-center">
          <Steps active={step} />
          {step === 2 && (
            <ServiceComponent
              services={obje}
              setReturnService={setReturnService}
            />
          )}
          {step === 1 && (
            <TimeAndDate
              request={request}
              setRequest={setRequest}
              selectedTimes={selectedTimes}
              setReturnDate={setReturnDate}
              times={selectedTimes}
              setDuration1={setDuration}
              live={true}
            />
          )}
          {step === 3 && (
            <>
              <ContactForm
                duration={appointmentDuration}
                time={returnDate}
                service={returnService}
                onFormSubmit={handleFinish}
                onOptionSelect={handleOptionChange}
                languages={[
                  {
                    language: "English",
                    flagImg: "/images/english.png",
                  },
                  {
                    language: "Turkish",
                    flagImg: "/images/turkish.png",
                  },
                ]}
              />
            </>
          )}
          <div className="flex items-center justify-center buttonArea mt-4">
            {step > 1 && (
              <div className="nextStep flex items-center justify-center m-3 mb-5">
                <button
                  onClick={handleBack}
                  className="border-premiumOrange bg-white border-2 rounded-lg flex items-center justify-center w-[8rem] buttons"
                >
                  <h4 className="text-premiumOrange p-2 text-sm lg:text-md tracking-wider">
                    <i className="mr-2 fa-solid fa-chevron-left"></i> Geri
                  </h4>
                </button>
              </div>
            )}
            {step === 2 && (
              <>
                <div className="nextStep flex items-center justify-center m-3 mb-5">
                  <button
                    onClick={handleNext}
                    className="bg-premiumOrange rounded-lg flex items-center justify-center w-[8rem] buttons"
                  >
                    <h4 className="text-white p-2 text-sm lg:text-md  tracking-wider">
                      İleri <i className="ml-2 fa-solid fa-chevron-right"></i>
                    </h4>
                  </button>
                </div>
              </>
            )}
            {step < 2 && (
              <div className="nextStep flex items-center justify-center m-3 mb-5">
                <button
                  onClick={handleNext}
                  className="bg-premiumOrange rounded-lg flex items-center justify-center w-[8rem] buttons"
                >
                  <h4 className="text-white p-2 text-sm lg:text-md tracking-wider">
                    İleri<i className="ml-2 fa-solid fa-chevron-right"></i>
                  </h4>
                </button>
              </div>
            )}
            {step === 3 && (
              <>
                <div className="nextStep flex items-center justify-center m-3 mb-5">
                  <button
                    value="Submit"
                    form="myform"
                    type="submit"
                    className="bg-premiumOrange rounded-lg flex items-center justify-center w-[8rem] buttons"
                  >
                    <h4 className="text-white p-2 text-sm lg:text-md  tracking-wider">
                      Bitir<i className="ml-2 fa-solid fa-check"></i>
                    </h4>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AppointmentComponent;
