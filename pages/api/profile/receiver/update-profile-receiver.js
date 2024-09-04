import prisma from "@/lib/prisma";

function normalizeAndRemoveSpaces(str) {
  return str
    .normalize("NFD") // Unicode Normalization Form D
    .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritical marks
    .toLowerCase()
    .replace(/\s+/g, ""); // Remove spaces
}

async function generateUniqueUsername(name, surname) {
  const usernameBase = `${name}${surname}`;
  let username = normalizeAndRemoveSpaces(usernameBase);
  let counter = 1;

  const existingUsernames = await getExistingUsernames(username);

  while (existingUsernames.has(username)) {
    // Eğer kullanıcı adı zaten varsa, sayıyı arttır ve tekrar dene
    counter++;
    username = `${normalizeAndRemoveSpaces(usernameBase)}${counter}`;
  }

  return username;
}

async function getExistingUsernames(prefix) {
  const existingUsers = await prisma.user.findMany({
    where: {
      username: {
        startsWith: prefix,
      },
    },
    select: {
      username: true,
    },
  });

  return new Set(existingUsers.map((user) => user.username));
}

const handler = async (req, res) => {
  if (!req || req.method !== "POST" || !req.body) {
    return res
      .status(500)
      .json({ status: "error", message: "Geçersiz istek!" });
  }

  const {
    hizmetAlanId,
    firstName,
    lastName,
    birthdate,
    phone,
    email,
    profileImg,
  } = req.body;

  try {
    // HizmetAlan tablosundan mevcut kayıtları çek
    const existingHizmetAlan = await prisma.hizmetAlan.findUnique({
      where: { id: hizmetAlanId },
      include: { user: true }, // User tablosuyla ilişkiyi dahil et
    });

    if (!existingHizmetAlan) {
      return res
        .status(404)
        .json({ status: "error", message: "Hizmet alan bulunamadı!" });
    }

    let updatedData = {};

    // firstName veya lastName değiştiyse username'i güncelle
    if (
      firstName !== existingHizmetAlan.name ||
      lastName !== existingHizmetAlan.surname
    ) {
      const cleanedFirstName = normalizeAndRemoveSpaces(
        firstName || existingHizmetAlan.name
      );
      const cleanedLastName = normalizeAndRemoveSpaces(
        lastName || existingHizmetAlan.surname
      );
      const newUsername = await generateUniqueUsername(
        cleanedFirstName,
        cleanedLastName
      );

      updatedData.user = { update: { username: newUsername } };
    }

    // Email güncellemesi
    if (email && email !== existingHizmetAlan.user?.email) {
      updatedData.user = {
        update: {
          ...(updatedData.user?.update || {}),
          email: email,
        },
      };
    }

    // Eğer doğum tarihi güncellenmişse user tablosunda da güncelle
    if (birthdate && birthdate !== existingHizmetAlan.user?.birthdate) {
      updatedData.user = {
        update: {
          ...(updatedData.user?.update || {}),
          birthdate: birthdate,
        },
      };
    }

    // İlk adı ve soyadı HizmetAlan tablosunda güncelle
    if (firstName !== existingHizmetAlan.name) {
      updatedData.name = firstName;
    }
    if (lastName !== existingHizmetAlan.surname) {
      updatedData.surname = lastName;
    }

    // Eğer telefon numarası değiştiyse HizmetAlan tablosunda güncelle
    if (phone && phone !== existingHizmetAlan.phone) {
      updatedData.phone = phone;
    }

    if (profileImg && profileImg !== existingHizmetAlan.profileImg) {
      updatedData.profileImg = profileImg;
    }
    // Güncellemeleri uygula
    const updatedHizmetAlan = await prisma.hizmetAlan.update({
      where: { id: hizmetAlanId },
      data: updatedData,
    });

    return res.status(200).json({ status: "UPDATED", data: updatedHizmetAlan });
  } catch (error) {
    console.error("Database request failed:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

export default handler;
