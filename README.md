# Chat with JSON

A web application that lets you chat with your JSON files using natural language, powered by OpenAI's GPT-4.

**Live Demo:** [chat-with-json.nivekithan.com](https://chat-with-json.nivekithan.com)

## Features

- **Natural Language Queries**: Ask questions about your JSON data in plain English
- **AI-Powered Analysis**: Uses GPT-4 to understand and analyze your JSON structure
- **JavaScript Execution**: Automatically generates and executes JavaScript code to extract, modify, and generate data from your JSON
- **Schema Generation**: Automatically generates JSON schema from your uploaded file for better context understanding
- **Real-time Chat Interface**: Interactive chat UI with streaming responses
- **Client-Side Processing**: Your OpenAI API key and JSON data stay in your browser

## How It Works

1. **Upload**: Select a JSON file from your computer
2. **Configure**: Enter your OpenAI API key (stored locally in your browser)
3. **Chat**: Ask questions about your data in natural language

The AI assistant will:
- Analyze your JSON structure using auto-generated schemas
- Write JavaScript code to query and transform your data
- Execute the code safely in the browser
- Explain the results in human-friendly language

## Tech Stack

- **Framework**: [Remix](https://remix.run/) with Cloudflare Pages deployment
- **AI/ML**:
  - [Vercel AI SDK](https://sdk.vercel.ai/) for AI interactions
  - [OpenAI GPT-4](https://openai.com/) for natural language processing
- **Schema Generation**: [json_typegen_wasm](https://github.com/evestera/json_typegen) for automatic JSON schema generation
- **UI Components**:
  - [Radix UI](https://www.radix-ui.com/) primitives
  - [Tailwind CSS](https://tailwindcss.com/) for styling
  - [shadcn/ui](https://ui.shadcn.com/) components
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm (recommended) or npm
- An OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/chat-with-json.git
cd chat-with-json

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the application
pnpm build

# Preview the production build locally
pnpm start

# Deploy to Cloudflare Pages
pnpm deploy
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Preview production build locally (with Wrangler)
- `pnpm deploy` - Deploy to Cloudflare Pages
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm typegen` - Generate types for Cloudflare bindings

## Usage Example

Upload a JSON file like:

```json
{
  "users": [
    { "name": "Alice", "age": 30, "city": "New York" },
    { "name": "Bob", "age": 25, "city": "San Francisco" },
    { "name": "Charlie", "age": 35, "city": "New York" }
  ]
}
```

Then ask questions like:
- "How many users are from New York?"
- "What's the average age of all users?"
- "List all unique cities"
- "Find users older than 28"

The AI will generate appropriate JavaScript code, execute it, and explain the results.

## Architecture

### Key Components

- **`app/routes/_index.tsx`**: Main application route with file upload and chat interface
- **`app/lib/chatWithJson.ts`**: Core chat logic and OpenAI integration with tool execution
- **`app/lib/generateJsonSchema.ts`**: JSON schema generation using WASM
- **`functions/[[path]].ts`**: Cloudflare Pages function handler for Remix

### How Data Flows

1. User uploads JSON file and provides OpenAI API key
2. JSON schema is generated client-side using WebAssembly
3. User sends a query via chat
4. AI receives the query with JSON schema context
5. AI generates JavaScript code to answer the query
6. Code executes in browser with access to JSON data via `__jsonData` variable
7. Results are stored in `__result` and displayed in the chat

### Tool System

The application uses the Vercel AI SDK's tool system with a custom `js_executator` tool that:
- Accepts JavaScript code as input
- Provides access to the JSON data via `__jsonData` variable
- Executes the code in a Function constructor
- Returns the result stored in `__result` variable
- Handles errors gracefully with user-friendly messages

## Privacy & Security

- **Your API Key**: Stored only in your browser's localStorage, never sent to any server except OpenAI
- **Your Data**: Processed entirely client-side; your JSON file never leaves your browser
- **Code Execution**: JavaScript code runs in an isolated environment in your browser via Function constructor
