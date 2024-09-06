CREATE TABLE `unspsc_codes` (
	`id` integer PRIMARY KEY NOT NULL,
	`segment` text NOT NULL,
	`segment_name` text NOT NULL,
	`family` text NOT NULL,
	`family_name` text NOT NULL,
	`class` text NOT NULL,
	`class_name` text NOT NULL,
	`commodity` text NOT NULL,
	`commodity_name` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `segment_index` ON `unspsc_codes` (`segment`);--> statement-breakpoint
CREATE INDEX `family_index` ON `unspsc_codes` (`family`);--> statement-breakpoint
CREATE INDEX `class_index` ON `unspsc_codes` (`class`);--> statement-breakpoint
CREATE INDEX `commodity_index` ON `unspsc_codes` (`commodity`);