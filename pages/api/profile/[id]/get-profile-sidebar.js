import prisma from '@/lib/prisma'

const handler = async (req, res) => {
  if (req.method === 'GET') {
    const { id } = req.query // Gelen userId

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'userId parametresi gereklidir',
      })
    }

    const include = {
      user: {
        select: {
          email: true,
          birthdate: true, // Sadece email alanını seçiyoruz
        },
      },
      comments: true,
    }

    try {
      // İlk olarak hizmet alanı bul
      const hizmetAlan = await prisma.hizmetAlan.findFirst({
        where: {
          userId: id,
        },
        include: include,
      })

      // Sonrasında hizmet veren bul
      const hizmetVeren = await prisma.hizmetVeren.findFirst({
        where: {
          userId: id,
        },
        include: {
          user: true,
          skills: true,
        },
      })

      // İkisini de bulamazsak 404 döndür
      if (!hizmetAlan && !hizmetVeren) {
        return res.status(404).json({
          status: 'error',
          message: 'Hizmet Alan veya Hizmet Veren bulunamadı',
        })
      }

      // Eğer sadece hizmet veren varsa
      if (!hizmetAlan && hizmetVeren) {
        return res.status(200).json({
          status: 'success',
          data: hizmetVeren,
          message: 'PROVIDER',
        })
      }

      // Eğer sadece hizmet alan varsa
      if (!hizmetVeren && hizmetAlan) {
        return res.status(200).json({
          status: 'success',
          data: hizmetAlan,
          message: 'RECEIVER',
        })
      }

      // Eğer ikisi de varsa
      if (hizmetAlan && hizmetVeren) {
        return res.status(200).json({
          status: 'success',
          data: hizmetAlan,
          message: 'BOTH',
        })
      }
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Veritabanında bir hata oluştu!',
        error: error.message,
      })
    }
  }

  return res.status(405).json({
    status: 'error',
    message: 'Method not allowed',
  })
}

export default handler
