<script lang="ts">
  import type { AssessmentItem } from "../_lib/types.js";
  import {
    canonicalPartIdForAcgsQuestion,
    isAcgsQuestionRow
  } from "../_data/acgs-defaults.js";
  import { isAcgsNa, isAcgsYes } from "../_lib/scoring.js";

  let { questions = [] }: { questions?: AssessmentItem[] } = $props();

  function fmtComma2(n: number) {
    return n.toFixed(2).replace(".", ",");
  }

  function fmtTotalScore(n: number) {
    // Tabel template menampilkan penalti negatif dalam format "(x,xx)".
    if (n < 0) return `(${fmtComma2(Math.abs(n))})`;
    return fmtComma2(n);
  }

  type GroupMode = "level1" | "bonus" | "penalti";
  type GroupScore = {
    total: number;
    na: number;
    tidak: number;
    ya: number;
    scoreMax: number;
    scoreTotal: number;
    scoreTotalStr: string;
  };

  function computeGroup(rows: AssessmentItem[], scoreMax: number, mode: GroupMode): GroupScore {
    const total = rows.length;
    const na = rows.filter(isAcgsNa).length;
    const ya = rows.filter(isAcgsYes).length;
    const tidak = Math.max(0, total - na - ya);

    const scoreTotal =
      total === 0
        ? 0
        : mode === "level1"
          ? ((na + ya) / total) * scoreMax
          : mode === "bonus"
            ? (ya / total) * scoreMax
            : // penalti
              (ya / total) * scoreMax;

    return {
      total,
      na,
      tidak,
      ya,
      scoreMax,
      scoreTotal,
      scoreTotalStr: fmtTotalScore(scoreTotal)
    };
  }

  const questionRows = $derived(() => {
    return (questions ?? []).filter((q) => isAcgsQuestionRow(q)) as AssessmentItem[];
  });

  const partA = $derived(() => {
    const rows = questionRows().filter((q) =>
      canonicalPartIdForAcgsQuestion(q).startsWith("PART A")
    );
    return computeGroup(rows, 20, "level1");
  });

  const partB = $derived(() => {
    const rows = questionRows().filter((q) =>
      canonicalPartIdForAcgsQuestion(q).startsWith("PART B")
    );
    return computeGroup(rows, 15, "level1");
  });

  const partC = $derived(() => {
    const rows = questionRows().filter((q) =>
      canonicalPartIdForAcgsQuestion(q).startsWith("PART C")
    );
    return computeGroup(rows, 25, "level1");
  });

  const partD = $derived(() => {
    const rows = questionRows().filter((q) =>
      canonicalPartIdForAcgsQuestion(q).startsWith("PART D")
    );
    return computeGroup(rows, 40, "level1");
  });

  const level1Total = $derived(() => {
    // Pakai hitungan agregat dari group individual agar rounding konsisten dengan template.
    const total = partA().total + partB().total + partC().total + partD().total;
    const na = partA().na + partB().na + partC().na + partD().na;
    const ya = partA().ya + partB().ya + partC().ya + partD().ya;
    const tidak = partA().tidak + partB().tidak + partC().tidak + partD().tidak;

    const scoreTotal = total === 0 ? 0 : ((na + ya) / total) * 100;
    return {
      total,
      na,
      tidak,
      ya,
      scoreTotalStr: fmtTotalScore(scoreTotal)
    };
  });

  const bonus = $derived(() => {
    const rows = questionRows().filter((q) =>
      /^PART\s+\(B\)/.test(canonicalPartIdForAcgsQuestion(q))
    );
    return computeGroup(rows, 30, "bonus");
  });

  const penalti = $derived(() => {
    const rows = questionRows().filter((q) =>
      /^PART\s+\(P\)/.test(canonicalPartIdForAcgsQuestion(q))
    );
    return computeGroup(rows, -67, "penalti");
  });

  const level2Total = $derived(() => {
    const total = bonus().total + penalti().total;
    const na = bonus().na + penalti().na;
    const tidak = bonus().tidak + penalti().tidak;
    const ya = bonus().ya + penalti().ya;
    const scoreTotal = bonus().scoreTotal + penalti().scoreTotal;

    return {
      total,
      na,
      tidak,
      ya,
      scoreTotalStr: fmtTotalScore(scoreTotal)
    };
  });

  const overallTotal = $derived(() => {
    const total = level1Total().total + level2Total().total;
    const na = level1Total().na + level2Total().na;
    const tidak = level1Total().tidak + level2Total().tidak;
    const ya = level1Total().ya + level2Total().ya;
    const scoreTotal =
      partA().scoreTotal +
      partB().scoreTotal +
      partC().scoreTotal +
      partD().scoreTotal +
      bonus().scoreTotal +
      penalti().scoreTotal;

    return {
      total,
      na,
      tidak,
      ya,
      scoreTotalStr: fmtTotalScore(scoreTotal)
    };
  });
</script>

