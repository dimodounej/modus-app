import { supabase } from './supabase';
import type { FeedItem, Lead, Visit } from '../types';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'https://meridian-red-eight.vercel.app';

/** Get the session access token for authenticated API calls to the Next.js backend. */
async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Authenticated fetch to the Meridian Next.js API. */
async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getToken();
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
}

// ── Feed ──────────────────────────────────────────────────────────────────────

export async function fetchFeed(): Promise<FeedItem[]> {
  const res = await apiFetch('/api/modus/feed');
  if (!res.ok) return [];
  const data = await res.json() as { items?: FeedItem[] };
  return data.items ?? [];
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function fetchLeads(orgId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('id, email, first_name, last_name, company, status, score, created_at, source')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return [];
  return (data ?? []) as Lead[];
}

export async function fetchLeadVisits(leadId: string): Promise<Visit[]> {
  const res = await apiFetch(`/api/leads/${leadId}/visits`);
  if (!res.ok) return [];
  const data = await res.json() as { visits?: Visit[] };
  return data.visits ?? [];
}

export async function saveLead(leadId: string, patch: Partial<Lead>): Promise<boolean> {
  const res = await apiFetch(`/api/leads/${leadId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return res.ok;
}

export async function runConversionAgent(leadId: string): Promise<boolean> {
  const res = await apiFetch('/api/agents/conversion', {
    method: 'POST',
    body: JSON.stringify({ leadId, context: '' }),
  });
  return res.ok;
}

// ── Org context ───────────────────────────────────────────────────────────────

export async function getOrgId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('org_id, organization_id')
    .eq('id', user.id)
    .maybeSingle();

  return data?.org_id ?? data?.organization_id ?? null;
}
