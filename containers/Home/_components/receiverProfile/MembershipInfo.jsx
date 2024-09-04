"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import { postAPI } from "@/services/fetchAPI";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import isEqual from "lodash/isEqual";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const MembershipInfo = ({ profileInfo, type }) => {
  const [initialValues, setInitialValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImg: "",
    birthDate: null,
    corporateCheck: false,
  });
  const [formKey, setFormKey] = useState(0);
  const router = useRouter();
  const s3 = new AWS.S3({
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    region: "eu-north-1",
  });
  const handleFileUploadUrl = async (file) => {
    if (file) {
      const fileName = `${
        profileInfo.name || profileInfo.firstName
      }-${Date.now()}`;
      const params = {
        Bucket: "ofistikprofileimages", // Your bucket name
        Key: fileName, // File name you want to save as in S3
        Body: file,
        ContentType: file.type, // MIME type of the file
      };

      try {
        const data = await s3.upload(params).promise(); // Upload to S3
        return data.Location; // Return the yS3 file URL
      } catch (error) {
        console.error("Failed to upload file to S3", error);
        throw error;
      }
    }
  };
  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const imageUrl = await handleFileUploadUrl(file); // S3'e yükleyin ve URL'yi alın
        formik.setFieldValue("profileImg", imageUrl); // URL'yi profileImg alanına kaydedin
      } catch (error) {
        toast.error("Dosya yüklenirken bir hata oluştu.");
      }
    } else {
      toast.error("Lütfen yalnızca resim dosyası yükleyin.");
    }
  };
  useEffect(() => {
    if (profileInfo) {
      let birthDateValue = null;

      if (profileInfo?.user?.birthdate) {
        const [day, month, year] = profileInfo.user.birthdate.split("/");
        birthDateValue = new Date(`${year}-${month}-${day}`);
      }

      const values = {
        firstName: profileInfo?.name || "",
        lastName: profileInfo?.surname || "",
        email: profileInfo?.user?.email || "",
        phone: profileInfo?.phone || "",
        profileImg: profileInfo?.profileImg || "",
        birthDate: birthDateValue,
        corporateCheck: false,
      };

      setInitialValues(values);
      setFormKey((prevKey) => prevKey + 1); // formKey'i güncelle
    }
  }, [profileInfo]);

  const formik = useFormik({
    enableReinitialize: true,
    key: formKey, // formKey ile formu yeniden render et
    initialValues,
    validationSchema: Yup.object({
      firstName: Yup.string().required("Ad zorunludur"),
      lastName: Yup.string().required("Soyad zorunludur"),
      email: Yup.string()
        .email("Geçersiz e-posta adresi")
        .required("E-posta zorunludur"),
      phone: Yup.string()
        .matches(/^\+?\d+$/, "Geçerli bir telefon numarası girin")
        .required("Cep telefonu zorunludur"),
      birthDate: Yup.date().nullable(),
    }),
    onSubmit: async (values) => {
      const formattedBirthDate = values.birthDate
        ? `${values.birthDate.getDate()}/${
            values.birthDate.getMonth() + 1
          }/${values.birthDate.getFullYear()}`
        : null;

      if (type === "PROVIDER") {
        const res = await postAPI("/profile/provider/update-profile-provider", {
          ...values,
          birthdate: formattedBirthDate,
          hizmetVerenId: profileInfo.id,
        });

        if (res.status === "UPDATED") {
          toast.success("Profil Bilgisi Başarıyla güncellendi");
          setInitialValues(values);
          setFormKey((prevKey) => prevKey + 1);
          router.refresh();
        } else {
          toast.error("Bir hata oluştu tekrar deneyiniz");
        }
      }

      if (type === "RECEIVER") {
        const res = await postAPI("/profile/receiver/update-profile-receiver", {
          ...values,
          birthdate: formattedBirthDate,
          hizmetAlanId: profileInfo.id,
        });

        if (res.status === "UPDATED") {
          toast.success("Profil Bilgisi Başarıyla güncellendi");
          setInitialValues(values);
          setFormKey((prevKey) => prevKey + 1);
          router.refresh();
        } else {
          toast.error("Bir hata oluştu tekrar deneyiniz");
        }
      }
    },
  });

  const isFormModified = !isEqual(formik.values, initialValues);

  return (
    <div className="flex flex-col p-6 bg-white shadow-lg rounded-md w-full h-[600px] overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Üyelik Bilgilerim</h2>
      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col justify-between h-full"
      >
        {/* Avatar */}
        <div className="flex flex-col gap-1">
          <label htmlFor="avatar" className="text-sm font-semibold">
            Avatar
          </label>
          <input
            type="file"
            name="avatar"
            accept="image/*" // Yalnızca resim dosyalarını kabul et
            className="border p-2 rounded w-full"
            onChange={handleAvatarChange} // Değişiklik fonksiyonunu çağır
          />
          <div className="min-h-[20px]">
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm">{formik.errors.email}</div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* First Name */}
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="firstName" className="text-sm font-semibold">
              Ad
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="Ad"
              className="border p-2 rounded w-full"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.firstName}
            />
            <div className="min-h-[20px]">
              {formik.touched.firstName && formik.errors.firstName ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.firstName}
                </div>
              ) : null}
            </div>
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="lastName" className="text-sm font-semibold">
              Soyad
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="Soyad"
              className="border p-2 rounded w-full"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.lastName}
            />
            <div className="min-h-[20px]">
              {formik.touched.lastName && formik.errors.lastName ? (
                <div className="text-red-500 text-sm">
                  {formik.errors.lastName}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-semibold">
            E-Mail
          </label>
          <input
            type="email"
            name="email"
            placeholder="E-Mail"
            className="border p-2 rounded w-full"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          <div className="min-h-[20px]">
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm">{formik.errors.email}</div>
            ) : null}
          </div>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Cep Telefonu</label>
          <div className="flex gap-4">
            <input
              type="tel"
              name="phone"
              placeholder="Cep Telefonu"
              className="border p-2 rounded w-full"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
            />
          </div>
          <div className="min-h-[20px]">
            {formik.touched.phone && formik.errors.phone ? (
              <div className="text-red-500 text-sm">{formik.errors.phone}</div>
            ) : null}
          </div>
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="birthDate" className="text-sm font-semibold">
            Doğum Tarihiniz
          </label>
          <DatePicker
            selected={formik.values.birthDate}
            onChange={(date) => formik.setFieldValue("birthDate", date)}
            dateFormat="dd/MM/yyyy"
            className="border p-2 rounded w-full"
            placeholderText="Gün/Ay/Yıl"
          />
          <div className="min-h-[20px]">
            {formik.touched.birthDate && formik.errors.birthDate ? (
              <div className="text-red-500 text-sm">
                {formik.errors.birthDate}
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          className={`p-2 rounded text-white ${
            isFormModified && !formik.isSubmitting
              ? "bg-orange-500"
              : "bg-orange-300 cursor-not-allowed"
          }`}
          disabled={!isFormModified || formik.isSubmitting}
        >
          Güncelle
        </button>
      </form>
    </div>
  );
};

export default MembershipInfo;
