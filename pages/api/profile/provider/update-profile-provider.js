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
      .json({ status: "error", message: "Invalid request!" });
  }

  const {
    hizmetVerenId,
    firstName,
    lastName,
    birthdate,
    phone,
    email,
    profileImg,
  } = req.body;

  try {
    // Fetch the existing HizmetVeren record
    const existingHizmetVeren = await prisma.hizmetVeren.findUnique({
      where: { id: hizmetVerenId },
      include: { user: true }, // Include relation with the User table
    });

    if (!existingHizmetVeren) {
      return res
        .status(404)
        .json({ status: "error", message: "Service provider not found!" });
    }

    let updatedData = {};

    // Update the username if the first name or last name has changed
    if (
      firstName !== existingHizmetVeren.name ||
      lastName !== existingHizmetVeren.surname
    ) {
      const cleanedFirstName = normalizeAndRemoveSpaces(
        firstName || existingHizmetVeren.name
      );
      const cleanedLastName = normalizeAndRemoveSpaces(
        lastName || existingHizmetVeren.surname
      );
      const newUsername = await generateUniqueUsername(
        cleanedFirstName,
        cleanedLastName
      );

      updatedData.user = { update: { username: newUsername } };
    }

    // Update email if it has changed
    if (email && email !== existingHizmetVeren.user?.email) {
      updatedData.user = {
        update: {
          ...(updatedData.user?.update || {}),
          email: email,
        },
      };
    }

    // Update birthdate if it has changed
    if (birthdate && birthdate !== existingHizmetVeren.user?.birthdate) {
      updatedData.user = {
        update: {
          ...(updatedData.user?.update || {}),
          birthdate: birthdate,
        },
      };
    }

    // Update first name and last name in the HizmetVeren table
    if (firstName !== existingHizmetVeren.name) {
      updatedData.name = firstName;
    }
    if (lastName !== existingHizmetVeren.surname) {
      updatedData.surname = lastName;
    }

    // Update phone number if it has changed
    if (phone && phone !== existingHizmetVeren.phone) {
      updatedData.phone = phone;
    }
    if (profileImg && profileImg !== existingHizmetVeren.profileImg) {
      updatedData.profileImg = profileImg;
    }

    // Apply the updates
    const updatedHizmetVeren = await prisma.hizmetVeren.update({
      where: { id: hizmetVerenId },
      data: updatedData,
    });

    return res
      .status(200)
      .json({ status: "UPDATED", data: updatedHizmetVeren });
  } catch (error) {
    console.error("Database request failed:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

export default handler;
