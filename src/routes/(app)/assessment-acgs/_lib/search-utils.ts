import { norm } from "./acgs-question-utils.js";
import type { AssessmentItem } from "./types.js";

/** Indeks praproses untuk filter klien (sama bidang seperti FTS server). */
export function buildSearchHaystack(q: AssessmentItem): string {
  return [
    norm(q.item_id),
    norm(q.question_en),
    norm(q.question_id),
    norm(q.label),
  ]
    .join(" ")
    .toLowerCase();
}
