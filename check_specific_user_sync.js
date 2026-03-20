const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const Email = require('./src/models/Email');

const googleId = '101632357606798212918';

async function checkSyncStatus() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ googleId });
        if (!user) {
            console.log(`User with googleId ${googleId} not found.`);
            process.exit(0);
        }

        console.log('--- User Status ---');
        console.log(`Email: ${user.email}`);
        console.log(`Last History ID: ${user.lastHistoryId}`);
        console.log(`Initial Sync: ${user.isInitialSync ? 'Complete' : 'Pending'}`);
        console.log(`Last Sync At: ${user.lastSyncAt}`);
        console.log(`Sync Frequency: ${user.syncFrequency || 'default'}`);

        const emailCount = await Email.countDocuments({ googleId });
        console.log(`--- Email Stats ---`);
        console.log(`Total Emails Synced: ${emailCount}`);

        if (emailCount > 0) {
            const latestEmail = await Email.findOne({ googleId }).sort({ date: -1 });
            console.log(`Latest Email Date: ${latestEmail.date}`);
            console.log(`Latest Email Subject: ${latestEmail.subject}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSyncStatus();
