
INSERT INTO public.workspaces (id, firm_name, short_name, city, headcount, practice_system, is_fictional) VALUES
('ws-brandt','Brandt & Kollegen Steuerberatungsgesellschaft mbH','Brandt & Kollegen','Münster',34,'DATEV',true);

INSERT INTO public.app_users (id, workspace_id, name, initials, role, can_approve, position, is_current_user) VALUES
('u-brandt','ws-brandt','Katharina Brandt','KB','Partner',true,0,false),
('u-ehlers','ws-brandt','Jonas Ehlers','JE','Steuerberater',true,1,false),
('u-radtke','ws-brandt','Miriam Radtke','MR','Steuerfachangestellte',false,2,true),
('u-okonkwo','ws-brandt','Grace Okonkwo','GO','Steuerfachangestellte',false,3,false),
('u-seidel','ws-brandt','Petra Seidel','PS','Office Manager',false,4,false);

INSERT INTO public.clients (id, workspace_id, mandant_number, name, legal_form, city, contact_name, contact_email, responsible_user_id, fiscal_year_end, services, position) VALUES
('c-nordlicht','ws-brandt','10428','Nordlicht Handels GmbH','GmbH','Münster','Sven Kastner','s.kastner@nordlicht-handels.example','u-ehlers','31 December',ARRAY['Finanzbuchhaltung','Lohnbuchhaltung','Jahresabschluss'],0),
('c-havelmann','ws-brandt','10711','Havelmann Dachtechnik e.K.','e.K.','Greven','Ute Havelmann','info@havelmann-dachtechnik.example','u-radtke','31 December',ARRAY['Finanzbuchhaltung','Einkommensteuer'],1),
('c-orbis','ws-brandt','10902','Orbis Medizintechnik GmbH & Co. KG','GmbH & Co. KG','Osnabrück','Dr. Lena Frisch','l.frisch@orbis-medizintechnik.example','u-brandt','30 June',ARRAY['Jahresabschluss','Umsatzsteuer','Lohnbuchhaltung'],2),
('c-kleve','ws-brandt','11033','Kleve Gastro UG (haftungsbeschränkt)','UG','Münster','Tobias Kleve','t.kleve@kleve-gastro.example','u-okonkwo','31 December',ARRAY['Finanzbuchhaltung','Lohnbuchhaltung'],3),
('c-mardorf','ws-brandt','11190','Mardorf Immobilienverwaltung GbR','GbR','Telgte','Annika Mardorf','a.mardorf@mardorf-immo.example','u-ehlers','31 December',ARRAY['Finanzbuchhaltung','Einkommensteuer'],4);

