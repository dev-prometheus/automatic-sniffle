import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

export async function getEntryByEmail(email) {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .ilike('email', email.trim())
    .maybeSingle()
  if (error) throw error
  return data
}

export async function updateStatus(id, status) {
  const { error } = await supabase
    .from('entries')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}
