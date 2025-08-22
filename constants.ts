import type { ChatMessage } from './types';
import { MessageType } from './types';

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    author: 'ai',
    type: MessageType.TEXT,
    content: "Welcome! I'm your AI development partner. Describe the app you want to build, and I'll generate the architecture, code, and UI previews for you.",
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }
];

export const MOCK_SUGGESTION_PROMPT_CONTEXT = {
  appName: "Planto API",
  architecture: {
    microservices: [
      { id: "svc_users", name: "User Service" },
      { id: "svc_products", name: "Product Catalog Service" },
      { id: "svc_orders", name: "Order Service" },
    ],
  },
  metrics: [
    { serviceId: "svc_users", metric: "CPU Usage", value: "85%", trend: "increasing" },
    { serviceId: "svc_products", metric: "Latency", value: "350ms", trend: "increasing" },
    { serviceId: "svc_orders", metric: "Traffic", value: "500 req/min", trend: "stable" },
    { serviceId: "global", metric: "New Signups", value: "30 per hour", trend: "increasing" }
  ]
};
