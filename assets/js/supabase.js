
// =========================
// KLEM & KEYS - SUPABASE CLIENT
// =========================

// Config
const SUPABASE_URL = 'https://niughlwzhnthrlktvpnv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdWdobHd6aG50aHJsa3R2cG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODcwMTEsImV4cCI6MjA4MjQ2MzAxMX0.MbNWCVUv8ycYdNzjgTUzw5jgDKenvDer2uPCAFbPjrs';

// Initialize Client
// Assumes @supabase/supabase-js is loaded via CDN in HTML
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Export for use in other scripts
window.supabaseClient = _supabase;

console.log('Supabase Client Initialized');
