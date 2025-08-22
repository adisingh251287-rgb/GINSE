export enum MessageType {
  TEXT = 'TEXT',
  SUGGESTION = 'SUGGESTION',
  ARCHITECTURE = 'ARCHITECTURE',
  CODE = 'CODE',
  REFACTOR_ANALYSIS = 'REFACTOR_ANALYSIS',
  APP_PREVIEW_PROMPT = 'APP_PREVIEW_PROMPT',
}

export type MessageAuthor = 'user' | 'ai';

export interface ChatMessage {
  author: MessageAuthor;
  type: MessageType;
  content: string;
  suggestionContext?: string;
  architecture?: AppArchitecture;
  code?: { [filename: string]: string };
  codeLanguage?: string;
  timestamp: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
}

export interface Microservice {
  id: string;
  name: string;
  description: string;
  apiEndpoints: ApiEndpoint[];
}

export interface DataStore {
  id: string;
  name:string;
  type: 'PostgreSQL' | 'MongoDB' | 'Redis' | 'S3 Bucket' | 'Other';
  schemaDescription: string;
}

export interface AppArchitecture {
  name: string;
  description: string;
  microservices: Microservice[];
  dataStores: DataStore[];
}
