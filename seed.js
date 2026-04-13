const mysql = require('mysql2/promise');

async function seed() {
  const dbUrl = process.env.DATABASE_URL || 'mysql://avnadmin:AVNS_cH993uJXj18aZK3KZj4@mysql-23b8d199-sitizahrah256-366a.e.aivencloud.com:25717/defaultdb';
  const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  
  if (!urlMatch) {
    console.error('Invalid DATABASE_URL');
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host: urlMatch[3],
    port: parseInt(urlMatch[4]),
    user: urlMatch[1],
    password: urlMatch[2],
    database: urlMatch[5],
  });

  // Create TicketTypes
  const tickets = [
    { id: 'tkt_reguler', name: 'Reguler', description: 'Tiket masuk reguler NicePlayland', price: 150000 },
    { id: 'tkt_express', name: 'Express', description: 'Tiket masuk dengan akses fast track', price: 250000 },
    { id: 'tkt_vip', name: 'VIP', description: 'Tiket VIP dengan fasilitas lengkap', price: 500000 },
    { id: 'tkt_annual', name: 'Annual Pass', description: 'Tiket tahunan unlimited masuk', price: 1500000 },
  ];

  for (const t of tickets) {
    try {
      await conn.execute(
        'INSERT INTO TicketType (id, name, description, price, isActive) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
        [t.id, t.name, t.description, t.price, true]
      );
      console.log(`Created/Updated: ${t.name}`);
    } catch (e) {
      console.error(`Error creating ${t.name}:`, e.message);
    }
  }

  // Create test user
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('admin123', salt);
  
  try {
    await conn.execute(
      'INSERT INTO User (id, email, passwordHash, name, phone, role) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
      ['user_admin', 'admin@niceplayland.com', hash, 'Admin NicePlayland', '081234567890', 'admin']
    );
    console.log('Created admin user: admin@niceplayland.com / admin123');
  } catch (e) {
    console.error('Error creating admin:', e.message);
  }

  conn.end();
  console.log('Done!');
}

seed();