<div class="w-full overflow-x-auto">
  <table class="w-full min-w-175 border-collapse border-2 border-black font-sans text-[13px] text-black bg-white">
    <thead>
      <tr class="bg-[#002060] text-white text-center">
        <th rowspan="2" colspan="2" class="border border-white px-3 py-2 font-semibold align-middle w-[30%]">Standar Tata Kelola Perusahaan</th>
        <th rowspan="2" class="border border-white px-3 py-2 font-semibold align-middle leading-snug">Jumlah<br/>Pertanyaan</th>
        <th rowspan="2" class="border border-white px-3 py-2 font-semibold align-middle leading-snug">Skor<br/>Maksimal</th>
        <th colspan="3" class="border border-white px-2 py-1 font-semibold">Pemenuhan</th>
        <th rowspan="2" class="border border-white px-3 py-2 font-semibold align-middle leading-snug">Total<br/>Skor</th>
      </tr>
      <tr class="bg-[#002060] text-white text-center">
        <th class="border border-white px-2 py-1 font-semibold leading-snug"><span class="italic font-normal">Not<br/>Applicable</span><br/>(N/A)</th>
        <th class="border border-white px-3 py-1 font-semibold align-middle">Tidak</th>
        <th class="border border-white px-3 py-1 font-semibold align-middle">Ya</th>
      </tr>
    </thead>
    <tbody>
      <!-- LEVEL 1 -->
      <tr>
        <td colspan="8" class="border border-black px-2 py-1.5 font-bold">LEVEL 1</td>
      </tr>
      <tr>
        <td class="border border-black px-2 py-1.5 align-top whitespace-nowrap text-center">Bagian A</td>
        <td class="border border-black px-2 py-1.5 align-top">Hak-hak dan Perlakuan<br/>Setara terhadap<br/>Pemegang Saham</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partA().total}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">20,00</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partA().na}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partA().tidak}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partA().ya}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partA().scoreTotalStr}</td>
      </tr>
      <tr>
        <td class="border border-black px-2 py-1.5 align-top whitespace-nowrap text-center">Bagian B</td>
        <td class="border border-black px-2 py-1.5 align-top">Keberlanjutan dan<br/>Ketahanan</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partB().total}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">15,00</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partB().na}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partB().tidak}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partB().ya}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partB().scoreTotalStr}</td>
      </tr>
      <tr>
        <td class="border border-black px-2 py-1.5 align-top whitespace-nowrap text-center">Bagian C</td>
        <td class="border border-black px-2 py-1.5 align-top">Transparansi dan<br/>Pengungkapan</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partC().total}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">25,00</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partC().na}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partC().tidak}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partC().ya}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partC().scoreTotalStr}</td>
      </tr>
      <tr>
        <td class="border border-black px-2 py-1.5 align-top whitespace-nowrap text-center">Bagian D</td>
        <td class="border border-black px-2 py-1.5 align-top">Tanggung Jawab Dewan</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partD().total}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">40,00</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partD().na}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partD().tidak}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partD().ya}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{partD().scoreTotalStr}</td>
      </tr>
      <tr class="bg-[#b4c6e7] font-bold">
        <td colspan="2" class="border border-black px-2 py-1.5 uppercase">TOTAL LEVEL 1</td>
        <td class="border border-black px-2 py-1.5 text-right">{level1Total().total}</td>
        <td class="border border-black px-2 py-1.5 text-right">100,00</td>
        <td class="border border-black px-2 py-1.5 text-right">{level1Total().na}</td>
        <td class="border border-black px-2 py-1.5 text-right">{level1Total().tidak}</td>
        <td class="border border-black px-2 py-1.5 text-right">{level1Total().ya}</td>
        <td class="border border-black px-2 py-1.5 text-right">{level1Total().scoreTotalStr}</td>
      </tr>

      <!-- LEVEL 2 -->
      <tr>
        <td colspan="8" class="border border-black px-2 py-1.5 font-bold">LEVEL 2</td>
      </tr>
      <tr>
        <td class="border border-black px-2 py-1.5 align-top"></td>
        <td class="border border-black px-2 py-1.5 align-top">Bonus</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{bonus().total}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">30</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{bonus().na}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{bonus().tidak}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{bonus().ya}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{bonus().scoreTotalStr}</td>
      </tr>
      <tr>
        <td class="border border-black px-2 py-1.5 align-top"></td>
        <td class="border border-black px-2 py-1.5 align-top">Penalti</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{penalti().total}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">-67</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{penalti().na}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{penalti().tidak}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{penalti().ya}</td>
        <td class="border border-black px-2 py-1.5 align-top text-right">{penalti().scoreTotalStr}</td>
      </tr>
      <tr class="bg-[#b4c6e7] font-bold">
        <td colspan="2" class="border border-black px-2 py-1.5 uppercase">TOTAL LEVEL 2</td>
        <td class="border border-black px-2 py-1.5 text-right">{level2Total().total}</td>
        <td class="border border-black px-2 py-1.5 text-right">30,00</td>
        <td class="border border-black px-2 py-1.5 text-right">{level2Total().na}</td>
        <td class="border border-black px-2 py-1.5 text-right">{level2Total().tidak}</td>
        <td class="border border-black px-2 py-1.5 text-right">{level2Total().ya}</td>
        <td class="border border-black px-2 py-1.5 text-right">{level2Total().scoreTotalStr}</td>
      </tr>

      <!-- TOTAL -->
      <tr class="bg-[#b4c6e7] font-bold">
        <td colspan="2" class="border border-black px-2 py-1.5">TOTAL</td>
        <td class="border border-black px-2 py-1.5 text-right">{overallTotal().total}</td>
        <td class="border border-black px-2 py-1.5 text-right">130,00</td>
        <td class="border border-black px-2 py-1.5 text-right">{overallTotal().na}</td>
        <td class="border border-black px-2 py-1.5 text-right">{overallTotal().tidak}</td>
        <td class="border border-black px-2 py-1.5 text-right">{overallTotal().ya}</td>
        <td class="border border-black px-2 py-1.5 text-right">{overallTotal().scoreTotalStr}</td>
      </tr>
    </tbody>
  </table>
</div>
