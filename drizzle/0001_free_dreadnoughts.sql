CREATE TABLE `api_calls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`api_name` varchar(100) NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`method` varchar(10) NOT NULL,
	`status_code` int,
	`response_time` int,
	`success` int NOT NULL DEFAULT 1,
	`error_message` text,
	`data_size` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_calls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `energy_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`facility` varchar(255) NOT NULL,
	`energy_type` varchar(50) NOT NULL,
	`consumption` int NOT NULL,
	`cost` int NOT NULL,
	`efficiency` int,
	`carbon_emission` int,
	`peak_usage` int,
	`average_usage` int,
	`trend` varchar(20),
	`notes` text,
	`record_date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `energy_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `logistics_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tracking_number` varchar(100) NOT NULL,
	`status` varchar(50) NOT NULL,
	`origin` varchar(255) NOT NULL,
	`destination` varchar(255) NOT NULL,
	`carrier` varchar(100),
	`estimated_delivery` timestamp,
	`actual_delivery` timestamp,
	`weight` int,
	`distance` int,
	`cost` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `logistics_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `logistics_records_tracking_number_unique` UNIQUE(`tracking_number`)
);
--> statement-breakpoint
CREATE TABLE `weather_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`location` varchar(255) NOT NULL,
	`temperature` int NOT NULL,
	`humidity` int NOT NULL,
	`windSpeed` int NOT NULL,
	`condition` varchar(100) NOT NULL,
	`description` text,
	`feelsLike` int,
	`uvIndex` int,
	`visibility` int,
	`pressure` int,
	`precipitation` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weather_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `api_calls` ADD CONSTRAINT `api_calls_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `energy_records` ADD CONSTRAINT `energy_records_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `logistics_records` ADD CONSTRAINT `logistics_records_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `weather_records` ADD CONSTRAINT `weather_records_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;