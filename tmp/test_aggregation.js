const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Email = require('../src/models/Email');

async function testAggregation() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const googleId = '101632357606798212918'; // Use the ID from test_api.js
        const folder = 'inbox';
        
        console.log(`Running aggregation test for googleId: ${googleId}, folder: ${folder}...`);

        const matchQuery = { googleId };
        if (folder.toLowerCase() !== 'all') {
            matchQuery.folder = folder.toLowerCase();
        }

        const aggregationPipeline = [
            { $match: matchQuery },
            { $sort: { date: -1 } },
            {
                $group: {
                    _id: "$threadId",
                    latestMessage: { $first: "$$ROOT" },
                    msg_count: { $sum: 1 }
                }
            },
            {
                $replaceRoot: {
                    newRoot: { $mergeObjects: ["$latestMessage", { msg_count: "$msg_count" }] }
                }
            },
            { $sort: { date: -1 } },
            { $limit: 10 }
        ];

        const results = await Email.aggregate(aggregationPipeline);

        console.log(`Found ${results.length} unique threads.`);
        results.slice(0, 3).forEach((thread, i) => {
            console.log(`--- Thread ${i + 1} ---`);
            console.log(`Thread ID: ${thread.threadId}`);
            console.log(`Subject: ${thread.subject}`);
            console.log(`Date: ${thread.date}`);
            console.log(`Message Count: ${thread.msg_count}`);
        });

        if (results.some(t => t.msg_count > 1)) {
            console.log('✅ SUCCESS: Found threads with multiple messages!');
        } else {
            console.log('⚠️ INFO: All threads found had only 1 message in this result set.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testAggregation();