INSERT INTO public.sources (id, workspace_id, title, short_title, kind, publisher, url, is_public, is_fictional, effective_from, last_reviewed, health, visibility, note, position) VALUES
('src-estg-6-1-4','ws-brandt','Einkommensteuergesetz § 6 Abs. 1 Nr. 4 — Bewertung der privaten Nutzung','EStG § 6 Abs. 1 Nr. 4','official_regulation','Bundesministerium der Justiz (gesetze-im-internet.de)','https://www.gesetze-im-internet.de/estg/__6.html',true,false,'2024-01-01','2026-06-14','current','all_staff',NULL,0),
('src-bmf-efahrzeuge','ws-brandt','BMF-Schreiben: Nutzung betrieblicher Elektro- und Hybridelektrofahrzeuge — Anwendungsfragen','BMF guidance — electric company cars','official_guidance','Bundesministerium der Finanzen','https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Lohnsteuer/2023-11-17-nutzung-elektro-hybridelektrofahrzeuge.html',true,false,'2023-11-17','2026-05-02','review_due','all_staff','Gross list price ceiling has been amended by later legislation. Confirm the ceiling applicable to the acquisition date before advising.',1),
('src-lstr-8-1','ws-brandt','Lohnsteuer-Richtlinien R 8.1 — Bewertung von Sachbezügen','LStR R 8.1','official_guidance','Bundesministerium der Finanzen','https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Steuerarten/Lohnsteuer/lohnsteuer-richtlinien.html',true,false,'2023-01-01','2026-04-21','current','all_staff',NULL,2),
('src-ustg-14','ws-brandt','Umsatzsteuergesetz § 14 — Ausstellung von Rechnungen','UStG § 14','official_regulation','Bundesministerium der Justiz (gesetze-im-internet.de)','https://www.gesetze-im-internet.de/ustg_1980/__14.html',true,false,'2025-01-01','2026-07-01','current','all_staff',NULL,3),
('src-ao-149','ws-brandt','Abgabenordnung § 149 — Abgabe der Steuererklärungen','AO § 149','official_regulation','Bundesministerium der Justiz (gesetze-im-internet.de)','https://www.gesetze-im-internet.de/ao_1977/__149.html',true,false,'2024-01-01','2026-03-11','current','all_staff',NULL,4),
('src-fahrtenbuch-form','ws-brandt','Muster-Fahrtenbuch (logbook template)','Logbook template','official_form','Kanzlei Brandt & Kollegen (fictional demo material)',NULL,false,true,'2026-01-01','2026-06-30','current','all_staff',NULL,5),
('src-firm-handbook-car','ws-brandt','Kanzlei-Handbuch 4.3 — Firmenwagen: Mandantenprozess','Firm handbook 4.3 — company cars','firm_policy','Kanzlei Brandt & Kollegen (fictional demo material)',NULL,false,true,'2026-01-15','2026-07-10','current','all_staff',NULL,6),
('src-firm-handbook-fristen','ws-brandt','Kanzlei-Handbuch 2.1 — Fristenkontrolle und Fristverlängerung','Firm handbook 2.1 — deadlines','firm_policy','Kanzlei Brandt & Kollegen (fictional demo material)',NULL,false,true,'2025-09-01','2026-02-04','review_due','professionals_only','Not reviewed since the filing-deadline schedule was last discussed internally. Flagged for the next quarterly review.',7),
('src-firm-template-reply','ws-brandt','Textbaustein — Nachforderung fehlender Unterlagen','Template — missing document request','firm_template','Kanzlei Brandt & Kollegen (fictional demo material)',NULL,false,true,'2025-11-01','2026-06-30','current','all_staff',NULL,8),
('src-firm-handbook-old-car','ws-brandt','Kanzlei-Handbuch 4.3 (Fassung 2023) — Firmenwagen','Firm handbook 4.3 (2023 version)','firm_policy','Kanzlei Brandt & Kollegen (fictional demo material)',NULL,false,true,'2023-01-01','2023-01-05','outdated','all_staff','Superseded on 15 January 2026. Retained for audit purposes and excluded from answers.',9);

