const axios = require('axios');

async function testGetEmails() {
    try {
        const googleId = '101632357606798212918';
        console.log(`Calling /api/gmail/emails for googleId: ${googleId}`);
        const response = await axios.get(`http://localhost:5000/api/gmail/emails`, {
            params: { googleId },
            headers: { 'x-google-id': googleId }
        });
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testGetEmails();
