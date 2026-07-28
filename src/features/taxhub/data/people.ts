import type { Client, User } from "../types";

/** All firm, staff and client data below is fictional demo data. */
export const workspace = {
  id: "ws-brandt",
  firmName: "Brandt & Kollegen Steuerberatungsgesellschaft mbH",
  shortName: "Brandt & Kollegen",
  city: "Münster",
  headcount: 34,
  practiceSystem: "DATEV",
  isFictional: true,
};

export const users: User[] = [
  {
    id: "u-brandt",
    name: "Katharina Brandt",
    initials: "KB",
    role: "Partner",
    canApprove: true,
  },
  {
    id: "u-ehlers",
    name: "Jonas Ehlers",
    initials: "JE",
    role: "Steuerberater",
    canApprove: true,
  },
  {
    id: "u-radtke",
    name: "Miriam Radtke",
    initials: "MR",
    role: "Steuerfachangestellte",
    canApprove: false,
  },
  {
    id: "u-okonkwo",
    name: "Grace Okonkwo",
    initials: "GO",
    role: "Steuerfachangestellte",
    canApprove: false,
  },
  {
    id: "u-seidel",
    name: "Petra Seidel",
    initials: "PS",
    role: "Office Manager",
    canApprove: false,
  },
];

export const currentUserId = "u-radtke";

export const userById = (id: string) => users.find((u) => u.id === id);

export const clients: Client[] = [
  {
    id: "c-nordlicht",
    mandantNumber: "10428",
    name: "Nordlicht Handels GmbH",
    legalForm: "GmbH",
    city: "Münster",
    contactName: "Sven Kastner",
    contactEmail: "s.kastner@nordlicht-handels.example",
    responsibleUserId: "u-ehlers",
    fiscalYearEnd: "31 December",
    services: ["Finanzbuchhaltung", "Lohnbuchhaltung", "Jahresabschluss"],
  },
  {
    id: "c-havelmann",
    mandantNumber: "10711",
    name: "Havelmann Dachtechnik e.K.",
    legalForm: "e.K.",
    city: "Greven",
    contactName: "Ute Havelmann",
    contactEmail: "info@havelmann-dachtechnik.example",
    responsibleUserId: "u-radtke",
    fiscalYearEnd: "31 December",
    services: ["Finanzbuchhaltung", "Einkommensteuer"],
  },
  {
    id: "c-orbis",
    mandantNumber: "10902",
    name: "Orbis Medizintechnik GmbH & Co. KG",
    legalForm: "GmbH & Co. KG",
    city: "Osnabrück",
    contactName: "Dr. Lena Frisch",
    contactEmail: "l.frisch@orbis-medizintechnik.example",
    responsibleUserId: "u-brandt",
    fiscalYearEnd: "30 June",
    services: ["Jahresabschluss", "Umsatzsteuer", "Lohnbuchhaltung"],
  },
  {
    id: "c-kleve",
    mandantNumber: "11033",
    name: "Kleve Gastro UG (haftungsbeschränkt)",
    legalForm: "UG",
    city: "Münster",
    contactName: "Tobias Kleve",
    contactEmail: "t.kleve@kleve-gastro.example",
    responsibleUserId: "u-okonkwo",
    fiscalYearEnd: "31 December",
    services: ["Finanzbuchhaltung", "Lohnbuchhaltung"],
  },
  {
    id: "c-mardorf",
    mandantNumber: "11190",
    name: "Mardorf Immobilienverwaltung GbR",
    legalForm: "GbR",
    city: "Telgte",
    contactName: "Annika Mardorf",
    contactEmail: "a.mardorf@mardorf-immo.example",
    responsibleUserId: "u-ehlers",
    fiscalYearEnd: "31 December",
    services: ["Finanzbuchhaltung", "Einkommensteuer"],
  },
];

export const clientById = (id: string) => clients.find((c) => c.id === id);