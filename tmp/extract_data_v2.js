import fs from 'node:fs';
import { execSync } from 'node:child_process';

// Get original content from git
const html = execSync('git show origin/main:src/routes/assessment-acgs/+page.svelte').toString();

const cleaner = (h) => (h || '').replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
const stripTags = (h) => cleaner(h.replace(/<[^>]+>/g, '|')).split('|').filter(t => t.trim().length > 0);

function getTdContents(trHtml) {
    const tds = [];
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
    let match;
    while ((match = tdRegex.exec(trHtml)) !== null) {
        tds.push(match[1]);
    }
    return tds;
}

const rows = [];
const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
let match;

let currentLevel = "";
let currentPart = { id: "", name_en: "", name_id: "" };
let currentSection = { id: "", name_en: "", name_id: "" };

while ((match = trRegex.exec(html)) !== null) {
    const rowHtml = match[1];
    const cleanHtml = cleaner(rowHtml);
    const textItems = stripTags(rowHtml);
    const tds = getTdContents(rowHtml);

    if (textItems.length === 0) continue;

    // Level Row
    if (cleanHtml.includes('LEVEL') && textItems.length < 5) {
        const text = textItems.find(t => t.includes('LEVEL')) || "LEVEL 1";
        currentLevel = text;
        rows.push({ type: 'level', label: text });
        continue;
    }

    // ID Matcher (handles A.1, A.1.1, (P)D.3.1, (B)A.1.1)
    const idItem = textItems[0] || "";
    const idMatch = idItem.trim().match(/^(\(?[A-Z]\)?(\.?\(?[A-Z]\)?)?\.\d+(\.\d+)?)$/i);
    
    // Check if first TD contains a span with ID
    const firstTdText = stripTags(tds[0] || "")[0] || "";
    const spanIdMatch = firstTdText.match(/^(\(?[A-Z]\)?(\.?\(?[A-Z]\)?)?\.\d+(\.\d+)?)$/i);
    
    // Also check for something like A.1 (Section)
    const sectionMatch = idItem.trim().match(/^(\(?[A-Z]\)?(\.?\(?[A-Z]\)?)?\.\d+)$/i);

    if (idMatch || spanIdMatch || sectionMatch) {
        const id = (idMatch || spanIdMatch || sectionMatch)[1];
        const idParts = id.split('.');
        
        if (idParts.length >= 3) {
            const q_td = tds[1] || "";
            const q_text_items = stripTags(q_td);
            
            rows.push({
                type: 'question',
                level: currentLevel,
                part: currentPart.id,
                section: currentSection.id,
                id: id,
                question_en: q_text_items[0] || "",
                question_id: q_text_items[1] || "",
                implementation: cleaner(tds[2] || "").replace(/<[^>]+>/g, '').trim(),
                evidence: cleaner(tds[3] || "").replace(/<[^>]+>/g, '').trim(),
                status: cleaner(tds[4] || "").replace(/<[^>]+>/g, '').trim(),
                recommendation: cleaner(tds[5] || "").replace(/<[^>]+>/g, '').trim()
            });
        } else {
            const s_td = tds[1] || "";
            const s_text_items = stripTags(s_td);
            currentSection = { id: id, name_en: s_text_items[0] || "", name_id: s_text_items[1] || "" };
            rows.push({
                type: 'section',
                level: currentLevel,
                part: currentPart.id,
                id: id,
                name_en: currentSection.name_en,
                name_id: currentSection.name_id
            });
        }
        continue;
    }

    // Part Row
    if (textItems.some(t => t.startsWith('PART')) && textItems.some(t => t.startsWith('BAGIAN'))) {
        const partId = textItems.find(t => t.startsWith('PART')) || "PART ?";
        const partNameId = textItems.find(t => t.startsWith('BAGIAN')) || "BAGIAN ?";
        
        const name_td = tds[1] || "";
        const name_items = stripTags(name_td);

        currentPart = { id: partId, name_en: name_items[0] || "", name_id: name_items[1] || "" };
        rows.push({
            type: 'part',
            level: currentLevel,
            id: partId,
            name_id: partNameId,
            full_name_en: currentPart.name_en,
            full_name_id: currentPart.name_id
        });
        continue;
    }

    // Subtitle Row
    if (textItems.length >= 2 && !textItems[0].includes('.')) {
        rows.push({
            type: 'subtitle',
            level: currentLevel,
            part: currentPart.id,
            section: currentSection.id,
            name_en: textItems[0] || "",
            name_id: textItems[1] || ""
        });
    }
}

const output = `export interface AssessmentItem {
  type: "level" | "part" | "section" | "subtitle" | "question";
  level?: string;
  part?: string;
  section?: string;
  id?: string;
  label?: string;
  name_en?: string;
  name_id?: string;
  full_name_en?: string;
  full_name_id?: string;
  question_en?: string;
  question_id?: string;
  implementation?: string;
  evidence?: string;
  status?: string;
  recommendation?: string;
}

export const assessmentData: AssessmentItem[] = ${JSON.stringify(rows, null, 2)};`;
fs.writeFileSync('src/routes/assessment-acgs/assessment-data.ts', output);
console.log(`Extracted ${rows.length} rows including Level 2 values.`);
