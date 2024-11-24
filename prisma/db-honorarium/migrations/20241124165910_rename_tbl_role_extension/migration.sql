-- AlterTable
ALTER TABLE "permissions" ALTER COLUMN "action" DROP DEFAULT,
ALTER COLUMN "resource" DROP DEFAULT;


-- Rename the table RoleExtension to role_extension
ALTER TABLE "RoleExtension" RENAME TO "role_extension";

-- Drop old constraints
ALTER TABLE "role_extension" DROP CONSTRAINT "RoleExtension_base_role_id_fkey";
ALTER TABLE "role_extension" DROP CONSTRAINT "RoleExtension_extended_role_id_fkey";

-- Add new constraints with updated names
ALTER TABLE "role_extension" ADD CONSTRAINT "role_extension_base_role_id_fkey" FOREIGN KEY ("base_role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_extension" ADD CONSTRAINT "role_extension_extended_role_id_fkey" FOREIGN KEY ("extended_role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Optionally, rename the primary key constraint if needed
ALTER TABLE "role_extension" DROP CONSTRAINT "RoleExtension_pkey";
ALTER TABLE "role_extension" ADD CONSTRAINT "role_extension_pkey" PRIMARY KEY ("id");