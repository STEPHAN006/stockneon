-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "deletedAt" TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- Insert default department
INSERT INTO "Department" (name) VALUES ('IT') ON CONFLICT DO NOTHING;

-- Add new columns to Exit with default values
ALTER TABLE "Exit" ADD COLUMN "departmentId" INTEGER;
ALTER TABLE "Exit" ADD COLUMN "forUser" TEXT;

-- Set default values for existing records
UPDATE "Exit" SET 
    "departmentId" = (SELECT id FROM "Department" WHERE name = 'IT' LIMIT 1),
    "forUser" = 'Non spécifié'
WHERE "departmentId" IS NULL OR "forUser" IS NULL;

-- Make the columns required
ALTER TABLE "Exit" ALTER COLUMN "departmentId" SET NOT NULL;
ALTER TABLE "Exit" ALTER COLUMN "forUser" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "Exit" ADD CONSTRAINT "Exit_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;