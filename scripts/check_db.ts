import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const db = createClient(url as string, key as string);

async function check() {
  const { data: sections } = await db.from("acgs_sections").select("*");
  console.log("Sections:", sections);
  
  const { data: qSchema } = await db.rpc('get_schema_info_from_rpc_or_just_select_1_row').maybeSingle() || await db.from("acgs_questions").select("*").limit(1);
  console.log("acgs_questions schema sample:", qSchema);
}
check();
