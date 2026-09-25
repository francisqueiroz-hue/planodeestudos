CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`question_id` text NOT NULL,
	`response` text NOT NULL,
	`correct` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_attempts_owner_created` ON `attempts` (`owner`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_attempts_question_id` ON `attempts` (`question_id`);--> statement-breakpoint
CREATE TABLE `materials` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`kind` text NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`object_key` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_materials_owner_created` ON `materials` (`owner`,`created_at`);--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`exam_date` text,
	`target` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_plans_owner_created` ON `plans` (`owner`,`created_at`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`topic_id` text,
	`prompt` text NOT NULL,
	`answer` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_questions_owner_created` ON `questions` (`owner`,`created_at`);--> statement-breakpoint
CREATE TABLE `topics` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_topics_plan_id` ON `topics` (`plan_id`);