CREATE TABLE `shareLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`accessType` enum('dashboard','specific_property','report') DEFAULT 'dashboard',
	`propertyId` int,
	`viewCount` int DEFAULT 0,
	`lastAccessedAt` timestamp,
	`isRevoked` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shareLinks_id` PRIMARY KEY(`id`),
	CONSTRAINT `shareLinks_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `shareLinks` ADD CONSTRAINT `shareLinks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shareLinks` ADD CONSTRAINT `shareLinks_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE cascade ON UPDATE no action;