INSERT INTO public.source_passages (source_id, passage_id, locator, text, position) VALUES
('src-estg-6-1-4','p-025','Satz 2 and Satz 3 — quarter of gross list price','For the private use of a motor vehicle that produces no carbon dioxide emissions, the flat-rate valuation applies one quarter of the gross list price instead of the full amount, provided the gross list price does not exceed the statutory ceiling. The reduced base applies for each calendar month at 1 % of that reduced list price.',0),
('src-estg-6-1-4','p-logbook','Satz 4 — logbook alternative','Instead of the flat-rate method, the private share may be determined by the costs attributable to the private journeys, provided the total costs are substantiated by documents and the ratio of private to total journeys is evidenced by a proper logbook.',1),
('src-bmf-efahrzeuge','p-ceiling','Section on the reduced valuation base','The reduced valuation base applies only where the gross list price of the vehicle at the time of first registration does not exceed the statutory ceiling. Where the ceiling is exceeded, the halved valuation base applies instead of the quarter base.',0),
('src-bmf-efahrzeuge','p-commute','Section on journeys between home and place of work','For journeys between the employee''s home and the first place of work, the monthly addition is calculated on the same reduced valuation base as the private-use benefit.',1),
('src-lstr-8-1','p-payroll','Treatment of the benefit in the payroll run','The benefit in kind arising from the private use of a company vehicle is part of the employee''s taxable remuneration and must be included in the payroll account for each month in which the vehicle is available for private use.',0),
('src-ustg-14','p-erechnung','Definition of the electronic invoice','An electronic invoice is an invoice that is issued, transmitted and received in a structured electronic format and that permits electronic processing. Other invoices are invoices transmitted in another electronic format or on paper.',0),
('src-ustg-14','p-receipt-duty','Obligation to issue an invoice','Where a supply is carried out for another business for that business''s undertaking, the supplier is obliged to issue an invoice within the statutory period.',1),
('src-ao-149','p-advised','Extended filing period for advised taxpayers','Where the return is prepared by a person authorised to provide tax advice, the extended statutory filing deadline applies. The tax office may nevertheless require earlier submission in individual cases.',0),
('src-fahrtenbuch-form','p-fields','Required columns','Date, odometer reading at start, odometer reading at end, destination, purpose of the journey, business partner visited. Private journeys are recorded with distance only.',0),
('src-firm-handbook-car','p-checklist','Intake checklist for a new company vehicle','Before the vehicle can be entered in payroll we require: the purchase or leasing contract, the vehicle registration document, the gross list price at first registration including optional equipment, the date the vehicle was first made available to the employee, the employee''s payroll number, the distance in kilometres between home and first place of work, and a written statement of whether a logbook will be kept.',0),
('src-firm-handbook-car','p-method','Choice of valuation method','The firm defaults to the flat-rate method unless the client confirms in writing that a compliant logbook will be kept for the entire year. A mid-year switch is not accepted.',1),
('src-firm-handbook-car','p-escalation','Escalation rule','Any company-vehicle question involving a gross list price above the reduced-base ceiling, a hybrid vehicle, or a shareholder-director must be reviewed by a Steuerberater before the client is answered.',2),
('src-firm-handbook-fristen','p-extension','Handling extension requests','Extension requests are only submitted where the records are at least eighty per cent complete. The responsible Steuerberater signs every extension request. Clients are informed in writing on the same day.',0),
('src-firm-template-reply','p-tone','Tone and structure','Open with the client''s own question. List the outstanding items as a numbered list, one item per line, with the reason each item is needed. Give one date by which the items are needed. Do not attach fee information to a document request.',0),
('src-firm-handbook-old-car','p-old-rule','Valuation base','For electric vehicles the firm applies the halved valuation base in all cases.',0);

INSERT INTO public.source_supersessions (source_id, superseded_by_id) VALUES
('src-firm-handbook-old-car','src-firm-handbook-car');

