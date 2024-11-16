import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xpgjcdopegxxgplsfwmn.supabase.co";
const supabaseAnnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwZ2pjZG9wZWd4eGdwbHNmd21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2MDQ0MDQsImV4cCI6MjA0NzE4MDQwNH0.lzAd89xRaIh91C2wkFjn5dJqcz-VwjV0hynhyXDsPbM";

export const supabase = createClient(supabaseUrl, supabaseAnnonKey)