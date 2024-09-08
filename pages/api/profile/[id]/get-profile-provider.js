import prisma from '@/lib/prisma'

const handler = async (req, res) => {
  if (req.method === 'GET') {
    const { id } = req.query // id burada username olarak kullanılıyor

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Username parametresi gereklidir',
      })
    }

    const include = {
      user: true,
      educationInfo: true,
      certificates: true,
      comments: true,
      resume: true,
      skills: true,
      languages: true,
    }

    try {
      const serviceProvider = await prisma.hizmetVeren.findFirst({
        where: {
          user: {
            username: id, // username, User tablosunda
          },
        },
        include: include,
      })

      if (!serviceProvider) {
        return res.status(404).json({
          status: 'error',
          message: 'HizmetVeren bulunamadı',
        })
      }

      return res.status(200).json({
        status: 'success',
        data: serviceProvider,
      })
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
