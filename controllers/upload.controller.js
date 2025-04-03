const cloudinary = require('../config/cloudinary');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    // 🧠 1. Buscar al usuario logeado
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // 📤 2. Subir la nueva imagen
    const bufferToStream = (buffer) => {
      const { Readable } = require('stream');
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);
      return stream;
    };

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'YourVirtualGuide/Images/Users' },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: 'Error al subir a Cloudinary', error });
        }

        // 🧹 3. Si hay imagen anterior, eliminarla
        if (user.imagePublicId) {
          cloudinary.uploader.destroy(user.imagePublicId, (error, result) => {
            if (error) {
              console.warn('No se pudo eliminar la imagen anterior:', error);
            } else {
              console.log('Imagen anterior eliminada:', result);
            }
          });
        }        


        // 💾 4. Guardar la nueva URL en la BBDD
        await prisma.user.update({
          where: { id: req.user.id },
          data: {
            profileImageUrl: result.secure_url,
            imagePublicId: result.public_id
          }
        });        

        res.status(200).json({
          message: 'Imagen actualizada correctamente',
          url: result.secure_url
        });
      }
    );

    bufferToStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};



