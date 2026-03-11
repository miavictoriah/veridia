ALTER TABLE `properties` ADD `floodRiskZone` varchar(50);--> statement-breakpoint
ALTER TABLE `properties` ADD `floodRiskLevel` varchar(20);--> statement-breakpoint
ALTER TABLE `properties` ADD `floodRiskSource` varchar(100);--> statement-breakpoint
ALTER TABLE `properties` ADD `floodRiskLastChecked` timestamp;--> statement-breakpoint
ALTER TABLE `properties` ADD `landRegistryTitle` varchar(50);--> statement-breakpoint
ALTER TABLE `properties` ADD `tenureType` varchar(30);--> statement-breakpoint
ALTER TABLE `properties` ADD `registeredOwner` varchar(255);--> statement-breakpoint
ALTER TABLE `properties` ADD `lastSalePrice` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `lastSaleDate` varchar(20);--> statement-breakpoint
ALTER TABLE `properties` ADD `planningZone` varchar(100);--> statement-breakpoint
ALTER TABLE `properties` ADD `nearbyPlanningApps` int;--> statement-breakpoint
ALTER TABLE `properties` ADD `planningConstraints` text;--> statement-breakpoint
ALTER TABLE `properties` ADD `localAuthority` varchar(100);