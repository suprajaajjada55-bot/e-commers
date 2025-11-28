-- Migration: add payments table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` varchar(36) NOT NULL,
  `order_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `provider` varchar(64) NOT NULL DEFAULT 'razorpay',
  `provider_payment_id` varchar(191),
  `provider_order_id` varchar(191),
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(16) NOT NULL DEFAULT 'INR',
  `status` varchar(64) NOT NULL DEFAULT 'pending',
  `method` varchar(64),
  `payload` json,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_order_id` (`order_id`),
  KEY `idx_payments_user_id` (`user_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
