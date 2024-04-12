-- Seed for Users
INSERT INTO users (username, password, first_name, last_name, email, phone_number)
VALUES 
('jdoe', '$2b$12$examplehash1', 'John', 'Doe', 'jdoe@example.com', '1234567890'),
('asmith', '$2b$12$examplehash2', 'Anna', 'Smith', 'asmith@example.com', '2345678901');

-- Seed for Sounds
INSERT INTO sounds (sound_id, user_id, file_path, description)
VALUES 
('sound1', 'jdoe', '/path/to/sound1.mp3', 'Morning Alarm'),
('sound2', 'asmith', '/path/to/sound2.mp3', 'Notification Ping');

-- Seed for Categories
INSERT INTO categories (category_id, user_id, category_name)
VALUES 
( 'Daily Tasks','jdoe'),
( 'in a week', 'asmith');

-- Seed for Messages
INSERT INTO messages (message_id, user_id, content, message_type, created_on)
VALUES 
('meds', 'jdoe', 'Don''t forget to take meds!', 'daily reminder', '2024-03-21T08:00:00Z'),
('emails', 'asmith', 'email them please', 'hourly alarm', '2024-03-21T09:00:00Z');

-- Seed for Notifications
INSERT INTO notifications (method_type, custom_message_id)
VALUES 
('Email', 'meds'),
('alarm', 'emails');

-- The reminders and dismissals tables rely on IDs from the previous tables. 
-- Please ensure that you are using the correct IDs as per your actual data.

-- Seed for Reminders
INSERT INTO reminders (user_id, title, message, sound_id, category_id, notification_id, date_time_scheduled, repeat_pattern, is_active)
VALUES 
('jdoe', 'medication', 'meds', 'sound1', 'Daily Tasks', 1, '2024-03-22T09:00:00Z', 'None', TRUE),
('asmith', 'send emails', 'emails', 'sound2', 'in a week', 2, '2024-03-22T10:00:00Z', 'Daily', TRUE);

-- Seed for Dismissals
INSERT INTO dismissals (reminder_id, stop_type)
VALUES 
(1, 'Swipe'),
(2, 'Button Press');