INSERT INTO public.requests (id, workspace_id, reference, client_id, channel, received_at, subject, body, category, category_confidence, lifecycle_status, assigned_user_id, due_date, narrative_summary) VALUES
('r-1042','ws-brandt','REQ-2026-1042','c-nordlicht','email','2026-07-28T08:12:00+02:00','New electric company car — what do you need from us?',E'Good morning Ms Radtke,\n\nwe took delivery of an electric company car in March and one of our sales colleagues also uses it privately at weekends. Our bookkeeper says something has to appear on the payslip but we do not know what. Could you tell us how this is handled and what you need from us? We would like it sorted before the next payroll run.\n\nKind regards\nSven Kastner\nNordlicht Handels GmbH','company_car','high','ready_for_review','u-radtke','2026-07-31','Client acquired an electric company vehicle in March 2026 that is also used privately by an employee. Needs the benefit in kind set up before the next payroll run.'),
('r-1041','ws-brandt','REQ-2026-1041','c-havelmann','phone','2026-07-28T07:41:00+02:00','Missing receipts for Q2 bookkeeping','Call transcript (assistant, 2 min 14 s): Caller asked whether the June bookkeeping was finished. Explained that eleven receipts are still outstanding, of which nine are fuel receipts and two are hotel invoices. Caller asked for a written list.','missing_documents','high','intake','u-radtke','2026-07-30','Client asked for a written list of the receipts still missing for the second quarter. Eleven receipts outstanding.'),
('r-1040','ws-brandt','REQ-2026-1040','c-orbis','email','2026-07-27T16:55:00+02:00','Do we have to accept structured e-invoices from 2027?','Our supplier says they will only send structured electronic invoices from January. Do we have to be able to receive these, and does anything change for the invoices we issue?','e_invoicing','high','new','u-brandt',NULL,'Client asks about the obligation to receive structured electronic invoices and about its own outgoing invoices.'),
('r-1039','ws-brandt','REQ-2026-1039','c-kleve','portal','2026-07-27T11:20:00+02:00','New kitchen assistant starting 1 August','We are taking on a kitchen assistant on 1 August, 25 hours a week. What do you need from us to register her?','payroll_change','high','awaiting_client','u-okonkwo','2026-07-30','New employee registration for 1 August. Six intake items were requested from the client on 27 July; three have been received so far.'),
('r-1038','ws-brandt','REQ-2026-1038','c-mardorf','email','2026-07-26T09:05:00+02:00','Request for a filing extension','We will not have the 2025 figures ready in time. Can you request an extension for us?','deadline_extension','medium','approved','u-ehlers',NULL,'Extension request for the 2025 returns. Firm policy requires records to be at least eighty per cent complete; the responsible Steuerberater approved the request on 27 July.'),
('r-1037','ws-brandt','REQ-2026-1037','c-nordlicht','email','2026-07-24T14:32:00+02:00','Query on our May invoice','There is a position on the May invoice we do not recognise. Could someone call us back?','invoice_query','medium','closed','u-seidel',NULL,'Fee query on the May invoice. Routed to the office manager; no tax advice involved. Resolved by telephone on 25 July.');

INSERT INTO public.intake_fields (id, request_id, position, label, help, type, options, required, value, status, required_by_source_id, required_by_passage_id, required_by_reason) VALUES
('f-contract','r-1042',0,'Purchase or leasing contract','Establishes the acquisition date and whether the vehicle is owned or leased.','file',NULL,true,'Kaufvertrag_Nordlicht_2026-03-11.pdf','provided','src-firm-handbook-car','p-checklist','Firm intake checklist lists the contract as a mandatory item.'),
('f-registration','r-1042',1,'Vehicle registration document (Zulassungsbescheinigung Teil II)','Confirms the date of first registration, which determines the valuation base.','file',NULL,true,NULL,'missing','src-bmf-efahrzeuge','p-ceiling','The valuation base depends on the gross list price at first registration.'),
('f-list-price','r-1042',2,'Gross list price at first registration, including optional equipment','Rounded down to the nearest full hundred euro. Determines whether the reduced base applies.','number',NULL,true,'58,900 EUR (stated verbally, not evidenced)','uncertain','src-estg-6-1-4','p-025','The flat-rate valuation is calculated on the gross list price.'),
('f-available-from','r-1042',3,'Date the vehicle was first made available to the employee','The benefit accrues for each full calendar month of availability.','date',NULL,true,NULL,'missing','src-lstr-8-1','p-payroll','The benefit must be posted for each month of availability.'),
('f-payroll-number','r-1042',4,'Employee payroll number','Needed to post the benefit to the correct payroll account.','text',NULL,true,'Personalnummer 0147','provided',NULL,NULL,NULL),
('f-commute','r-1042',5,'Distance home to first place of work (one way, km)','Used for the additional monthly commuting benefit.','number',NULL,true,NULL,'missing','src-bmf-efahrzeuge','p-commute','Commuting journeys are added on the same reduced base.'),
('f-logbook','r-1042',6,'Will a logbook be kept for the full year?','The firm does not accept a mid-year switch between methods.','select',ARRAY['Yes, full-year logbook','No, flat-rate method','Not yet decided'],true,NULL,'missing','src-firm-handbook-car','p-method','Firm policy requires a written decision before payroll setup.'),
('f-period','r-1041',0,'Accounting period concerned','','text',NULL,true,'April to June 2026','provided',NULL,NULL,NULL),
('f-list','r-1041',1,'Confirmed list of outstanding receipts','Pulled from the open items in the bookkeeping system.','text',NULL,true,'11 items — needs confirmation against the practice system','uncertain',NULL,NULL,NULL);

