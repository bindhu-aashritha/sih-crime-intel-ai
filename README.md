# AI-Powered Criminal Network Analysis & Automated Dossier System

An end-to-end intelligence link-charting and graph analytics engine built to assist Law Enforcement Agencies (LEAs) in untangling multi-layered criminal syndicates, mapping entity relationships, and generating courtroom-ready PDF dossiers in seconds.

---

## Executive Summary

Manual cross-referencing of Call Detail Records (CDRs), financial transaction logs, and unstructured First Information Reports (FIRs) in spreadsheets takes hours and conceals hidden facilitators. 

This platform ingests real-world, multi-source crime data, parses unstructured text via NLP, constructs a property graph in Neo4j, and renders an interactive canvas interface using dynamic physics layouts. It automatically calculates centrality metrics to flag hidden gang kingpins and exports standardized intelligence dossiers compliant with National Crime Records Bureau (NCRB) CCTNS standards.

---

## Key Features

* **Multi-Source Real Data Ingestion:** ETL pipeline processing Kaggle real-world Indian police FIR datasets, CDR call dumps (CSV), and financial transaction streams.
* **NLP & Fuzzy Entity Resolution:** Extracts entities (PERSON, LOCATION, ORGANIZATION) from unstructured FIR text using spaCy and merges duplicate suspect profiles using Levenshtein distance matching.
* **Physics-Stabilized Canvas Workspace:** Interactive frontend graph visualizer using vis-network with tuned ForceAtlas2 repulsion physics (gravitationalConstant: -70, springLength: 110) to eliminate node/label overlap.
* **Dual Centrality Analytics Engine:**
  * **Degree Centrality:** Measures direct communication volume.
  * **Betweenness Centrality:** Identifies bridge entities and middleman brokers connecting isolated criminal cells.
* **One-Click NCRB Intelligence Dossier Export:** Dynamic, zero-latency client-side PDF reporting via jsPDF and html2canvas (2x DPR Retinal scaling) featuring per-FIR case relationship tables.
* **UNODC Standard Color Coding:**
  * **Green:** Suspect Entities / Individuals
  * **Red:** Phone Numbers / CDR Call Records
  * **Purple:** FIR Case Documents
  * **Blue:** Incident Locations / Cities

---

## Architecture & Technology Stack