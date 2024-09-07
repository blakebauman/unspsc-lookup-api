CREATE TABLE `error_analytics` (
	`id` integer PRIMARY KEY NOT NULL,
	`error_message` text NOT NULL,
	`error_count` integer NOT NULL,
	`timestamp` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `search_analytics` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`search_count` integer NOT NULL,
	`last_searched` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `unspsc_codes` (
	`id` integer PRIMARY KEY NOT NULL,
	`segment` text NOT NULL,
	`segment_name` text NOT NULL,
	`family` text NOT NULL,
	`family_name` text NOT NULL,
	`class` text NOT NULL,
	`class_name` text NOT NULL,
	`commodity` text NOT NULL,
	`commodity_name` text NOT NULL,
	`version` text,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`version`) REFERENCES `unspsc_versions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `unspsc_versions` (
	`id` integer PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `usage_analytics` (
	`id` integer PRIMARY KEY NOT NULL,
	`endpoint` text NOT NULL,
	`request_count` integer NOT NULL,
	`timestamp` integer DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE INDEX `segment_index` ON `unspsc_codes` (`segment`);--> statement-breakpoint
CREATE INDEX `family_index` ON `unspsc_codes` (`family`);--> statement-breakpoint
CREATE INDEX `class_index` ON `unspsc_codes` (`class`);--> statement-breakpoint
CREATE INDEX `commodity_index` ON `unspsc_codes` (`commodity`);--> statement-breakpoint
CREATE INDEX `segment_family_index` ON `unspsc_codes` (`segment`,`family`);--> statement-breakpoint
CREATE UNIQUE INDEX `version_unique` ON `unspsc_versions` (`version`);