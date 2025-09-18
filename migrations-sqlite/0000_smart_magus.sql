CREATE TABLE `catalog_products` (
	`id` text PRIMARY KEY NOT NULL,
	`product_code` text NOT NULL,
	`name` text NOT NULL,
	`unit` text DEFAULT 'упак' NOT NULL,
	`quantity` integer DEFAULT 0,
	`pcs_per_package` real,
	`area_per_package` real,
	`barcode` text,
	`price` text,
	`category` text NOT NULL,
	`collection` text,
	`color` text,
	`format` text,
	`surface` text,
	`image_url` text,
	`images` text DEFAULT '[]' NOT NULL,
	`description` text,
	`specifications` text DEFAULT '{}',
	`profile` text,
	`availability` text DEFAULT 'В наличии',
	`is_active` integer DEFAULT 1,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT (current_timestamp),
	`updated_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_products_product_code_unique` ON `catalog_products` (`product_code`);--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`issue_date` text NOT NULL,
	`valid_until` text NOT NULL,
	`issuer` text NOT NULL,
	`size` text NOT NULL,
	`number` text NOT NULL,
	`image_url` text,
	`file_url` text,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT (current_timestamp),
	`updated_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `dealer_locations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`region` text NOT NULL,
	`phone` text,
	`email` text,
	`website` text,
	`latitude` text NOT NULL,
	`longitude` text NOT NULL,
	`dealer_type` text NOT NULL,
	`services` text DEFAULT '[]' NOT NULL,
	`working_hours` text,
	`is_active` integer DEFAULT 1,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT (current_timestamp),
	`updated_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `gallery_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`application` text NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`materials_used` text DEFAULT '[]' NOT NULL,
	`location` text,
	`area` text,
	`year` text,
	`is_active` integer DEFAULT 1,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT (current_timestamp),
	`updated_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `hero_images` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`image_url` text NOT NULL,
	`is_active` integer DEFAULT 1,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT (current_timestamp),
	`updated_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `installation_instructions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`size` text NOT NULL,
	`file_url` text,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT (current_timestamp),
	`updated_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE TABLE `video_instructions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`duration` text NOT NULL,
	`category` text NOT NULL,
	`video_url` text,
	`thumbnail_url` text,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT (current_timestamp),
	`updated_at` text DEFAULT (current_timestamp)
);
