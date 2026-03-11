CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`changes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `capexItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`estimatedCost` int NOT NULL,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`timeline` varchar(50),
	`roi` int,
	`status` enum('planned','in_progress','completed') DEFAULT 'planned',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `capexItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complianceRequirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`regulationType` varchar(100) NOT NULL,
	`description` text,
	`deadline` timestamp,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `complianceRequirements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complianceViolations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`requirementId` int,
	`violationType` varchar(100) NOT NULL,
	`description` text,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('open','in_progress','resolved') DEFAULT 'open',
	`detectedDate` timestamp DEFAULT (now()),
	`resolvedDate` timestamp,
	`estimatedCost` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complianceViolations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`postcode` varchar(20),
	`propertyType` varchar(50) NOT NULL,
	`yearBuilt` int,
	`floorArea` int,
	`epcRating` varchar(1),
	`epcScore` int,
	`riskScore` int DEFAULT 0,
	`riskLevel` enum('low','medium','high') DEFAULT 'low',
	`complianceStatus` enum('compliant','at_risk','non_compliant') DEFAULT 'compliant',
	`lettable` int DEFAULT 1,
	`estimatedRetrofitCost` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regulatoryForecasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`forecastType` varchar(100) NOT NULL,
	`impactDescription` text,
	`affectedYear` int,
	`likelihood` enum('low','medium','high','certain') DEFAULT 'medium',
	`estimatedImpactCost` int,
	`willBecomeLettable` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `regulatoryForecasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `auditLogs` ADD CONSTRAINT `auditLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `capexItems` ADD CONSTRAINT `capexItems_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complianceViolations` ADD CONSTRAINT `complianceViolations_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complianceViolations` ADD CONSTRAINT `complianceViolations_requirementId_complianceRequirements_id_fk` FOREIGN KEY (`requirementId`) REFERENCES `complianceRequirements`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `properties` ADD CONSTRAINT `properties_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `regulatoryForecasts` ADD CONSTRAINT `regulatoryForecasts_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE cascade ON UPDATE no action;