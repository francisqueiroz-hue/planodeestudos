CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_chat_owner_created` ON `chat_messages` (`owner`,`created_at`);--> statement-breakpoint
CREATE TABLE `study_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`subject` text NOT NULL,
	`duration_seconds` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_owner_created` ON `study_sessions` (`owner`,`created_at`);--> statement-breakpoint
ALTER TABLE `attempts` ADD `feedback` text;--> statement-breakpoint
ALTER TABLE `attempts` ADD `grading_method` text DEFAULT 'exact' NOT NULL;--> statement-breakpoint
ALTER TABLE `materials` ADD `processing_status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ADD `subject` text;--> statement-breakpoint
ALTER TABLE `questions` ADD `explanation` text;--> statement-breakpoint
ALTER TABLE `questions` ADD `source` text;