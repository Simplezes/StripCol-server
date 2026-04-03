CREATE TABLE `clearance_logs` (
	`callsign` text PRIMARY KEY NOT NULL,
	`status` integer NOT NULL,
	`expires_at` integer NOT NULL
);

CREATE TABLE `squawk_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` integer NOT NULL
);
