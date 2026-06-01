-- 0005: Remove the admin role, Cloudinary-backed documents, and notifications.
-- Reconciles the database with the code removal of these features.

-- Drop tables (also drops their indexes and RLS policies).
DROP TABLE IF EXISTS "Document";
DROP TABLE IF EXISTS "Notification";

-- Remove the admin/user role column from User.
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";

-- Drop now-unused enum types (no remaining columns reference them).
DROP TYPE IF EXISTS "DocType";
DROP TYPE IF EXISTS "NotificationType";
DROP TYPE IF EXISTS "UserRole";
