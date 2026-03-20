const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Email = require('../src/models/Email');

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const googleId = '116965741639999419137'; // User's googleId from image/context if possible, or search for most active user
        // Search for user by email if googleId is unknown
        const user = await User.findOne({ email: 'ramanandtomar1234@gmail.com' });
        if (!user) {
            console.log('User ramanandtomar1234@gmail.com not found');
            process.exit(0);
        }
        
        console.log(`Found user: ${user.email}, googleId: ${user.googleId}, orgId: ${user.orgId}`);
        console.log(`User settings: syncPeriod=${user.syncPeriod}, inboxCategories=[${(user.inboxCategories || []).join(', ')}]`);

        const totalCount = await Email.countDocuments({ googleId: user.googleId });
        console.log(`Total emails for ${user.email} (using googleId): ${totalCount}`);

        const orgCounts = await Email.aggregate([
            { $match: { googleId: user.googleId } },
            { $group: { _id: '$orgId', count: { $sum: 1 } } }
        ]);
        console.log('Emails grouped by orgId for this user:');
        orgCounts.forEach(oc => console.log(`  orgId: ${oc._id}, count: ${oc.count}`));

        // Check if there are any newer emails that have DIFFERENT orgId or NO orgId
        const recentEmails = await Email.find({ googleId: user.googleId }).sort({ date: -1 }).limit(20).select('subject date orgId labels');
        console.log('Most recent 20 emails for this user:');
        recentEmails.forEach(re => console.log(`  Subject: ${re.subject}, Date: ${re.date}, labels: [${re.labels.join(', ')}], orgId: ${re.orgId}`));

        const alerts = await Email.find({ subject: /Security alert/i, googleId: user.googleId }).sort({ date: -1 });
        console.log(`Found ${alerts.length} "Security alert" messages:`);
        alerts.forEach(a => console.log(`  Date: ${a.date}, Snippet: ${a.snippet}, orgId: ${a.orgId}`));

        const missingSubjects = ['Security alert', 'Claude', 'Codex'];
        for (const subj of missingSubjects) {
            const found = await Email.findOne({ subject: new RegExp(subj, 'i'), googleId: user.googleId });
            if (found) {
                console.log(`✅ Found "${subj}" in DB, threadId: ${found.threadId}, folder: ${found.folder}, labels: [${found.labels.join(', ')}], orgId: ${found.orgId}`);
            } else {
                console.log(`❌ "${subj}" NOT found in DB for this user`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error checking database:', error);
        process.exit(1);
    }
}

checkDatabase();
