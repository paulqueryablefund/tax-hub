import type { Source } from "../types";

/**
 * Source library for the demo workspace.
 *
 * Public material is real and legally accessible (federal statutes, BMF
 * guidance, official forms). Firm material is invented for the demo and is
 * flagged with `isFictional: true` everywhere it is surfaced in the UI.
 */
export const sources: Source[] = [
  {
    id: "src-estg-6-1-4",
    title: "Einkommensteuergesetz § 6 Abs. 1 Nr. 4 — Bewertung der privaten Nutzung",
    shortTitle: "EStG § 6 Abs. 1 Nr. 4",
    kind: "official_regulation",
    publisher: "Bundesministerium der Justiz (gesetze-im-internet.de)",
    url: "https://www.gesetze-im-internet.de/estg/__6.html",
    isPublic: true,
    isFictional: false,
    effectiveFrom: "2024-01-01",
    lastReviewed: "2026-06-14",
    health: "current",
    visibility: "all_staff",
    passages: [
      {
        id: "p-025",
        locator: "Satz 2 and Satz 3 — quarter of gross list price",
        text: "For the private use of a motor vehicle that produces no carbon dioxide emissions, the flat-rate valuation applies one quarter of the gross list price instead of the full amount, provided the gross list price does not exceed the statutory ceiling. The reduced base applies for each calendar month at 1 % of that reduced list price.",
      },
      {
        id: "p-logbook",
        locator: "Satz 4 — logbook alternative",
        text: "Instead of the flat-rate method, the private share may be determined by the costs attributable to the private journeys, provided the total costs are substantiated by documents and the ratio of private to total journeys is evidenced by a proper logbook.",
      },
    ],
  },
  {
    id: "src-bmf-efahrzeuge",
    title:
      "BMF-Schreiben: Nutzung betrieblicher Elektro- und Hybridelektrofahrzeuge — Anwendungsfragen",
    shortTitle: "BMF guidance — electric company cars",
    kind: "official_guidance",
    publisher: "Bundesministerium der Finanzen",
    url: "https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Lohnsteuer/2023-11-17-nutzung-elektro-hybridelektrofahrzeuge.html",
    isPublic: true,
    isFictional: false,
    effectiveFrom: "2023-11-17",
    lastReviewed: "2026-05-02",
    health: "review_due",
    visibility: "all_staff",
    note: "Gross list price ceiling has been amended by later legislation. Confirm the ceiling applicable to the acquisition date before advising.",
    passages: [
      {
        id: "p-ceiling",
        locator: "Section on the reduced valuation base",
        text: "The reduced valuation base applies only where the gross list price of the vehicle at the time of first registration does not exceed the statutory ceiling. Where the ceiling is exceeded, the halved valuation base applies instead of the quarter base.",
      },
      {
        id: "p-commute",
        locator: "Section on journeys between home and place of work",
        text: "For journeys between the employee's home and the first place of work, the monthly addition is calculated on the same reduced valuation base as the private-use benefit.",
      },
    ],
  },
  {
    id: "src-lstr-8-1",
    title: "Lohnsteuer-Richtlinien R 8.1 — Bewertung von Sachbezügen",
    shortTitle: "LStR R 8.1",
    kind: "official_guidance",
    publisher: "Bundesministerium der Finanzen",
    url: "https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Steuerarten/Lohnsteuer/lohnsteuer-richtlinien.html",
    isPublic: true,
    isFictional: false,
    effectiveFrom: "2023-01-01",
    lastReviewed: "2026-04-21",
    health: "current",
    visibility: "all_staff",
    passages: [
      {
        id: "p-payroll",
        locator: "Treatment of the benefit in the payroll run",
        text: "The benefit in kind arising from the private use of a company vehicle is part of the employee's taxable remuneration and must be included in the payroll account for each month in which the vehicle is available for private use.",
      },
    ],
  },
  {
    id: "src-ustg-14",
    title: "Umsatzsteuergesetz § 14 — Ausstellung von Rechnungen",
    shortTitle: "UStG § 14",
    kind: "official_regulation",
    publisher: "Bundesministerium der Justiz (gesetze-im-internet.de)",
    url: "https://www.gesetze-im-internet.de/ustg_1980/__14.html",
    isPublic: true,
    isFictional: false,
    effectiveFrom: "2025-01-01",
    lastReviewed: "2026-07-01",
    health: "current",
    visibility: "all_staff",
    passages: [
      {
        id: "p-erechnung",
        locator: "Definition of the electronic invoice",
        text: "An electronic invoice is an invoice that is issued, transmitted and received in a structured electronic format and that permits electronic processing. Other invoices are invoices transmitted in another electronic format or on paper.",
      },
      {
        id: "p-receipt-duty",
        locator: "Obligation to issue an invoice",
        text: "Where a supply is carried out for another business for that business's undertaking, the supplier is obliged to issue an invoice within the statutory period.",
      },
    ],
  },
  {
    id: "src-ao-149",
    title: "Abgabenordnung § 149 — Abgabe der Steuererklärungen",
    shortTitle: "AO § 149",
    kind: "official_regulation",
    publisher: "Bundesministerium der Justiz (gesetze-im-internet.de)",
    url: "https://www.gesetze-im-internet.de/ao_1977/__149.html",
    isPublic: true,
    isFictional: false,
    effectiveFrom: "2024-01-01",
    lastReviewed: "2026-03-11",
    health: "current",
    visibility: "all_staff",
    passages: [
      {
        id: "p-advised",
        locator: "Extended filing period for advised taxpayers",
        text: "Where the return is prepared by a person authorised to provide tax advice, the extended statutory filing deadline applies. The tax office may nevertheless require earlier submission in individual cases.",
      },
    ],
  },
  {
    id: "src-fahrtenbuch-form",
    title: "Muster-Fahrtenbuch (logbook template)",
    shortTitle: "Logbook template",
    kind: "official_form",
    publisher: "Kanzlei Brandt & Kollegen (fictional demo material)",
    isPublic: false,
    isFictional: true,
    effectiveFrom: "2026-01-01",
    lastReviewed: "2026-06-30",
    health: "current",
    visibility: "all_staff",
    passages: [
      {
        id: "p-fields",
        locator: "Required columns",
        text: "Date, odometer reading at start, odometer reading at end, destination, purpose of the journey, business partner visited. Private journeys are recorded with distance only.",
      },
    ],
  },
  {
    id: "src-firm-handbook-car",
    title: "Kanzlei-Handbuch 4.3 — Firmenwagen: Mandantenprozess",
    shortTitle: "Firm handbook 4.3 — company cars",
    kind: "firm_policy",
    publisher: "Kanzlei Brandt & Kollegen (fictional demo material)",
    isPublic: false,
    isFictional: true,
    effectiveFrom: "2026-01-15",
    lastReviewed: "2026-07-10",
    health: "current",
    visibility: "all_staff",
    passages: [
      {
        id: "p-checklist",
        locator: "Intake checklist for a new company vehicle",
        text: "Before the vehicle can be entered in payroll we require: the purchase or leasing contract, the vehicle registration document, the gross list price at first registration including optional equipment, the date the vehicle was first made available to the employee, the employee's payroll number, the distance in kilometres between home and first place of work, and a written statement of whether a logbook will be kept.",
      },
      {
        id: "p-method",
        locator: "Choice of valuation method",
        text: "The firm defaults to the flat-rate method unless the client confirms in writing that a compliant logbook will be kept for the entire year. A mid-year switch is not accepted.",
      },
      {
        id: "p-escalation",
        locator: "Escalation rule",
        text: "Any company-vehicle question involving a gross list price above the reduced-base ceiling, a hybrid vehicle, or a shareholder-director must be reviewed by a Steuerberater before the client is answered.",
      },
    ],
  },
  {
    id: "src-firm-handbook-fristen",
    title: "Kanzlei-Handbuch 2.1 — Fristenkontrolle und Fristverlängerung",
    shortTitle: "Firm handbook 2.1 — deadlines",
    kind: "firm_policy",
    publisher: "Kanzlei Brandt & Kollegen (fictional demo material)",
    isPublic: false,
    isFictional: true,
    effectiveFrom: "2025-09-01",
    lastReviewed: "2026-02-04",
    health: "review_due",
    visibility: "professionals_only",
    note: "Not reviewed since the filing-deadline schedule was last discussed internally. Flagged for the next quarterly review.",
    passages: [
      {
        id: "p-extension",
        locator: "Handling extension requests",
        text: "Extension requests are only submitted where the records are at least eighty per cent complete. The responsible Steuerberater signs every extension request. Clients are informed in writing on the same day.",
      },
    ],
  },
  {
    id: "src-firm-template-reply",
    title: "Textbaustein — Nachforderung fehlender Unterlagen",
    shortTitle: "Template — missing document request",
    kind: "firm_template",
    publisher: "Kanzlei Brandt & Kollegen (fictional demo material)",
    isPublic: false,
    isFictional: true,
    effectiveFrom: "2025-11-01",
    lastReviewed: "2026-06-30",
    health: "current",
    visibility: "all_staff",
    passages: [
      {
        id: "p-tone",
        locator: "Tone and structure",
        text: "Open with the client's own question. List the outstanding items as a numbered list, one item per line, with the reason each item is needed. Give one date by which the items are needed. Do not attach fee information to a document request.",
      },
    ],
  },
  {
    id: "src-firm-handbook-old-car",
    title: "Kanzlei-Handbuch 4.3 (Fassung 2023) — Firmenwagen",
    shortTitle: "Firm handbook 4.3 (2023 version)",
    kind: "firm_policy",
    publisher: "Kanzlei Brandt & Kollegen (fictional demo material)",
    isPublic: false,
    isFictional: true,
    effectiveFrom: "2023-01-01",
    lastReviewed: "2023-01-05",
    health: "outdated",
    visibility: "all_staff",
    supersededByIds: ["src-firm-handbook-car"],
    note: "Superseded on 15 January 2026. Retained for audit purposes and excluded from answers.",
    passages: [
      {
        id: "p-old-rule",
        locator: "Valuation base",
        text: "For electric vehicles the firm applies the halved valuation base in all cases.",
      },
    ],
  },
];

export const sourceById = (id: string) => sources.find((s) => s.id === id);

export const passageFor = (sourceId: string, passageId: string) =>
  sourceById(sourceId)?.passages.find((p) => p.id === passageId);