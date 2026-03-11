CREATE TABLE `earlyAccess` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`workEmail` varchar(320) NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`role` varchar(50) NOT NULL,
	`portfolioSize` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `earlyAccess_id` PRIMARY KEY(`id`)
);
