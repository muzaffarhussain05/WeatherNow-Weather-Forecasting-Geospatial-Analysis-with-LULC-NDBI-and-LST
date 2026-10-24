
from sqlalchemy import text
from database import engine


def init_database():
    with engine.begin() as connection:
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS pakistan_cities (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                city_name VARCHAR(150) NOT NULL,
                province VARCHAR(100) DEFAULT NULL,
                latitude DECIMAL(9,6) NOT NULL,
                longitude DECIMAL(9,6) NOT NULL,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                INDEX idx_city_name (city_name),
                INDEX idx_city_latitude (latitude)
            ) ENGINE=InnoDB
        """))

        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS weather_snapshots (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                city_id BIGINT UNSIGNED NOT NULL,
                temperature_c DECIMAL(5,2) DEFAULT NULL,
                relative_humidity DECIMAL(5,2) DEFAULT NULL,
                apparent_temperature_c DECIMAL(5,2) DEFAULT NULL,
                wind_speed_kmh DECIMAL(7,2) DEFAULT NULL,
                observed_at DATETIME DEFAULT NULL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                INDEX idx_weather_city_id (city_id),
                INDEX idx_weather_observed_at (observed_at),
                CONSTRAINT fk_weather_city
                    FOREIGN KEY (city_id)
                    REFERENCES pakistan_cities(id)
            ) ENGINE=InnoDB
        """))

    print("Database tables initialized successfully.")
