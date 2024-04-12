CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  phone_number  TEXT NOT NULL
    CHECK (phone_number ~ '^[0-9]{10}$')
);

CREATE TABLE reminders (
	reminder_id SERIAL PRIMARY KEY,
	user_id VARCHAR(25)
		REFERENCES users ON DELETE CASCADE,
	title VARCHAR(50),
	message_id VARCHAR(25)
		REFERENCES messages ON DELETE CASCADE,
	sound_id VARCHAR(25) NOT NULL 
		REFERENCES sounds ON DELETE CASCADE,
	category_id VARCHAR(50) NOT NULL 
		REFERENCES categories ON DELETE CASCADE,
	notification_id INTEGER NOT NULL
		REFERENCES notifications ON DELETE CASCADE,
	date_time_scheduled TIMESTAMP WITH TIME ZONE NOT NULL,
	repeat_pattern VARCHAR(50) NOT NULL,
	snooze_duration INT DEFAULT 15,
	is_active BOOLEAN NOT NULL
);

CREATE TABLE Reminder_Settings (
    setting_id SERIAL PRIMARY KEY,
    reminder_id INT,
		REFERENCES Reminders ON DELETE CASCADE,
    sound VARCHAR(255),
    notification_type VARCHAR(255),
    dismiss_action VARCHAR(255),
);


CREATE TABLE notifications (
	notification_id SERIAL PRIMARY KEY,
	method_type VARCHAR(50) NOT NULL,
	
);

CREATE TABLE reminder_notifications (
    reminder_notification_id SERIAL PRIMARY KEY,
    reminder_id INTEGER NOT NULL,
		REFERENCES reminders ON DELETE CASCADE,
    notification_id INTEGER NOT NULL,
		REFERENCES notifications ON DELETE CASCADE,
    notification_time TIMESTAMP WITH TIME ZONE NOT NULL,
    custom_message_id VARCHAR(25) 
		REFERENCES messages ON DELETE CASCADE
);


CREATE TABLE sounds (
	sound_id SERIAL PRIMARY KEY,
	user_id VARCHAR(25)  
		REFERENCES users ON DELETE CASCADE,
	file_path TEXT NOT NULL,
	is_default BOOLEAN DEFAULT TRUE,
	description VARCHAR(50) NOT NULL
);

CREATE TABLE categories (
	category_id VARCHAR(50) PRIMARY KEY,
	user_id VARCHAR(25) NOT NULL 
		REFERENCES users ON DELETE CASCADE,
	default_sound VARCHAR(255),
	default_notification_type VARCHAR(255)

);

CREATE TABLE dismissals (
	dismissal_id SERIAL PRIMARY KEY,
	reminder_id INTEGER NOT NULL 
		REFERENCES reminders ON DELETE CASCADE,
	stop_type VARCHAR(50) NOT NULL
);

CREATE TABLE messages (
	message_id VARCHAR(25) PRIMARY KEY,
	user_id VARCHAR(25) NOT NULL
		REFERENCES users ON DELETE CASCADE,
	content TEXT NOT NULL,
	message_type VARCHAR(255) NOT NULL,
	created_on TIMESTAMP WITH TIME ZONE
);

