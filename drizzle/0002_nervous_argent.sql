CREATE TABLE `resource_catalog` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`topic` text NOT NULL,
	`title` text NOT NULL,
	`provider` text NOT NULL,
	`kind` text NOT NULL,
	`url` text NOT NULL,
	`source_url` text NOT NULL,
	`usage_note` text NOT NULL,
	`verified_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_resources_subject_topic` ON `resource_catalog` (`subject`,`topic`);--> statement-breakpoint
ALTER TABLE `questions` ADD `topic_label` text;--> statement-breakpoint
ALTER TABLE `topics` ADD `week` integer DEFAULT 1 NOT NULL;