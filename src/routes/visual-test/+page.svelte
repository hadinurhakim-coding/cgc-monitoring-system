<script lang="ts">
  import DataTable from "../(app)/assessment-acgs/_components/data-table.svelte";
  import type { AssessmentItem } from "../(app)/assessment-acgs/_lib/types.js";

  const questions: AssessmentItem[] = [
    {
      type: "question",
      item_id: "A.1.1",
      question_en: "Does the company protect basic shareholder rights?",
      question_id: "Apakah perusahaan melindungi hak dasar pemegang saham?",
      implementation: "Implementasi contoh",
      evidence: "Evidence contoh",
      status: "YES",
      recommendation: "",
      acgs_resolved_level: { label: "LEVEL 1" },
      acgs_resolved_part: {
        item_id: "PART A",
        full_name_en: "RIGHTS AND EQUITABLE TREATMENT OF SHAREHOLDERS",
        full_name_id: "HAK-HAK DAN PERLAKUAN SETARA TERHADAP PEMEGANG SAHAM"
      },
      acgs_resolved_section: {
        item_id: "A.1",
        name_en: "Basic Shareholder Rights",
        name_id: "Hak Dasar Pemegang Saham"
      }
    }
  ];
</script>

<main class="mx-auto max-w-6xl p-6">
  <DataTable
    initialQuestions={questions}
    currentYear={2026}
    availableYears={[2026]}
    canRecompute={true}
  />
</main>
