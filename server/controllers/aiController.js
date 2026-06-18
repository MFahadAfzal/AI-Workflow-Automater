require('dotenv').config({ path: '../../.env' })
const Groq = require('groq-sdk')
const {Mistral} = require('@mistralai/mistralai')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Sends a chat completion request to Groq's API
const groqChat = async(message) =>{

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

// Sends a chat completion request to Mistral's API
const mistralChat = async(message) => {
    return mistral.chat.complete({
        model: 'mistral-large-latest',
        messages: [
          { role: 'user', content: message }
        ],
      });
  }

// Routes the node to the correct AI provider based on node type
// Combines all of this node's collected inputs into a single message before sending
exports.aiChat = async(node, inputs) => {
  const values = Object.values(inputs[node.id]).join('\n')
  if (node.type === 'groq'){
    const chatCompletion = await groqChat(values)
    return chatCompletion.choices[0]?.message?.content || ""
  }else if (node.type === 'mistral'){
    const chatCompletion = await mistralChat(values)
    return chatCompletion.choices[0]?.message?.content || ""
  }
}




const getGroqChatCompletion = async(message) => {
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

