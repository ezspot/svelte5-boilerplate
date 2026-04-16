/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,displayId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `displayId` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "ticketPrefix" TEXT NOT NULL DEFAULT 'TKT';

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "displayId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "HelpdeskSettings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fromName" TEXT,
    "fromEmail" TEXT,
    "resendApiKey" TEXT,
    "inboundWebhookSecret" TEXT,

    CONSTRAINT "HelpdeskSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HelpdeskSettings_organizationId_key" ON "HelpdeskSettings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_organizationId_displayId_key" ON "Ticket"("organizationId", "displayId");

-- AddForeignKey
ALTER TABLE "HelpdeskSettings" ADD CONSTRAINT "HelpdeskSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
