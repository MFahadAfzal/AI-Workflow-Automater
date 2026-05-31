require('dotenv').config({ path: '../../.env' })
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


exports.main = async(prompt) => {
    const chatCompletion = await getGroqChatCompletion(prompt);
    console.log(chatCompletion.choices[0]?.message?.content || "");
}


async function getGroqChatCompletion(message) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    model: "openai/gpt-oss-20b",
  });
}

