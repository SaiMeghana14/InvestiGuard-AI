// ============================================================
// InvestiGuard AI — Supabase Client
// ============================================================
// Supabase is not connected (hackathon environment). This
// module provides a stub that mirrors the Supabase interface
// using in-memory storage and the agent runner for real-time
// simulation.
// ============================================================

import { createClient } from '@supabase/supabase-js';

// Stub config — Supabase not connected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getCases() {
  // Return demo data from the in-memory store
  const { getAllDemoCases } = await import('./demoData');
  return getAllDemoCases();
}

export async function getCaseById(id: string) {
  const { getAllDemoCases } = await import('./demoData');
  return getAllDemoCases().find((c) => c.id === id) || null;
}