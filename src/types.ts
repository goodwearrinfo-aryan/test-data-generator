export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string;
  role: 'admin' | 'user' | 'moderator' | 'guest';
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  metadata: Record<string, any>;
}

export interface Event {
  event_id: string;
  user_id: string;
  event_type: string;
  event_name: string;
  properties: Record<string, any>;
  timestamp: string;
  session_id: string;
}

export interface LogEntry {
  log_id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  service: string;
  trace_id: string;
  span_id: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface Organization {
  org_id: string;
  name: string;
  slug: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  owner_id: string;
  member_count: number;
  created_at: string;
  settings: Record<string, any>;
}
