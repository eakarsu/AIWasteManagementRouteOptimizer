import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    // Drop tables
    await client.query(`
      DROP TABLE IF EXISTS alerts CASCADE;
      DROP TABLE IF EXISTS citizen_reports CASCADE;
      DROP TABLE IF EXISTS schedules CASCADE;
      DROP TABLE IF EXISTS bins CASCADE;
      DROP TABLE IF EXISTS collection_routes CASCADE;
      DROP TABLE IF EXISTS vehicles CASCADE;
      DROP TABLE IF EXISTS drivers CASCADE;
      DROP TABLE IF EXISTS zones CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create tables
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE zones (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        area_sqkm DECIMAL(10,2),
        population INT,
        households INT,
        waste_type VARCHAR(100),
        collection_frequency VARCHAR(100),
        priority VARCHAR(50)
      );

      CREATE TABLE drivers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        license_number VARCHAR(50),
        phone VARCHAR(20),
        email VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        experience_years INT,
        rating DECIMAL(3,2),
        assigned_vehicle_id INT
      );

      CREATE TABLE vehicles (
        id SERIAL PRIMARY KEY,
        plate_number VARCHAR(20) NOT NULL,
        type VARCHAR(50),
        capacity_tons DECIMAL(5,2),
        status VARCHAR(50) DEFAULT 'active',
        driver_id INT REFERENCES drivers(id),
        fuel_level INT,
        mileage INT,
        last_maintenance DATE
      );

      CREATE TABLE collection_routes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        zone_id INT REFERENCES zones(id),
        distance_km DECIMAL(10,2),
        estimated_time VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        stops INT,
        optimized BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE bins (
        id SERIAL PRIMARY KEY,
        bin_code VARCHAR(20) NOT NULL,
        location VARCHAR(255),
        zone_id INT REFERENCES zones(id),
        type VARCHAR(50),
        capacity_liters INT,
        fill_level INT DEFAULT 0,
        last_collected TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active',
        lat DECIMAL(10,7),
        lng DECIMAL(10,7)
      );

      CREATE TABLE schedules (
        id SERIAL PRIMARY KEY,
        route_id INT REFERENCES collection_routes(id),
        vehicle_id INT REFERENCES vehicles(id),
        driver_id INT REFERENCES drivers(id),
        day_of_week VARCHAR(20),
        start_time TIME,
        end_time TIME,
        status VARCHAR(50) DEFAULT 'active',
        frequency VARCHAR(50)
      );

      CREATE TABLE citizen_reports (
        id SERIAL PRIMARY KEY,
        citizen_name VARCHAR(255),
        phone VARCHAR(20),
        location VARCHAR(255),
        type VARCHAR(100),
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      );

      CREATE TABLE alerts (
        id SERIAL PRIMARY KEY,
        type VARCHAR(100),
        severity VARCHAR(50),
        message TEXT,
        zone_id INT REFERENCES zones(id),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed users
    const passwordHash = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (email, password_hash, name, role) VALUES
      ('admin@waste.com', $1, 'Admin User', 'admin'),
      ('manager@waste.com', $1, 'Sarah Johnson', 'manager'),
      ('operator@waste.com', $1, 'Mike Chen', 'operator')
    `, [passwordHash]);

    // Seed zones
    await client.query(`
      INSERT INTO zones (name, area_sqkm, population, households, waste_type, collection_frequency, priority) VALUES
      ('Downtown Core', 4.5, 32000, 14500, 'mixed', 'daily', 'high'),
      ('Riverside District', 8.2, 18000, 7200, 'residential', 'twice-weekly', 'medium'),
      ('Industrial Park East', 12.0, 2500, 200, 'industrial', 'weekly', 'high'),
      ('Green Valley Suburbs', 15.3, 24000, 8800, 'residential', 'twice-weekly', 'medium'),
      ('Harbor Front', 3.8, 9500, 4100, 'commercial', 'daily', 'high'),
      ('University Quarter', 5.1, 15000, 3200, 'mixed', 'daily', 'medium'),
      ('Old Town Heritage', 2.9, 6800, 3100, 'residential', 'twice-weekly', 'low'),
      ('Tech Campus North', 7.6, 4200, 1500, 'commercial', 'three-weekly', 'medium'),
      ('Westside Residential', 11.4, 28000, 10200, 'residential', 'twice-weekly', 'high'),
      ('Market Square', 1.8, 3200, 800, 'commercial', 'daily', 'high'),
      ('Lakeview Heights', 9.7, 12000, 5400, 'residential', 'twice-weekly', 'medium'),
      ('Airport Industrial', 14.5, 1800, 100, 'industrial', 'weekly', 'low'),
      ('Central Business District', 3.2, 8500, 2200, 'commercial', 'daily', 'high'),
      ('Northgate Community', 6.8, 16500, 6100, 'residential', 'twice-weekly', 'medium'),
      ('Southpark Gardens', 10.1, 21000, 7800, 'mixed', 'twice-weekly', 'medium')
    `);

    // Seed drivers
    await client.query(`
      INSERT INTO drivers (name, license_number, phone, email, status, experience_years, rating, assigned_vehicle_id) VALUES
      ('James Rodriguez', 'CDL-2019-4521', '555-0101', 'james.r@waste.com', 'active', 8, 4.85, NULL),
      ('Maria Santos', 'CDL-2020-3387', '555-0102', 'maria.s@waste.com', 'active', 6, 4.72, NULL),
      ('David Kim', 'CDL-2018-7764', '555-0103', 'david.k@waste.com', 'active', 10, 4.91, NULL),
      ('Lisa Thompson', 'CDL-2021-1156', '555-0104', 'lisa.t@waste.com', 'active', 4, 4.63, NULL),
      ('Robert Martinez', 'CDL-2017-8893', '555-0105', 'robert.m@waste.com', 'on-leave', 12, 4.88, NULL),
      ('Amy Chen', 'CDL-2022-2241', '555-0106', 'amy.c@waste.com', 'active', 3, 4.55, NULL),
      ('Thomas Brown', 'CDL-2019-6678', '555-0107', 'thomas.b@waste.com', 'active', 7, 4.79, NULL),
      ('Sarah Williams', 'CDL-2020-9934', '555-0108', 'sarah.w@waste.com', 'active', 5, 4.67, NULL),
      ('Kevin Patel', 'CDL-2018-5512', '555-0109', 'kevin.p@waste.com', 'active', 9, 4.83, NULL),
      ('Jennifer Lee', 'CDL-2021-3345', '555-0110', 'jennifer.l@waste.com', 'inactive', 2, 4.41, NULL),
      ('Carlos Garcia', 'CDL-2019-7789', '555-0111', 'carlos.g@waste.com', 'active', 6, 4.74, NULL),
      ('Michelle Davis', 'CDL-2020-1123', '555-0112', 'michelle.d@waste.com', 'active', 5, 4.69, NULL),
      ('Brian Wilson', 'CDL-2017-4456', '555-0113', 'brian.w@waste.com', 'active', 11, 4.92, NULL),
      ('Angela Moore', 'CDL-2022-8890', '555-0114', 'angela.m@waste.com', 'active', 2, 4.38, NULL),
      ('Daniel Taylor', 'CDL-2018-2234', '555-0115', 'daniel.t@waste.com', 'active', 8, 4.81, NULL)
    `);

    // Seed vehicles
    await client.query(`
      INSERT INTO vehicles (plate_number, type, capacity_tons, status, driver_id, fuel_level, mileage, last_maintenance) VALUES
      ('WM-1001', 'rear-loader', 8.5, 'active', 1, 85, 45200, '2026-03-15'),
      ('WM-1002', 'side-loader', 6.0, 'active', 2, 72, 38700, '2026-03-20'),
      ('WM-1003', 'front-loader', 12.0, 'active', 3, 90, 62100, '2026-02-28'),
      ('WM-1004', 'rear-loader', 8.5, 'active', 4, 65, 29400, '2026-03-10'),
      ('WM-1005', 'compactor', 10.0, 'maintenance', NULL, 40, 78500, '2026-04-01'),
      ('WM-1006', 'side-loader', 6.0, 'active', 6, 88, 33600, '2026-03-25'),
      ('WM-1007', 'rear-loader', 8.5, 'active', 7, 55, 51800, '2026-03-05'),
      ('WM-1008', 'recycling-truck', 7.0, 'active', 8, 79, 42300, '2026-03-18'),
      ('WM-1009', 'front-loader', 12.0, 'active', 9, 92, 58900, '2026-02-20'),
      ('WM-1010', 'compactor', 10.0, 'active', 11, 68, 47100, '2026-03-12'),
      ('WM-1011', 'rear-loader', 8.5, 'inactive', NULL, 30, 89200, '2026-01-15'),
      ('WM-1012', 'recycling-truck', 7.0, 'active', 12, 81, 36500, '2026-03-22'),
      ('WM-1013', 'side-loader', 6.0, 'active', 13, 74, 55400, '2026-03-08'),
      ('WM-1014', 'rear-loader', 8.5, 'active', 14, 60, 22100, '2026-03-28'),
      ('WM-1015', 'front-loader', 12.0, 'active', 15, 83, 67800, '2026-02-25')
    `);

    // Update drivers with assigned vehicles
    await client.query(`
      UPDATE drivers SET assigned_vehicle_id = 1 WHERE id = 1;
      UPDATE drivers SET assigned_vehicle_id = 2 WHERE id = 2;
      UPDATE drivers SET assigned_vehicle_id = 3 WHERE id = 3;
      UPDATE drivers SET assigned_vehicle_id = 4 WHERE id = 4;
      UPDATE drivers SET assigned_vehicle_id = 6 WHERE id = 6;
      UPDATE drivers SET assigned_vehicle_id = 7 WHERE id = 7;
      UPDATE drivers SET assigned_vehicle_id = 8 WHERE id = 8;
      UPDATE drivers SET assigned_vehicle_id = 9 WHERE id = 9;
      UPDATE drivers SET assigned_vehicle_id = 10 WHERE id = 11;
      UPDATE drivers SET assigned_vehicle_id = 12 WHERE id = 12;
      UPDATE drivers SET assigned_vehicle_id = 13 WHERE id = 13;
      UPDATE drivers SET assigned_vehicle_id = 14 WHERE id = 14;
      UPDATE drivers SET assigned_vehicle_id = 15 WHERE id = 15;
    `);

    // Seed collection_routes
    await client.query(`
      INSERT INTO collection_routes (name, zone_id, distance_km, estimated_time, status, stops, optimized) VALUES
      ('Downtown Morning Run', 1, 12.5, '3h 30m', 'active', 28, true),
      ('Riverside Tuesday Route', 2, 18.3, '4h 15m', 'active', 22, true),
      ('Industrial Pickup A', 3, 24.7, '5h 00m', 'active', 12, false),
      ('Green Valley Loop', 4, 21.1, '4h 45m', 'active', 35, true),
      ('Harbor Commercial', 5, 8.9, '2h 30m', 'active', 18, true),
      ('University Circuit', 6, 11.2, '3h 00m', 'active', 24, false),
      ('Old Town Heritage Walk', 7, 6.8, '2h 15m', 'active', 15, true),
      ('Tech Park Express', 8, 15.6, '3h 45m', 'active', 10, false),
      ('Westside Full Coverage', 9, 28.4, '6h 00m', 'active', 42, true),
      ('Market Daily Sweep', 10, 4.2, '1h 30m', 'active', 14, true),
      ('Lakeview Residential', 11, 19.8, '4h 30m', 'active', 30, false),
      ('Airport Zone Pickup', 12, 22.3, '4h 00m', 'inactive', 8, false),
      ('CBD Express Route', 13, 7.5, '2h 00m', 'active', 20, true),
      ('Northgate Community Run', 14, 16.9, '4h 00m', 'active', 26, true),
      ('Southpark Mixed Route', 15, 20.5, '4h 30m', 'active', 32, false)
    `);

    // Seed bins
    await client.query(`
      INSERT INTO bins (bin_code, location, zone_id, type, capacity_liters, fill_level, last_collected, status, lat, lng) VALUES
      ('BIN-001', '123 Main Street', 1, 'general', 1100, 82, '2026-04-09 08:30:00', 'active', 40.7128, -74.0060),
      ('BIN-002', '45 River Road', 2, 'recycling', 660, 45, '2026-04-08 10:15:00', 'active', 40.7195, -74.0089),
      ('BIN-003', 'Industrial Ave Block 7', 3, 'industrial', 2200, 91, '2026-04-07 14:00:00', 'needs-collection', 40.7282, -73.9942),
      ('BIN-004', '78 Oak Lane', 4, 'general', 1100, 33, '2026-04-09 09:00:00', 'active', 40.7350, -73.9900),
      ('BIN-005', 'Harbor Pier 4', 5, 'commercial', 1100, 67, '2026-04-09 07:45:00', 'active', 40.6892, -74.0445),
      ('BIN-006', 'Campus Quad North', 6, 'recycling', 660, 55, '2026-04-08 16:30:00', 'active', 40.7290, -73.9965),
      ('BIN-007', '12 Heritage Lane', 7, 'general', 770, 28, '2026-04-09 11:00:00', 'active', 40.7180, -74.0000),
      ('BIN-008', 'Tech Park Building C', 8, 'commercial', 1100, 71, '2026-04-08 13:00:00', 'active', 40.7410, -73.9896),
      ('BIN-009', '234 West Boulevard', 9, 'general', 1100, 88, '2026-04-08 08:00:00', 'needs-collection', 40.7488, -73.9860),
      ('BIN-010', 'Market Square Center', 10, 'organic', 440, 95, '2026-04-09 06:00:00', 'needs-collection', 40.7120, -74.0055),
      ('BIN-011', '56 Lakeview Terrace', 11, 'general', 1100, 40, '2026-04-09 10:30:00', 'active', 40.7550, -73.9750),
      ('BIN-012', 'Airport Road Gate 3', 12, 'industrial', 2200, 62, '2026-04-06 09:00:00', 'active', 40.6413, -73.7781),
      ('BIN-013', 'CBD Tower Plaza', 13, 'commercial', 1100, 78, '2026-04-09 07:00:00', 'active', 40.7580, -73.9855),
      ('BIN-014', '89 Northgate Ave', 14, 'recycling', 660, 52, '2026-04-08 15:00:00', 'active', 40.7650, -73.9700),
      ('BIN-015', 'Southpark Community Center', 15, 'general', 1100, 60, '2026-04-09 09:30:00', 'active', 40.7000, -74.0100)
    `);

    // Seed schedules
    await client.query(`
      INSERT INTO schedules (route_id, vehicle_id, driver_id, day_of_week, start_time, end_time, status, frequency) VALUES
      (1, 1, 1, 'Monday', '06:00', '09:30', 'active', 'daily'),
      (2, 2, 2, 'Tuesday', '07:00', '11:15', 'active', 'twice-weekly'),
      (3, 3, 3, 'Wednesday', '08:00', '13:00', 'active', 'weekly'),
      (4, 4, 4, 'Monday', '06:30', '11:15', 'active', 'twice-weekly'),
      (5, 6, 6, 'Monday', '05:30', '08:00', 'active', 'daily'),
      (6, 7, 7, 'Tuesday', '07:00', '10:00', 'active', 'daily'),
      (7, 8, 8, 'Thursday', '08:00', '10:15', 'active', 'twice-weekly'),
      (8, 9, 9, 'Wednesday', '06:00', '09:45', 'active', 'three-weekly'),
      (9, 10, 11, 'Monday', '05:00', '11:00', 'active', 'twice-weekly'),
      (10, 12, 12, 'Monday', '04:30', '06:00', 'active', 'daily'),
      (11, 13, 13, 'Tuesday', '07:00', '11:30', 'active', 'twice-weekly'),
      (12, 14, 14, 'Friday', '08:00', '12:00', 'inactive', 'weekly'),
      (13, 1, 1, 'Wednesday', '06:00', '08:00', 'active', 'daily'),
      (14, 2, 2, 'Thursday', '07:00', '11:00', 'active', 'twice-weekly'),
      (15, 15, 15, 'Monday', '06:00', '10:30', 'active', 'twice-weekly')
    `);

    // Seed citizen_reports
    await client.query(`
      INSERT INTO citizen_reports (citizen_name, phone, location, type, description, status, priority, created_at, resolved_at) VALUES
      ('John Baker', '555-2001', '123 Main Street', 'overflow', 'Bin overflowing near the bus stop, waste spilling onto sidewalk', 'resolved', 'high', '2026-04-05 09:20:00', '2026-04-05 14:30:00'),
      ('Emily Clark', '555-2002', '45 River Road', 'illegal-dumping', 'Someone dumped old furniture and mattresses by the river path', 'in-progress', 'high', '2026-04-07 11:45:00', NULL),
      ('Mark Stevens', '555-2003', 'Oak Lane Park', 'missed-collection', 'Collection truck did not come on scheduled Tuesday pickup', 'resolved', 'medium', '2026-04-06 16:00:00', '2026-04-07 08:00:00'),
      ('Susan Wright', '555-2004', 'Harbor Pier 2', 'damaged-bin', 'Recycling bin lid broken off, contents getting wet in rain', 'pending', 'medium', '2026-04-08 08:30:00', NULL),
      ('Alex Turner', '555-2005', 'Campus Quad', 'overflow', 'Multiple bins overflowing after weekend campus events', 'in-progress', 'high', '2026-04-07 07:15:00', NULL),
      ('Patricia Gomez', '555-2006', '78 Heritage Lane', 'odor', 'Strong odor from organic waste bin not collected for 5 days', 'resolved', 'medium', '2026-04-04 10:00:00', '2026-04-04 16:45:00'),
      ('Ryan Foster', '555-2007', 'Tech Park Lot B', 'illegal-dumping', 'Construction debris dumped in the parking lot corner', 'pending', 'high', '2026-04-09 13:20:00', NULL),
      ('Diana Lee', '555-2008', '234 West Boulevard', 'missed-collection', 'Recycling not picked up two weeks in a row', 'in-progress', 'medium', '2026-04-08 09:45:00', NULL),
      ('Tom Henderson', '555-2009', 'Market Square', 'overflow', 'All bins around market area full by noon on market day', 'resolved', 'high', '2026-04-03 12:30:00', '2026-04-03 15:00:00'),
      ('Nancy Kim', '555-2010', 'Lakeview Park', 'hazardous', 'Found broken glass and chemical containers in general waste bin', 'in-progress', 'critical', '2026-04-09 07:50:00', NULL),
      ('George Patel', '555-2011', 'Airport Road', 'damaged-bin', 'Industrial bin dented by vehicle, lid won''t close properly', 'pending', 'low', '2026-04-08 14:10:00', NULL),
      ('Carol Martinez', '555-2012', 'CBD Tower Plaza', 'overflow', 'Commercial bins full every evening, need larger or more bins', 'pending', 'medium', '2026-04-09 17:30:00', NULL),
      ('Steve Robinson', '555-2013', '89 Northgate Ave', 'missed-collection', 'Green waste bin skipped on collection day', 'resolved', 'low', '2026-04-06 08:00:00', '2026-04-06 12:30:00'),
      ('Laura White', '555-2014', 'Southpark Center', 'illegal-dumping', 'Electronic waste dumped behind community center', 'in-progress', 'high', '2026-04-08 16:00:00', NULL),
      ('Kevin O''Brien', '555-2015', 'Downtown Core', 'odor', 'Multiple overflowing bins causing hygiene concerns near restaurant row', 'pending', 'high', '2026-04-09 19:00:00', NULL)
    `);

    // Seed alerts
    await client.query(`
      INSERT INTO alerts (type, severity, message, zone_id, is_read, created_at) VALUES
      ('overflow', 'critical', 'Bin BIN-010 at Market Square Center has reached 95% capacity', 10, false, '2026-04-09 06:30:00'),
      ('overflow', 'warning', 'Bin BIN-003 at Industrial Ave Block 7 is at 91% capacity', 3, false, '2026-04-09 07:00:00'),
      ('overflow', 'warning', 'Bin BIN-009 at 234 West Boulevard is at 88% fill level', 9, true, '2026-04-08 15:00:00'),
      ('maintenance', 'info', 'Vehicle WM-1005 scheduled maintenance completed', 1, true, '2026-04-01 10:00:00'),
      ('route-delay', 'warning', 'Downtown Morning Run delayed due to road construction on Main St', 1, false, '2026-04-09 06:45:00'),
      ('illegal-dump', 'critical', 'Illegal dumping reported at River Road — hazardous materials suspected', 2, false, '2026-04-07 12:00:00'),
      ('vehicle', 'warning', 'Vehicle WM-1007 fuel level below 60%, refueling recommended', 7, true, '2026-04-08 14:30:00'),
      ('schedule', 'info', 'Airport Zone Pickup route temporarily suspended pending review', 12, true, '2026-04-05 09:00:00'),
      ('overflow', 'critical', 'Multiple bins in Downtown Core approaching critical levels', 1, false, '2026-04-09 08:15:00'),
      ('weather', 'warning', 'Heavy rain forecast for tomorrow — secure outdoor bins in all zones', NULL, false, '2026-04-09 18:00:00'),
      ('citizen-report', 'info', 'New hazardous waste report submitted for Lakeview Park area', 11, false, '2026-04-09 08:00:00'),
      ('performance', 'info', 'Recycling rate in University Quarter increased 12% this month', 6, true, '2026-04-08 17:00:00'),
      ('maintenance', 'warning', 'Vehicle WM-1011 overdue for maintenance — last service 3 months ago', 9, false, '2026-04-09 09:00:00'),
      ('route-complete', 'info', 'Westside Full Coverage route completed ahead of schedule', 9, true, '2026-04-08 10:30:00'),
      ('capacity', 'warning', 'Zone 10 Market Square needs additional bin capacity for weekend markets', 10, false, '2026-04-09 10:00:00')
    `);

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
