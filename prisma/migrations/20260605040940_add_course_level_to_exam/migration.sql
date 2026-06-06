-- AlterTable - Add courseLevel to Exam
ALTER TABLE `Exam` ADD COLUMN `courseLevel` VARCHAR(191) NULL;

-- AlterTable - Remove unique constraints from Student
ALTER TABLE `Student` DROP INDEX `Student_regNumber_key`;
ALTER TABLE `Student` DROP INDEX `Student_nicNumber_key`;