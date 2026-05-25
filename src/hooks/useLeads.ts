import { useState, useCallback } from 'react';
import { fetchLeads, getOrgId } from '../lib/api';
import type { Lead } from '../types';

export function useLeads() {
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const oid = await getOrgId();
      setOrgId(oid);
      if (oid) {
        const data = await fetchLeads(oid);
        setLeads(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLead = useCallback((id: string, patch: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  return { leads, loading, orgId, load, updateLead };
}
