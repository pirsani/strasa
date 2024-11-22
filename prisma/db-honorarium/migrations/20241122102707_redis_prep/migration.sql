/*
  Warnings:

  - A unique constraint covering the columns `[resource,action]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `action` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resource` to the `permissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "permissions_name_key";

-- AlterTable
-- Add the new columns with default values
ALTER TABLE "permissions" 
ADD COLUMN "action" TEXT DEFAULT 'default_action',
ADD COLUMN "resource" TEXT DEFAULT 'default_resource';

-- update permissions
UPDATE "permissions" 
SET "action" =  "name" , 
"resource" =  'panda';

-- AlterColumn
ALTER TABLE "permissions"
ALTER COLUMN "action" SET NOT NULL,
ALTER COLUMN "resource" SET NOT NULL;

-- CreateTable
CREATE TABLE "RoleExtension" (
    "id" TEXT NOT NULL,
    "base_role_id" TEXT NOT NULL,
    "extended_role_id" TEXT NOT NULL,

    CONSTRAINT "RoleExtension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- AddForeignKey
ALTER TABLE "RoleExtension" ADD CONSTRAINT "RoleExtension_base_role_id_fkey" FOREIGN KEY ("base_role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleExtension" ADD CONSTRAINT "RoleExtension_extended_role_id_fkey" FOREIGN KEY ("extended_role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
