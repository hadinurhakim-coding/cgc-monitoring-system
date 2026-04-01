import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const db = createClient(url as string, key as string);

async function fix() {
  const { data: l1Sections } = await db.from("acgs_sections").select("*").neq("part_code", "BONUS").neq("part_code", "PENALTY");
  
  const l1SectionMap = new Map();
  for (const s of l1Sections || []) {
    l1SectionMap.set(s.code, s);
  }

  // Get ALL questions and filter
  const { data: allQuestions } = await db.from("acgs_questions").select("id, code, section_id");
  const questions = (allQuestions || []).filter(q => q.code.startsWith("(B)") || q.code.startsWith("(P)"));

  if (questions.length === 0) {
    console.log("No questions to migrate. Quitting.");
    return;
  }

  console.log("Found " + questions.length + " questions to migrate");

  const createdSections = new Map();
  let bonusSortOrder = 1;
  let penaltySortOrder = 1;

  for (const q of questions) {
    let match = q.code.match(/^(\([BP]\)[A-Z]\.\d+)/);
    if (!match) match = q.code.match(/^(\([BP]\)[A-Z])/);
    
    if (!match) continue;

    const targetSectionCode = match[1]; // "(B)A.1"
    const isBonus = targetSectionCode.startsWith("(B)");
    const partCode = isBonus ? "BONUS" : "PENALTY";
    
    // Attempt to inherit Level 1 titles!
    const l1Code = targetSectionCode.substring(3); // "(B)A.1" -> "A.1"
    const baseSection = l1SectionMap.get(l1Code);

    let secId = createdSections.get(targetSectionCode);

    if (!secId) {
      const { data: newSec, error: errSec } = await db.from("acgs_sections").upsert({
        code: targetSectionCode,
        part_code: partCode,
        title_en: baseSection ? baseSection.title_en : `${targetSectionCode} Items`,
        title_id: baseSection ? baseSection.title_id : `Item ${targetSectionCode}`,
        sort_order: isBonus ? bonusSortOrder++ : penaltySortOrder++
      }, { onConflict: "code" }).select("id").single();

      if (errSec || !newSec) {
        console.error("Failed to create section", targetSectionCode, errSec?.message);
        const { data: existingSec } = await db.from("acgs_sections").select("id").eq("code", targetSectionCode).single();
        if (existingSec) {
          secId = existingSec.id;
          createdSections.set(targetSectionCode, secId);
        } else {
          continue;
        }
      } else {
        secId = newSec.id;
        createdSections.set(targetSectionCode, secId);
      }
    }

    await db.from("acgs_questions").update({ section_id: secId }).eq("id", q.id);
  }

  await db.from("acgs_sections").delete().in("code", ["ALL_BONUS", "ALL_PENALTY"]);

  console.log("Database sections fixed for " + questions.length + " questions!");
}

fix();
