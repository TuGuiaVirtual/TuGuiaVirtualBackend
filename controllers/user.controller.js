const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        profileImageUrl: true,
        touristPoints: true,
        gastronomicAlerts: true,
        experienceNotifications: true,
        guideNews: true,
        emailNotifications: true,
        allowLocation: true,
        autoPlayAudio: true,
        name: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, phone } = req.body;

  if (!name && !phone) {
    return res.status(400).json({message: 'Debes enviar al menos un campo para actualizar'})
  }

  try {
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = String(phone);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    res.json({
      message: 'Perfil actualizado correctamente',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        phone: updatedUser.phone
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
}

exports.updatePreferences = async (req, res) => {
  const userId = req.user.id;

  const {
    touristPoints,
    gastronomicAlerts,
    experienceNotifications,
    guideNews,
    emailNotifications
  } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        touristPoints,
        gastronomicAlerts,
        experienceNotifications,
        guideNews,
        emailNotifications
      }
    });

    res.json({
      message: 'Preferencias actualizadas correctamente',
      preferences: {
        touristPoints: updatedUser.touristPoints,
        gastronomicAlerts: updatedUser.gastronomicAlerts,
        experienceNotifications: updatedUser.experienceNotifications,
        guideNews: updatedUser.guideNews,
        emailNotifications: updatedUser.emailNotifications
      }
    });

  } catch (error) {
    console.error('Error al actualizar preferencias:', error);
    res.status(500).json({ message: 'Error al actualizar preferencias' });
  }
};

exports.updatePermissions = async (req, res) => {
  const { allowLocation, autoPlayAudio } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        allowLocation,
        autoPlayAudio
      }
    });

    res.json({
      message: 'Permisos actualizados correctamente',
      permissions: {
        allowLocation: user.allowLocation,
        autoPlayAudio: user.autoPlayAudio
      }
    });
  } catch (err) {
    console.error('Error al actualizar permisos:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getDoc = async (req, res) => {
  const { nameDoc, lang } = req.query;

  if (!nameDoc || !lang) {
    return res.status(400).json({ message: 'Faltan parámetros' });
  }

  try {
    const doc = await prisma.staticDocument.findUnique({
      where: {
        key_language: {
          key: nameDoc,
          language: lang
        }
      }
    });

    if (!doc) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    res.json({ url: doc.url });
  } catch (error) {
    console.error('Error al obtener el documento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.update({
      where: { email: decoded.email },
      data: { emailVerified: true }
    });

    res.json({ message: 'Correo verificado correctamente', user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Token inválido o expirado' });
  }
};
