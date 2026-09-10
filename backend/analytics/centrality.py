import networkx as nx

def find_key_influencers(driver):
    query = """
    MATCH (a)-[r]->(b)
    RETURN coalesce(a.name, a.phone, a.fir_id, 'Unknown') AS source,
           coalesce(b.name, b.phone, b.fir_id, 'Unknown') AS target
    """
    
    G = nx.DiGraph()
    with driver.session() as session:
        results = session.run(query)
        for record in results:
            src = record["source"]
            tgt = record["target"]
            if src and tgt and src != 'Unknown' and tgt != 'Unknown':
                G.add_edge(src, tgt)

    if len(G) == 0:
        return []

    # Calculate Betweenness Centrality
    betweenness = nx.betweenness_centrality(G)

    # Calculate PageRank safely with fallbacks
    try:
        pagerank = nx.pagerank(G)
    except Exception:
        # Fallback if scipy is missing or graph has convergence issues
        pagerank = {node: 0.0 for node in G.nodes()}

    ranked_influencers = []
    for node in G.nodes():
        ranked_influencers.append({
            "person": node,
            "betweenness_score": round(betweenness[node], 4),
            "pagerank_score": round(pagerank[node], 4)
        })

    return sorted(ranked_influencers, key=lambda x: x["betweenness_score"], reverse=True)