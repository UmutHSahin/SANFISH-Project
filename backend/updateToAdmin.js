const mongoose = require('mongoose');
const UserModel = require('./Models/User');
require('dotenv').config();

async function updateToAdmin(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_CONN);
    console.log('✅ Connected to MongoDB\n');

    // Find and update the user
    const user = await UserModel.findOneAndUpdate(
      { mail: email },
      { $set: { role: 'admin' } },
      { new: true }
    );
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found in database`);
      console.log('\n💡 Make sure the user exists first (signup via Postman or the app).');
      process.exit(1);
    }

    console.log('✅ User updated successfully!\n');
    console.log('📧 User Details:');
    console.log('================');
    console.log(`Email: ${user.mail}`);
    console.log(`Name: ${user.first_name} ${user.last_name}`);
    console.log(`Role: ${user.role} ✅`);
    console.log(`Active: ${user.is_active}`);
    
    console.log('\n🎉 This user is now an admin!');
    console.log('📱 Try logging in with these credentials:');
    console.log(`   Email: ${user.mail}`);
    console.log(`   You should be redirected to /admin`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('\nUsage:');
  console.log('  node updateToAdmin.js admin@example.com');
  process.exit(1);
}

console.log(`🔄 Updating user to admin: ${email}\n`);
updateToAdmin(email);

