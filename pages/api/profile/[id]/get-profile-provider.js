import prisma from "@/lib/prisma";

const handler = async (req, res) => {
  if (req.method === "GET") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Username parametresi gereklidir",
      });
    }

    const include = {
      user: true,
      serviceAreas: true,
    };

    try {
      const serviceProvider = await prisma.hizmetVeren.findUnique({
        where: { userId: id },
        include: include,
      });

      if (!serviceProvider) {
        return res.status(404).json({
          status: "error",
          message: "HizmetVeren bulunamadı",
        });
      }

      return res.status(200).json({
        status: "success",
        data: serviceProvider,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Veritabanında bir hata oluştu!",
        error: error.message,
      });
    }
  }

  return res.status(405).json({
    status: "error",
    message: "Method not allowed",
  });
};

export default handler;
