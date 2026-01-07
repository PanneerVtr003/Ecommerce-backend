// test-mongo.js
const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect('mongodb://localhost:27017/test_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB is running and accessible');
    
    // List databases
    const dbs = await mongoose.connection.db.admin().listDatabases();
    console.log('Available databases:');
    dbs.databases.forEach(db => {
      console.log(`  - ${db.name}`);
    });
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure MongoDB is installed');
    console.log('2. Start MongoDB: mongod --dbpath="C:\\data\\db"');
    console.log('3. Check if port 27017 is not blocked');
  }
}

testConnection();