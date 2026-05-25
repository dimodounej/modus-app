/**
 * Shared types — kept identical to the web app's type definitions.
 * When you update these, update src/app/api/modus/feed/route.ts too.
 */

export type FeedItemType = 'lead' | 'visitor' | 'deal' | 'alert';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  subtitle: string;
  timestamp: string;
  leadId?: string;
  company?: string | null;
  name?: string | null;
  email?: string | null;
  intent_score?: number | null;
  deal_status?: string | null;
  country?: string | null;
  path?: string | null;
}

export interface Lead {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  status: string | null;
  score?: number | null;
  created_at?: string;
  source?: string | null;
}

export interface Visit {
  page_url: string;
  page_title?: string | null;
  created_at: string;
  session_id?: string | null;
}

export interface OrgContext {
  userId: string;
  orgId: string;
}
