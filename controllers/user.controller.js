const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        autoPlayAudio: true
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
  const {name, phone} = req.body;

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

