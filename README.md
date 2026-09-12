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
### Stack Components

* **Frontend UI:** React.js (Fast UI component lifecycle management and state isolation)
* **Graph Visualization:** vis-network via HTML5 Canvas (High-performance canvas rendering with custom physics solvers)
* **Backend REST API:** FastAPI with Python 3.10+ (High asynchronous I/O performance via Uvicorn with native Python NLP hooks)
* **Graph Database:** Neo4j (Optimized property graph storage for multi-hop node traversals)
* **NLP Engine:** spaCy (Cython-optimized, industrial-grade speed for entity extraction over JVM frameworks)
* **Analytics Engine:** NetworkX / Native Math (Dual-layer calculation of Degree and Betweenness centrality)
* **PDF Reporting:** html2canvas + jsPDF (Zero-dependency client-side vector export preventing server overhead)

---

## Research Foundations & Standards

This project bridges theoretical graph mechanics with operational law enforcement standards:

1. **ForceAtlas2 Layout Physics:** Jacomy, M., et al. (2014). "ForceAtlas2, a Continuous Graph Layout Algorithm." PLOS ONE, 9(6).
2. **Social Network Centrality:** Freeman, L. C. (1978). "Centrality in Social Networks: Conceptual Clarification." Social Networks, 1(3).
3. **NCRB CCTNS Guidelines:** Complies with India's National Crime Records Bureau data inter-operability standards for FIR mapping.
4. **UNODC Link-Charting Manual:** Follows the United Nations Office on Drugs and Crime guidelines for criminal intelligence visual charting.

---

## Repository Structure

├── backend/
│   ├── main.py                  # FastAPI server entry point & REST endpoints
│   ├── kaggle_ingestor.py       # Real-world Kaggle crime dataset ETL pipeline
│   ├── nlp_processor.py         # spaCy Entity Recognition & Fuzzy Matching module
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GraphCanvas.jsx  # vis-network physics layout container
│   │   │   ├── DossierExport.jsx# Client-side jsPDF reporting module
│   │   │   └── AnalyticsPanel.jsx# Centrality ranking list
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
└── README.md


---

## Installation & Setup

### 1. Prerequisites
* Python 3.10+
* Node.js v18+ & npm
* Neo4j Desktop or Server Instance running locally (`bolt://localhost:7687`)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Transform Kaggle CSV data into graph schema
python kaggle_ingestor.py

# Start FastAPI server
uvicorn main:app --reload --port 8000

API Swagger Documentation will be available at http://localhost:8000/docs.

3. Frontend Setup
Bash
cd frontend
npm install
npm start
Access the application dashboard at http://localhost:3000.

Live System Demo & PDF Export
Load Network: Data loads dynamically from Kaggle dataset endpoints.

Physics Stabilization: Graph auto-arranges nodes using ForceAtlas2 physics to avoid clutter.

Filter & Search: Investigators can search suspects by name or 1-hop connections.

Export Dossier: Click "Generate PDF Dossier" to trigger a client-side vector export generating standard NCRB intelligence reports.

License
This project is developed for the Smart India Hackathon (SIH) 2026.