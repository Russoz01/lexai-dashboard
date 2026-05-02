// Re-exporta o client browser para retrocompatibilidade
// Todos os imports existentes de '@/lib/supabase' continuam funcionando
export { createClient } from './supabase/client'
