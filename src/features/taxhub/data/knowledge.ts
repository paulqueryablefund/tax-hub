import type { AnswerBlock } from "../types";

export interface KnowledgeEntry {
  id: string;
  prompt: string;
  /** Shown as a suggested question in the empty state. */
  suggested: boolean;
  answer: AnswerBlock;
  /** Passages the retrieval step looked at, including rejected ones. */
  retrieved: { sourceId: string; passageId: string; used: boolean; note: string }[];
}

export const knowledgeEntries: KnowledgeEntry[] = [
  {
    id: "k-car",
    prompt: "How do we handle an electric company car that is also used privately?",
    suggested: true,
    answer: {
      id: "ka-car",
      question: "How do we handle an electric company car that is also used privately?",
      answer:
        "Collect the seven items on the firm intake checklist before anything is entered in payroll. The benefit is then valued either by the flat-rate method — 1 % per month of a quarter of the gross list price for a zero-emission vehicle, subject to the statutory price ceiling — or by a logbook kept for the whole year. The firm defaults to the flat-rate method unless the client confirms the logbook in writing, and a mid-year switch is not accepted. Any case where the gross list price may exceed the ceiling goes to a Steuerberater before the client is answered.",
      confidence: "high",
      citations: [
        {
          sourceId: "src-firm-handbook-car",
          passageId: "p-checklist",
          reason: "Firm intake checklist.",
        },
        {
          sourceId: "src-estg-6-1-4",
          passageId: "p-025",
          reason: "Statutory quarter valuation base.",
        },
        {
          sourceId: "src-firm-handbook-car",
          passageId: "p-method",
          reason: "Firm rule on method selection.",
        },
        {
          sourceId: "src-firm-handbook-car",
          passageId: "p-escalation",
          reason: "Firm escalation rule.",
        },
      ],
      caveats: [
        "The statutory price ceiling depends on the date of first registration. Check the ceiling in force on that date before quoting a figure to a client.",
      ],
    },
    retrieved: [
      {
        sourceId: "src-firm-handbook-car",
        passageId: "p-checklist",
        used: true,
        note: "Closest match to 'what do we need'.",
      },
      {
        sourceId: "src-estg-6-1-4",
        passageId: "p-025",
        used: true,
        note: "Statutory basis for the valuation.",
      },
      {
        sourceId: "src-firm-handbook-old-car",
        passageId: "p-old-rule",
        used: false,
        note: "Excluded: superseded on 15 January 2026.",
      },
    ],
  },
  {
    id: "k-conflict",
    prompt: "Which valuation base do we apply to electric vehicles?",
    suggested: true,
    answer: {
      id: "ka-conflict",
      question: "Which valuation base do we apply to electric vehicles?",
      answer:
        "The current firm policy follows the statutory rule: one quarter of the gross list price for zero-emission vehicles below the price ceiling, otherwise the halved base. Note that an older internal document gives a different, blanket rule.",
      confidence: "medium",
      citations: [
        {
          sourceId: "src-estg-6-1-4",
          passageId: "p-025",
          reason: "Statutory rule.",
        },
        {
          sourceId: "src-bmf-efahrzeuge",
          passageId: "p-ceiling",
          reason: "Explains the effect of exceeding the ceiling.",
        },
      ],
      caveats: [
        "The BMF guidance in the library was last reviewed on 2 May 2026 and is marked for review because the price ceiling has since been amended.",
      ],
      conflicts: {
        note: "Firm handbook 4.3 exists in two versions. The 2023 version applies the halved base in all cases and contradicts both the current handbook and the statute. It was superseded on 15 January 2026 and is excluded from the answer.",
        citations: [
          {
            sourceId: "src-firm-handbook-car",
            passageId: "p-method",
            reason: "Current version.",
          },
          {
            sourceId: "src-firm-handbook-old-car",
            passageId: "p-old-rule",
            reason: "Superseded version.",
          },
        ],
      },
    },
    retrieved: [
      {
        sourceId: "src-estg-6-1-4",
        passageId: "p-025",
        used: true,
        note: "Statutory rule.",
      },
      {
        sourceId: "src-firm-handbook-old-car",
        passageId: "p-old-rule",
        used: false,
        note: "Conflicting and superseded — surfaced to the reader rather than silently dropped.",
      },
    ],
  },
  {
    id: "k-deadline",
    prompt: "When do we submit a filing extension for an advised client?",
    suggested: true,
    answer: {
      id: "ka-deadline",
      question: "When do we submit a filing extension for an advised client?",
      answer:
        "Only once the client's records are at least eighty per cent complete. The responsible Steuerberater signs every extension request and the client is informed in writing the same day. The extended statutory filing period for advised taxpayers applies, but the tax office can still require earlier submission in an individual case.",
      confidence: "medium",
      citations: [
        {
          sourceId: "src-firm-handbook-fristen",
          passageId: "p-extension",
          reason: "Firm rule on extension requests.",
        },
        {
          sourceId: "src-ao-149",
          passageId: "p-advised",
          reason: "Statutory basis for the extended period.",
        },
      ],
      caveats: [
        "Firm handbook 2.1 was last reviewed on 4 February 2026 and is flagged for review. Confirm the current deadline schedule with the responsible Steuerberater before relying on this.",
      ],
    },
    retrieved: [
      {
        sourceId: "src-firm-handbook-fristen",
        passageId: "p-extension",
        used: true,
        note: "Direct match.",
      },
      {
        sourceId: "src-ao-149",
        passageId: "p-advised",
        used: true,
        note: "Statutory backing.",
      },
    ],
  },
  {
    id: "k-none",
    prompt: "What is our fee for a Jahresabschluss for a GmbH with 40 employees?",
    suggested: true,
    answer: {
      id: "ka-none",
      question: "What is our fee for a Jahresabschluss for a GmbH with 40 employees?",
      answer:
        "I cannot answer this from the sources in this workspace. No fee schedule or engagement-letter template has been added to the library, and I will not estimate a fee from general knowledge. Ask Petra Seidel, or add the fee schedule as a source.",
      confidence: "insufficient",
      citations: [],
      caveats: [
        "Nothing in the library covers fees. Adding a source does not automatically make it authoritative — mark it as firm policy so it is treated as binding.",
      ],
    },
    retrieved: [
      {
        sourceId: "src-firm-handbook-car",
        passageId: "p-checklist",
        used: false,
        note: "Weak lexical match only; no fee content.",
      },
    ],
  },
];

export function findKnowledgeEntry(query: string): KnowledgeEntry | null {
  const q = query.toLowerCase();
  if (!q.trim()) return null;
  const scored = knowledgeEntries
    .map((entry) => {
      const terms = entry.prompt.toLowerCase().split(/\W+/).filter((t) => t.length > 3);
      const hits = terms.filter((t) => q.includes(t)).length;
      return { entry, hits };
    })
    .sort((a, b) => b.hits - a.hits);
  if (!scored.length || scored[0].hits < 2) return null;
  return scored[0].entry;
}