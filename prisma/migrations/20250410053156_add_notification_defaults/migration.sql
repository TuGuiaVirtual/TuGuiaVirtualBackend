-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "experienceNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gastronomicAlerts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "guideNews" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "touristPoints" BOOLEAN NOT NULL DEFAULT false;
