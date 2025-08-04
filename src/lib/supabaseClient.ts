import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pdmnbqhfnoyxplnqzdwr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkbW5icWhmbm95eHBsbnF6ZHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDc0MzMsImV4cCI6MjA2OTg4MzQzM30.9ff2T8MjNIZ3mdnD3WHucP6y_p9_Ie_222wMlnhO-8Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);