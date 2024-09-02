import prisma from '@/lib/prisma'

const handler = async (req, res) => {
  if (req.method === 'GET') {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Username parametresi gereklidir',
      })
    }

    try {
      const user = await prisma.user.findUnique({
        where: { username: id },
      })

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Kullanıcı bulunamadı',
        })
      }

      const serviceProvider = await prisma.hizmetVeren.findUnique({
        where: { userId: user.id },
        include: {
          skills: true,
        },
      })

      if (!serviceProvider) {
        return res.status(404).json({
          status: 'error',
          message: 'HizmetVeren bulunamadı',
        })
      }

      return res.status(200).json({
        status: 'success',
        data: serviceProvider.skills,
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
