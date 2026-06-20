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
    max_completion_tokens: 1024,
    reasoning_effort: "low",
    include_reasoning: false,
    stream: true,
  });

}

// Sends a chat completion request to Mistral's API
const mistralChat = async(message) => {
    return mistral.chat.stream({
        model: 'mistral-large-latest',
        messages: [
          { role: 'user', content: message }
        ],
        max_completion_tokens: 1024,
      });
  }


// Routes the node to the correct AI provider based on node type
// Combines all of this node's collected inputs into a single message before sending
exports.aiChat = async(node, inputs, ws) => {
  const values = Object.values(inputs[node.id]).join('\n')
  let fullText = ""
  if (node.type === 'groq'){
    try {
      ws.send(JSON.stringify({ type: "node_started", nodeId: node.id }))
      for await (const chunk of await groqChat(values)) {

        const token = chunk.choices[0]?.delta?.content || ""
        fullText += token
        if (ws) {
          ws.send(JSON.stringify({ type: "groq", nodeId: node.id, content: token }))
        }
      }
    } catch (err) {
        ws.send(JSON.stringify({ type: "node_aborted", nodeId: node.id }))
        console.error("Groq streaming error:", err)
        return fullText
    }
  }else if (node.type === 'mistral'){
    try {
      ws.send(JSON.stringify({ type: "node_started", nodeId: node.id }))
      for await (const chunk of await mistralChat(values)) {
        const token = chunk.data.choices[0]?.delta?.content || ""
        fullText += token
        if (ws) {
          ws.send(JSON.stringify({ type: "mistral", nodeId: node.id, content: token }))
        }
      }
      
    } catch (err) {
        ws.send(JSON.stringify({ type: "node_aborted", nodeId: node.id }))
        console.error("Mistral streaming error:", err)
        return fullText
    }
  }
  ws.send(JSON.stringify({ type: "node_complete", nodeId: node.id }))
  return fullText
}