INSERT INTO public.answers (id, request_id, position, question, answer, confidence, caveats, conflict_note) VALUES
('a-method','r-1042',0,'How is the private use of this electric company car valued?','Two methods are available. Under the flat-rate method the monthly taxable benefit is 1 % of the gross list price, and for a vehicle with no carbon dioxide emissions only one quarter of that list price is used as the base, provided the price stays under the statutory ceiling. Alternatively the private share may be evidenced by a proper logbook covering the whole year. Journeys between home and the first place of work are added on the same reduced base.','high',ARRAY['The applicable gross list price ceiling depends on the date of first registration. The stated price of 58,900 EUR has not been evidenced, so the base cannot be confirmed.'],'Two versions of the firm handbook cover this topic. The 2023 version applies the halved base in all cases and was superseded on 15 January 2026. Only the current version was used.'),
('a-escalation','r-1042',1,'Can this be answered without a Steuerberater reviewing it?','No. The firm handbook requires review by a Steuerberater whenever the gross list price may exceed the reduced-base ceiling. The stated price is close to that threshold and is not yet evidenced.','high',ARRAY[]::text[],NULL),
('ka-car',NULL,0,'How do we handle an electric company car that is also used privately?','Collect the seven items on the firm intake checklist before anything is entered in payroll. The benefit is then valued either by the flat-rate method — 1 % per month of a quarter of the gross list price for a zero-emission vehicle, subject to the statutory price ceiling — or by a logbook kept for the whole year. The firm defaults to the flat-rate method unless the client confirms the logbook in writing, and a mid-year switch is not accepted. Any case where the gross list price may exceed the ceiling goes to a Steuerberater before the client is answered.','high',ARRAY['The statutory price ceiling depends on the date of first registration. Check the ceiling in force on that date before quoting a figure to a client.'],NULL),
('ka-conflict',NULL,0,'Which valuation base do we apply to electric vehicles?','The current firm policy follows the statutory rule: one quarter of the gross list price for zero-emission vehicles below the price ceiling, otherwise the halved base. Note that an older internal document gives a different, blanket rule.','medium',ARRAY['The BMF guidance in the library was last reviewed on 2 May 2026 and is marked for review because the price ceiling has since been amended.'],'Firm handbook 4.3 exists in two versions. The 2023 version applies the halved base in all cases and contradicts both the current handbook and the statute. It was superseded on 15 January 2026 and is excluded from the answer.'),
('ka-deadline',NULL,0,'When do we submit a filing extension for an advised client?','Only once the client''s records are at least eighty per cent complete. The responsible Steuerberater signs every extension request and the client is informed in writing the same day. The extended statutory filing period for advised taxpayers applies, but the tax office can still require earlier submission in an individual case.','medium',ARRAY['Firm handbook 2.1 was last reviewed on 4 February 2026 and is flagged for review. Confirm the current deadline schedule with the responsible Steuerberater before relying on this.'],NULL),
('ka-none',NULL,0,'What is our fee for a Jahresabschluss for a GmbH with 40 employees?','I cannot answer this from the sources in this workspace. No fee schedule or engagement-letter template has been added to the library, and I will not estimate a fee from general knowledge. Ask Petra Seidel, or add the fee schedule as a source.','insufficient',ARRAY['Nothing in the library covers fees. Adding a source does not automatically make it authoritative — mark it as firm policy so it is treated as binding.'],NULL);

