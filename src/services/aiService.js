const { GoogleGenAI } = require('@google/genai');

let genAI;
try {
    // Common instantiation for newer SDKs
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
    console.log("Could not initialize Gemini AI instance. Make sure API key is set.", e);
}

const generateReply = async (emailContext, tone) => {
    try {
        if (!genAI) {
            throw new Error("Gemini AI not initialized correctly.");
        }

        const prompt = `
      You are an intelligent email assistant for a company.
      Read the following incoming email from ${emailContext.senderName} regarding "${emailContext.subject}".
      
      Email Content:
      ${emailContext.body}
      
      Write a reply to the user. 
      The tone MUST be: ${tone}.
      Do not include placeholder brackets like [Your Name]. Just output the pure reply text.
    `;

        const result = await genAI.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });

        return result.text;
    } catch (error) {
        console.error('Error generating AI reply:', error);
        throw new Error('Failed to generate AI reply');
    }
};

module.exports = {
    generateReply
};
