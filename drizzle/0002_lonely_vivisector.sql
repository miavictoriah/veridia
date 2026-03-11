CREATE TABLE `complianceTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`requirementId` int,
	`taskName` varchar(255) NOT NULL,
	`description` text,
	`dueDate` timestamp NOT NULL,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('pending','in_progress','completed','overdue') DEFAULT 'pending',
	`isOnCriticalPath` int DEFAULT 0,
	`dependsOnTaskId` int,
	`completedDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `complianceTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketBenchmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`region` varchar(100) NOT NULL,
	`propertyType` varchar(50) NOT NULL,
	`averageEpcRating` varchar(1),
	`complianceRate` int,
	`averageRetrofitCost` int,
	`averageCapexPerProperty` int,
	`medianRiskScore` int,
	`nonLettablePercentage` int,
	`dataPoints` int,
	`lastUpdated` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketBenchmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictiveMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`aiRiskScore` int,
	`predictedNonLettableDate` timestamp,
	`retrofitUrgency` enum('low','medium','high','critical') DEFAULT 'medium',
	`recommendedRetrofitYear` int,
	`estimatedComplianceCost` int,
	`riskTrend` varchar(20),
	`lastCalculated` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `predictiveMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`scenarioType` varchar(100) NOT NULL,
	`parameters` text,
	`results` text,
	`affectedPropertiesCount` int,
	`estimatedTotalCost` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scenarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenantCommunications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`communicationType` varchar(100) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`content` text,
	`templateName` varchar(100),
	`recipientCount` int,
	`sentDate` timestamp,
	`status` enum('draft','sent','scheduled') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenantCommunications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `complianceTasks` ADD CONSTRAINT `complianceTasks_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `complianceTasks` ADD CONSTRAINT `complianceTasks_requirementId_complianceRequirements_id_fk` FOREIGN KEY (`requirementId`) REFERENCES `complianceRequirements`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `predictiveMetrics` ADD CONSTRAINT `predictiveMetrics_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scenarios` ADD CONSTRAINT `scenarios_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tenantCommunications` ADD CONSTRAINT `tenantCommunications_propertyId_properties_id_fk` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE cascade ON UPDATE no action;