INSERT INTO public.answer_citations (answer_id, position, source_id, passage_id, reason, is_conflict) VALUES
('a-method',0,'src-estg-6-1-4','p-025','Sets the quarter valuation base for zero-emission vehicles.',false),
('a-method',1,'src-estg-6-1-4','p-logbook','Sets out the logbook alternative.',false),
('a-method',2,'src-bmf-efahrzeuge','p-commute','Confirms the treatment of commuting journeys.',false),
('a-method',3,'src-firm-handbook-car','p-method','Current firm policy, effective 15 January 2026.',true),
('a-method',4,'src-firm-handbook-old-car','p-old-rule','Superseded firm policy, excluded from the answer.',true),
('a-escalation',0,'src-firm-handbook-car','p-escalation','Firm escalation rule for company-vehicle questions.',false),
('ka-car',0,'src-firm-handbook-car','p-checklist','Firm intake checklist.',false),
('ka-car',1,'src-estg-6-1-4','p-025','Statutory quarter valuation base.',false),
('ka-car',2,'src-firm-handbook-car','p-method','Firm rule on method selection.',false),
('ka-car',3,'src-firm-handbook-car','p-escalation','Firm escalation rule.',false),
('ka-conflict',0,'src-estg-6-1-4','p-025','Statutory rule.',false),
('ka-conflict',1,'src-bmf-efahrzeuge','p-ceiling','Explains the effect of exceeding the ceiling.',false),
('ka-conflict',2,'src-firm-handbook-car','p-method','Current version.',true),
('ka-conflict',3,'src-firm-handbook-old-car','p-old-rule','Superseded version.',true),
('ka-deadline',0,'src-firm-handbook-fristen','p-extension','Firm rule on extension requests.',false),
('ka-deadline',1,'src-ao-149','p-advised','Statutory basis for the extended period.',false);

INSERT INTO public.knowledge_entries (id, workspace_id, prompt, suggested, answer_id, position) VALUES
('k-car','ws-brandt','How do we handle an electric company car that is also used privately?',true,'ka-car',0),
('k-conflict','ws-brandt','Which valuation base do we apply to electric vehicles?',true,'ka-conflict',1),
('k-deadline','ws-brandt','When do we submit a filing extension for an advised client?',true,'ka-deadline',2),
('k-none','ws-brandt','What is our fee for a Jahresabschluss for a GmbH with 40 employees?',true,'ka-none',3);

INSERT INTO public.knowledge_retrievals (knowledge_entry_id, position, source_id, passage_id, used, note) VALUES
('k-car',0,'src-firm-handbook-car','p-checklist',true,'Closest match to ''what do we need''.'),
('k-car',1,'src-estg-6-1-4','p-025',true,'Statutory basis for the valuation.'),
('k-car',2,'src-firm-handbook-old-car','p-old-rule',false,'Excluded: superseded on 15 January 2026.'),
('k-conflict',0,'src-estg-6-1-4','p-025',true,'Statutory rule.'),
('k-conflict',1,'src-firm-handbook-old-car','p-old-rule',false,'Conflicting and superseded — surfaced to the reader rather than silently dropped.'),
('k-deadline',0,'src-firm-handbook-fristen','p-extension',true,'Direct match.'),
('k-deadline',1,'src-ao-149','p-advised',true,'Statutory backing.'),
('k-none',0,'src-firm-handbook-car','p-checklist',false,'Weak lexical match only; no fee content.');

INSERT INTO public.drafts (id, request_id, kind, title, recipient, subject, is_external, confidence, open_questions, status, generated_at) VALUES
('d-1042','r-1042','client_reply','Reply to client — outstanding items for the company vehicle','Sven Kastner, Nordlicht Handels GmbH','Your electric company car — what we still need (Mandant 10428)',true,'medium',ARRAY['The gross list price of 58,900 EUR was stated verbally. If the evidenced price exceeds the statutory ceiling, the valuation base changes and this reply must be corrected before sending.'],'draft','2026-07-28T08:14:00+02:00');

