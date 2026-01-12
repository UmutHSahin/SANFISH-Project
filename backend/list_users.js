
require('dotenv').config();
require('./Models/db');
const User = require('./Models/User');

const checkUsers = async () => {
    try {
        console.log('Connecting to DB...');
        // allow db connection to establish
        await new Promise(resolve => setTimeout(resolve, 2000));

        const users = await User.find({});
        console.log('Found Users:', users.length);

        users.forEach(u => {
            console.log(`Email: ${u.mail}, Role: ${u.role}, ID: ${u._id}`);
        });

        if (users.length === 0) {
            console.log('No users found.');
        }

    } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        process.exit();
    }
};

checkUsers();
