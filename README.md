# AI-Workflow-Automater
Depoyed URL: https://ai-workflow-automater-1.onrender.com/

Please wait 30 second after first clicking sign in as I am using a render to deploy my website and it takes 30-60 seconds to start the server

Demo Account Email: guest@guest.com
Demo Account Password: guest

A visual, drag-and-drop workflow builder for chaining and executing AI-powered tasks. Design workflows as a graph of connected nodes, then run them with real-time streaming output, safe concurrent execution, and automatic dependency resolution.

Features


Visual canvas — Build workflows by dragging and connecting nodes on a React Flow canvas.
DAG execution engine — Workflows are modeled as directed acyclic graphs. Execution order is resolved with Kahn's algorithm (topological sort), with automatic cycle detection to catch invalid workflows before they run.
Parallel execution — Independent branches of a workflow execute concurrently rather than strictly sequentially.
Live streaming output — Node outputs stream in real time over WebSockets, powered by Groq and Mistral APIs.
Per-user connection tracking — WebSocket connections are tracked per user, with race-condition-safe state management for concurrent sessions.
Node status events — Each node emits started, complete, and aborted events so the UI reflects live execution state.
Authentication — JWT-based auth with middleware-enforced route protection.
Persistence — Workflow state is persisted client-side via localStorage.


Tech Stack


Frontend: React, React Flow
Backend: Node.js, Express
Real-time: WebSockets
Auth: JWT
AI Providers: Groq, Mistral (streaming completions)
Database: Supabase
Deployment: Render


Getting Started

Prerequisites


Node.js (v18+ recommended)
npm or yarn
A PostgreSQL database (Supabase recommended)
API keys for Groq and Mistral


Installation


Clone the repository:


bash   git clone https://github.com/MFahadAfzal/AI-Workflow-Automater.git
   cd AI-Workflow-Automater


Install dependencies for both client and server:


bash   cd client
   npm install
   cd ../server
   npm install


Create a .env file in the server directory with the following variables:


env   PORT=3000
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   GROQ_API_KEY=your_groq_api_key
   MISTRAL_API_KEY=your_mistral_api_key


Run the backend server:


bash   cd server
   npm start


Run the frontend (in a separate terminal):


bash   cd client
   npm run dev


Open http://localhost:5173 in your browser.


How It Works


Build a workflow by dragging nodes onto the canvas and connecting them.
On execution, the engine topologically sorts the node graph using Kahn's algorithm, validating that no cycles exist.
Independent nodes execute in parallel; dependent nodes wait for their upstream nodes to complete.
Each node's output streams back over a WebSocket connection scoped to the current user's session.
Node status updates (started, complete, aborted) update the canvas in real time.