INSERT INTO public.draft_sections (draft_id, position, heading, body) VALUES
('d-1042',0,'Opening',E'Dear Mr Kastner,\n\nthank you for your message about the electric company car. Your colleague''s private use does have to appear on the payslip, and we can set this up before the next payroll run once four points are clarified.'),
('d-1042',1,'How the benefit is calculated','For a vehicle with no carbon dioxide emissions the monthly taxable benefit is normally calculated as 1 % of a quarter of the gross list price, provided that price stays below the statutory ceiling. Journeys between home and the office are added on the same basis. If your colleague keeps a proper logbook for the whole year, the actual private share can be used instead — but the method has to be fixed now, as a mid-year change is not possible.'),
('d-1042',2,'What we still need',E'1. The vehicle registration document (Zulassungsbescheinigung Teil II), so we can confirm the date of first registration.\n2. Written confirmation of the gross list price at first registration including optional equipment — the figure of 58,900 EUR you mentioned needs to be evidenced.\n3. The date on which the vehicle was first made available to your colleague.\n4. The one-way distance in kilometres between his home and your office.\n5. Your written decision on whether a logbook will be kept for the full year.'),
('d-1042',3,'Closing',E'If we have these by Thursday 30 July we can include the benefit in the July payroll run. Otherwise it will be corrected retrospectively in August.\n\nKind regards\nMiriam Radtke\nBrandt & Kollegen Steuerberatungsgesellschaft mbH');

INSERT INTO public.draft_section_citations (draft_id, section_position, position, source_id, passage_id, reason) VALUES
('d-1042',1,0,'src-estg-6-1-4','p-025','Quarter valuation base for zero-emission vehicles.'),
('d-1042',1,1,'src-firm-handbook-car','p-method','Firm rule against a mid-year change of method.'),
('d-1042',2,0,'src-firm-handbook-car','p-checklist','Firm intake checklist for a new company vehicle.');

INSERT INTO public.activity_events (id, workspace_id, at, actor, actor_name, action, detail, request_id, decision) VALUES
('ev-9','ws-brandt','2026-07-28T08:14:00+02:00','assistant','TaxHub assistant','Draft prepared','Prepared a client reply for REQ-2026-1042 listing five outstanding items. Marked as requiring review because the gross list price is unevidenced.','r-1042',NULL),
('ev-8','ws-brandt','2026-07-28T08:13:40+02:00','assistant','TaxHub assistant','Conflicting sources detected','Two versions of firm handbook 4.3 matched the query. The 2023 version was excluded as superseded.','r-1042',NULL),
('ev-7','ws-brandt','2026-07-28T08:13:00+02:00','assistant','TaxHub assistant','Missing information identified','Four of seven required intake items are outstanding; one is present but unevidenced.','r-1042',NULL),
('ev-6','ws-brandt','2026-07-28T08:12:30+02:00','assistant','TaxHub assistant','Request classified','Classified as Company car / benefit in kind. Confidence: high.','r-1042',NULL),
('ev-5','ws-brandt','2026-07-28T08:12:00+02:00','system','Email intake','Request received','Email from s.kastner@nordlicht-handels.example received and matched to Mandant 10428.','r-1042',NULL),
('ev-4','ws-brandt','2026-07-27T17:02:00+02:00','user','Jonas Ehlers','Draft approved and sent','Approved the extension request letter for REQ-2026-1038 after one edit.','r-1038','approved'),
('ev-3','ws-brandt','2026-07-27T16:48:00+02:00','user','Jonas Ehlers','Answer corrected','Corrected the assistant''s summary of the completeness threshold and linked firm handbook 2.1 as the governing source.','r-1038','corrected'),
('ev-2','ws-brandt','2026-07-27T11:22:00+02:00','assistant','TaxHub assistant','Intake sent to client','Six intake items requested from Kleve Gastro UG for the new employee registration.','r-1039',NULL),
('ev-1','ws-brandt','2026-07-26T10:15:00+02:00','user','Petra Seidel','Source added','Added firm handbook 4.3 (2026 version) and marked the 2023 version as superseded.',NULL,NULL);

INSERT INTO public.activity_event_sources (event_id, source_id, position) VALUES
('ev-9','src-estg-6-1-4',0),('ev-9','src-firm-handbook-car',1),('ev-9','src-firm-template-reply',2),
('ev-8','src-firm-handbook-car',0),('ev-8','src-firm-handbook-old-car',1),
('ev-7','src-firm-handbook-car',0),
('ev-3','src-firm-handbook-fristen',0),
('ev-1','src-firm-handbook-car',0),('ev-1','src-firm-handbook-old-car',1);
