const mongoose = require('mongoose');
const UserModel = require('./Models/User');
require('dotenv').config();

async function checkAdminUser(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_CONN);
    console.log('✅ Connected to MongoDB\n');

    // Find the user
    const user = await UserModel.findOne({ mail: email });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found in database`);
      console.log('\n💡 Make sure you created the user via signup first.');
      process.exit(1);
    }

    console.log('📧 User Details:');
    console.log('================');
    console.log(`Email: ${user.mail}`);
    console.log(`Name: ${user.first_name} ${user.last_name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.is_active}`);
    console.log(`Created: ${user.createdAt}`);
    
    if (user.role === 'admin') {
      console.log('\n✅ This user IS an admin - they should be redirected to /admin on login');
    } else {
      console.log(`\n⚠️  This user is NOT an admin (role: ${user.role})`);
      console.log('To make this user an admin, run:');
      console.log(`node updateToAdmin.js ${email}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2] || 'admin@example.com';
console.log(`🔍 Checking user: ${email}\n`);
checkAdminUser(email);

