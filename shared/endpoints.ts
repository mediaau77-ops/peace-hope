import type { ChatMessage, ChatMessageInput, ContactInput, Livestream, PublicLivestream } from './domain';

export type Endpoints = {
  'GET /api/livestreams/active': { response: PublicLivestream | null };
  'GET /api/livestreams/:id': { params: { id: string }; response: Livestream };
  'POST /api/livestreams/:id/chat': {
    params: { id: string };
    body: ChatMessageInput;
    response: ChatMessage;
  };
  'POST /api/prayer/:id/amen': { params: { id: string }; response: { count: number } };
  'POST /api/contact': { body: ContactInput; response: { id: string } };
};

export type EndpointKey = keyof Endpoints;
export type EndpointResponse<K extends EndpointKey> = Endpoints[K]['response'];
export type EndpointParams<K extends EndpointKey> = Endpoints[K] extends { params: infer P } ? P : never;
export type EndpointBody<K extends EndpointKey> = Endpoints[K] extends { body: infer B } ? B : never;

export type RequestOptions<K extends EndpointKey> = {
  params?: EndpointParams<K>;
  body?: EndpointBody<K>;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};
