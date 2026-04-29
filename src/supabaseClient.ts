import { createClient } from '@supabase/supabase-js'
import type { Database } from './database/supabase'

console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)

export const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL as string,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string
)
