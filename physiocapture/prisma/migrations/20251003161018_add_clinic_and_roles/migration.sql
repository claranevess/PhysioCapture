/*
  Warnings:

  - You are about to drop the column `userId` on the `patients` table. All the data in the column will be lost.
  - Added the required column `clinicId` to the `consultations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicId` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicId` to the `patients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "clinics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneSecondary" TEXT,
    "zipCode" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'BASIC',
    "planStatus" TEXT NOT NULL DEFAULT 'TRIAL',
    "maxUsers" INTEGER NOT NULL DEFAULT 5,
    "maxPatients" INTEGER NOT NULL DEFAULT 100,
    "maxStorage" INTEGER NOT NULL DEFAULT 5,
    "logo" TEXT,
    "website" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "subscriptionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expirationDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_consultations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "exercises" TEXT,
    "nextVisit" DATETIME,
    "notes" TEXT,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "canEdit" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "consultations_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "consultations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "consultations_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_consultations" ("assessment", "canEdit", "createdAt", "date", "exercises", "id", "nextVisit", "notes", "objective", "patientId", "performedBy", "plan", "subjective", "type", "updatedAt") SELECT "assessment", "canEdit", "createdAt", "date", "exercises", "id", "nextVisit", "notes", "objective", "patientId", "performedBy", "plan", "subjective", "type", "updatedAt" FROM "consultations";
DROP TABLE "consultations";
ALTER TABLE "new_consultations" RENAME TO "consultations";
CREATE INDEX "consultations_clinicId_idx" ON "consultations"("clinicId");
CREATE INDEX "consultations_patientId_idx" ON "consultations"("patientId");
CREATE INDEX "consultations_performedBy_idx" ON "consultations"("performedBy");
CREATE INDEX "consultations_date_idx" ON "consultations"("date");
CREATE TABLE "new_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "clinicId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "documents_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documents_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_documents" ("category", "createdAt", "description", "fileName", "fileSize", "fileUrl", "id", "mimeType", "patientId", "title", "updatedAt", "uploadedBy") SELECT "category", "createdAt", "description", "fileName", "fileSize", "fileUrl", "id", "mimeType", "patientId", "title", "updatedAt", "uploadedBy" FROM "documents";
DROP TABLE "documents";
ALTER TABLE "new_documents" RENAME TO "documents";
CREATE INDEX "documents_clinicId_idx" ON "documents"("clinicId");
CREATE INDEX "documents_patientId_idx" ON "documents"("patientId");
CREATE INDEX "documents_category_idx" ON "documents"("category");
CREATE INDEX "documents_createdAt_idx" ON "documents"("createdAt");
CREATE TABLE "new_patients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "age" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneSecondary" TEXT,
    "email" TEXT,
    "zipCode" TEXT,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "occupation" TEXT,
    "insurance" TEXT,
    "insuranceNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "generalNotes" TEXT,
    "chiefComplaint" TEXT,
    "currentIllness" TEXT,
    "medicalHistory" TEXT,
    "medications" TEXT,
    "allergies" TEXT,
    "lifestyle" TEXT,
    "physicalAssessment" TEXT,
    "clinicId" TEXT NOT NULL,
    "assignedTherapistId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastVisitDate" DATETIME,
    CONSTRAINT "patients_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "patients_assignedTherapistId_fkey" FOREIGN KEY ("assignedTherapistId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_patients" ("age", "allergies", "chiefComplaint", "city", "complement", "cpf", "createdAt", "currentIllness", "dateOfBirth", "email", "fullName", "generalNotes", "id", "insurance", "insuranceNumber", "lastVisitDate", "lifestyle", "medicalHistory", "medications", "neighborhood", "number", "occupation", "phone", "phoneSecondary", "physicalAssessment", "state", "status", "street", "updatedAt", "zipCode") SELECT "age", "allergies", "chiefComplaint", "city", "complement", "cpf", "createdAt", "currentIllness", "dateOfBirth", "email", "fullName", "generalNotes", "id", "insurance", "insuranceNumber", "lastVisitDate", "lifestyle", "medicalHistory", "medications", "neighborhood", "number", "occupation", "phone", "phoneSecondary", "physicalAssessment", "state", "status", "street", "updatedAt", "zipCode" FROM "patients";
DROP TABLE "patients";
ALTER TABLE "new_patients" RENAME TO "patients";
CREATE UNIQUE INDEX "patients_cpf_key" ON "patients"("cpf");
CREATE INDEX "patients_clinicId_idx" ON "patients"("clinicId");
CREATE INDEX "patients_assignedTherapistId_idx" ON "patients"("assignedTherapistId");
CREATE INDEX "patients_cpf_idx" ON "patients"("cpf");
CREATE INDEX "patients_fullName_idx" ON "patients"("fullName");
CREATE INDEX "patients_status_idx" ON "patients"("status");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PHYSIOTHERAPIST',
    "crm" TEXT,
    "cpf" TEXT,
    "phone" TEXT,
    "clinicId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME,
    CONSTRAINT "users_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_users" ("createdAt", "crm", "email", "id", "name", "password", "updatedAt") SELECT "createdAt", "crm", "email", "id", "name", "password", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");
CREATE INDEX "users_clinicId_idx" ON "users"("clinicId");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "clinics_cnpj_key" ON "clinics"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_email_key" ON "clinics"("email");

-- CreateIndex
CREATE INDEX "clinics_cnpj_idx" ON "clinics"("cnpj");

-- CreateIndex
CREATE INDEX "clinics_isActive_idx" ON "clinics"("isActive");
