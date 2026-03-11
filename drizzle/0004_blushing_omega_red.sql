ALTER TABLE `properties` ADD `units` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `properties` ADD `ownershipType` varchar(50) DEFAULT 'owned';--> statement-breakpoint
ALTER TABLE `properties` ADD `storeys` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `epcDate` varchar(20);--> statement-breakpoint
ALTER TABLE `properties` ADD `epcExpiry` varchar(20);--> statement-breakpoint
ALTER TABLE `properties` ADD `epcCertificateNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `properties` ADD `energyCostsAnnual` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `co2Emissions` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `epcRecommendations` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `riskBand` varchar(20) DEFAULT 'low';--> statement-breakpoint
ALTER TABLE `properties` ADD `meesCompliant` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `properties` ADD `buildingSafetyAct` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `properties` ADD `forecast6m` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `forecast12m` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `forecast24m` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `yearsToDeadline` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `capexPriority` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `estimatedPaybackYears` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `epcDataSource` varchar(50) DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE `properties` ADD `lastEpcLookup` timestamp;