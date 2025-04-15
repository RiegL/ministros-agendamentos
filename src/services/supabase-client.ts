
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://juahafdtttezrwyinbkz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1YWhhZmR0dHRlenJ3eWluYmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzA5NjksImV4cCI6MjA1OTk0Njk2OX0.bo53ijbNFLGobJ-LtPNjVFV5fBHiTCIgyX1HV2INoCA';

export const supabase = createClient(supabaseUrl, supabaseKey);
