require('dotenv').config({ path: '../../.env' })
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


exports.aiChat = async(node, inputs) => {
  const values = Object.values(inputs[node.id]).join('\n')
  if (node.type === 'groq'){
    const chatCompletion = await groqChat(node, values)
    return chatCompletion.choices[0]?.message?.content || ""
  }
}

exports.getGroqChatCompletion = async(message) => {
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

exports.groqChat = async(node, values) =>{

  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: values,
      },
    ],
    model: "openai/gpt-oss-20b",
  });


}
