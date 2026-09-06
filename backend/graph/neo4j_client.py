from neo4j import GraphDatabase
import os

class KnowledgeGraphDB:
    def __init__(self):
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USER", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def add_cdr_event(self, caller: str, receiver: str, duration: int, timestamp: str):
        query = """
        MERGE (p1:Person {phone: $caller})
        MERGE (p2:Person {phone: $receiver})
        CREATE (p1)-[:CALLED {duration: $duration, timestamp: $timestamp}]->(p2)
        """
        with self.driver.session() as session:
            session.run(query, caller=caller, receiver=receiver, duration=duration, timestamp=timestamp)

    def add_financial_transaction(self, sender: str, receiver: str, amount: float, txn_id: str, timestamp: str):
        query = """
        MERGE (p1:Person {phone: $sender})
        MERGE (p2:Person {phone: $receiver})
        CREATE (p1)-[:TRANSFERRED {amount: $amount, txn_id: $txn_id, timestamp: $timestamp}]->(p2)
        """
        with self.driver.session() as session:
            session.run(query, sender=sender, receiver=receiver, amount=amount, txn_id=txn_id, timestamp=timestamp)

    def add_fir_entities(self, fir_id: str, text: str, entities: dict):
        query = """
        MERGE (f:Incident {fir_id: $fir_id})
        SET f.description = $text
        WITH f
        UNWIND $persons AS person_name
            MERGE (p:Person {name: person_name})
            MERGE (p)-[:MENTIONED_IN]->(f)
        WITH f
        UNWIND $locations AS loc_name
            MERGE (l:Location {name: loc_name})
            MERGE (f)-[:OCCURRED_AT]->(l)
        """
        with self.driver.session() as session:
            session.run(
                query,
                fir_id=fir_id,
                text=text,
                persons=entities.get("PER", []),
                locations=entities.get("LOC", [])
            )

    def fetch_full_graph(self):
        query = """
        MATCH (n)-[r]->(m)
        RETURN labels(n)[0] AS source_type, 
               coalesce(n.name, n.phone, n.fir_id) AS source,
               type(r) AS relationship,
               labels(m)[0] AS target_type, 
               coalesce(m.name, m.phone, m.fir_id) AS target
        LIMIT 200
        """
        with self.driver.session() as session:
            results = session.run(query)
            edges = []
            for r in results:
                edges.append({
                    "source": r["source"],
                    "source_type": r["source_type"],
                    "target": r["target"],
                    "target_type": r["target_type"],
                    "relationship": r["relationship"]
                })
            return edges