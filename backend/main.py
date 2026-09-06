from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import os
import json

from backend.graph.neo4j_client import KnowledgeGraphDB
from backend.nlp.ner_extractor import EntityExtractor
from backend.ingestion.cdr_parser import CDRParser
from backend.ingestion.financial_parser import FinancialParser
from backend.analytics.centrality import find_key_influencers
from backend.analytics.community import detect_criminal_communities
from backend.analytics.pattern_engine import detect_suspicious_patterns

app = FastAPI(title="AI Criminal Network Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

db = KnowledgeGraphDB()
ner = EntityExtractor()

@app.get("/")
def root():
    return {"status": "System operational", "version": "1.0.0"}

@app.post("/api/v1/ingest/synthetic")
def ingest_synthetic_data():
    """Reads raw generated files and populates Neo4j."""
    # Ingest CDRs
    if os.path.exists("data/raw/cdrs.csv"):
        cdrs = CDRParser.parse_cdr_csv("data/raw/cdrs.csv")
        for record in cdrs:
            db.add_cdr_event(record["caller"], record["receiver"], record["duration"], record["timestamp"])

    # Ingest Transfers
    if os.path.exists("data/raw/financial_transfers.csv"):
        transfers = FinancialParser.parse_transfers_csv("data/raw/financial_transfers.csv")
        for record in transfers:
            db.add_financial_transaction(record["sender"], record["receiver"], record["amount"], record["transaction_id"], record["timestamp"])

    # Ingest FIRs
    if os.path.exists("data/raw/firs.json"):
        with open("data/raw/firs.json", "r") as f:
            firs = json.load(f)
            for fir in firs:
                entities = ner.extract_from_fir(fir["description"])
                db.add_fir_entities(fir["fir_id"], fir["description"], entities)

    return {"message": "Data successfully ingested into Graph DB"}

@app.get("/api/v1/graph")
def get_graph():
    return {"graph": db.fetch_full_graph()}

@app.get("/api/v1/analytics/influencers")
def get_influencers():
    return {"key_influencers": find_key_influencers(db.driver)}

@app.get("/api/v1/analytics/communities")
def get_communities():
    edges = db.fetch_full_graph()
    return {"communities": detect_criminal_communities(edges)}