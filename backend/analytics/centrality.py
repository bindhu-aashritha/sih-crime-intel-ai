import networkx as nx
from neo4j import GraphDatabase

def find_key_influencers(driver):
    """Fetches graph from Neo4j and computes Betweenness Centrality."""
    query = "MATCH (a:Person)-[r]->(b:Person) RETURN a.name AS source, b.name AS target"
    
    G = nx.DiGraph()
    with driver.session() as session:
        results = session.run(query)
        for record in results:
            G.add_edge(record["source"], record["target"])

    if len(G) == 0:
        return []

    # Betweenness Centrality identifies gatekeepers/key influencers bridging subgroups
    betweenness = nx.betweenness_centrality(G)
    pagerank = nx.pagerank(G)

    ranked_influencers = []
    for node in G.nodes():
        ranked_influencers.append({
            "person": node,
            "betweenness_score": round(betweenness[node], 4),
            "pagerank_score": round(pagerank[node], 4)
        })

    # Sort by highest betweenness score
    return sorted(ranked_influencers, key=lambda x: x["betweenness_score"], reverse=True)