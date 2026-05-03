-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT '1',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceText" TEXT NOT NULL DEFAULT 'Сайт временно недоступен. Мы скоро вернёмся.',
    "updatedAt" DATETIME NOT NULL
);
