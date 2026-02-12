// server/seeder.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const fs = require('fs'); // <-- Iski ab zaroorat nahi hai
const Product = require('./models/Product');

// Load environment variables
dotenv.config();

// Read products data from JS file (Naya Tareeka)
const products = require('./data/products');

// Purana tareeka (JSON wala) - Jo humne hata diya:
// const products = JSON.parse(
//    fs.readFileSync(`${__dirname}/data/products.json`, 'utf-8')
// );

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Import data into database
const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Product.deleteMany();
        console.log('🗑️  Existing data cleared...');

        // Insert new data
        await Product.insertMany(products);
        console.log('✅ Rich Data Imported Successfully!');
        console.log(`   📦 ${products.length} products added to database.`);

        process.exit(0);
    } catch (error) {
        console.error(`❌ Error importing data: ${error.message}`);
        process.exit(1);
    }
};

// Destroy all data from database
const destroyData = async () => {
    try {
        await connectDB();

        await Product.deleteMany();
        console.log('🛑 Data Destroyed!');
        console.log('   All products removed from database.');

        process.exit(0);
    } catch (error) {
        console.error(`❌ Error destroying data: ${error.message}`);
        process.exit(1);
    }
};

// Handle command line arguments
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}