const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT, // Pastikan menggunakan PORT MySQL (61002)
        dialect: 'mysql',
        logging: console.log, // Hapus atau ubah sesuai kebutuhan
        dialectOptions: {
            connectTimeout: 60000, // Timeout lebih lama
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Cek koneksi
sequelize.authenticate()
    .then(() => console.log('✅ Database connected!'))
    .catch(err => console.error('❌ Database connection error:', err));

module.exports = sequelize;
