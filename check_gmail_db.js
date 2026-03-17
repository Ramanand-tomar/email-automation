const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Email = require('./src/models/Email');

async function checkDb() {
    try {
        console.log('Connecting to MONGO_URI:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const userCount = await User.countDocuments();
        console.log(`Total users: ${userCount}`);

        const users = await User.find({}, { googleId: 1, email: 1, lastHistoryId: 1 });
        console.log('Users in DB:', JSON.stringify(users, null, 2));

        const emailCount = await Email.countDocuments();
        console.log(`Total emails: ${emailCount}`);

        const googleIds = await Email.distinct('googleId');
        console.log('Unique googleIds in Email collection:', googleIds);

        const targetGoogleId = '101632357606798212918';
        const targetEmails = await Email.countDocuments({ googleId: targetGoogleId });
        console.log(`Emails for googleId ${targetGoogleId}: ${targetEmails}`);

        if (targetEmails > 0) {
            const sampleEmail = await Email.findOne({ googleId: targetGoogleId });
            console.log('Sample email folder:', sampleEmail.folder);
            console.log('Sample email labels:', sampleEmail.labels);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkDb();
