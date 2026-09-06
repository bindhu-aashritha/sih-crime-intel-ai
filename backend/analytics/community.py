import networkx as nx

def detect_criminal_communities(edges: list):
    G = nx.Graph()
    for e in edges:
        G.add_edge(e["source"], e["target"])

    if len(G) == 0:
        return []

    # Community detection using Louvain-like Greedy Modularity
    communities = nx.community.greedy_modularity_communities(G)
    
    result = []
    for idx, comm in enumerate(communities):
        result.append({
            "community_id": f"Gang/Sub-network {idx + 1}",
            "members": list(comm),
            "size": len(comm)
        })
    return result