import React, { useState, useEffect } from 'react';
import GraphCanvas from './components/GraphCanvas';
import InfluencerPanel from './components/InfluencerPanel';
import SearchBar from './components/SearchBar';
import { fetchGraphData, fetchInfluencers, fetchCommunities, triggerIngest } from './api';

function App() {
  const [graphData, setGraphData] = useState([]);
  const [filteredGraph, setFilteredGraph] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  // Fetch all graph & intelligence data from FastAPI backend
  const loadData = async () => {
    try {
      const graph = await fetchGraphData();
      const infs = await fetchInfluencers();
      const comms = await fetchCommunities();
      
      setGraphData(graph || []);
      setFilteredGraph(graph || []);
      setInfluencers(infs || []);
      setCommunities(comms || []);
    } catch (err) {
      console.error('Error connecting to Backend API:', err);
    }
  };

  // Filter graph nodes when user selects a search entity
  const handleSearchSelect = (selectedEntity) => {
    setActiveFilter(selectedEntity);
    
    if (!selectedEntity) {
      setFilteredGraph(graphData); // Reset to display full network
      return;
    }

    // Filter connections where the selected entity is either the source or target
    const connections = graphData.filter(
      (edge) =>
        (edge.source && edge.source.toLowerCase() === selectedEntity.toLowerCase()) ||
        (edge.target && edge.target.toLowerCase() === selectedEntity.toLowerCase())
    );

    setFilteredGraph(connections);
  };

  // Trigger synthetic data ingestion into Neo4j
  const handleIngest = async () => {
    setLoading(true);
    try {
      await triggerIngest();
      await loadData(); // Reload graph data automatically
    } catch (err) {
      console.error('Failed to ingest synthetic data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      {/* Header Section */}
      <header
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          backgroundColor: '#1e293b',
          padding: '16px 24px',
          borderRadius: '8px',
          color: '#ffffff',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            NCRB — AI Criminal Network Intelligence System
          </h2>
          <small style={{ color: '#94a3b8' }}>PS ID: 26189 | Ministry of Home Affairs</small>
        </div>

        <button
          onClick={handleIngest}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#64748b' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? 'Ingesting Data...' : '⚡ Ingest Synthetic Dataset'}
        </button>
      </header>

      {/* Search & Active Filter Bar */}
      <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <SearchBar graphData={graphData} onSearchSelect={handleSearchSelect} />
        
        {activeFilter && (
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#0284c7' }}>
            Showing 1-hop sub-network connections for: <strong>{activeFilter}</strong> ({filteredGraph.length} relationships found)
          </div>
        )}
      </div>

      {/* Main Grid View */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <GraphCanvas graphData={filteredGraph} />
        </div>

        <div>
          <InfluencerPanel influencers={influencers} communities={communities} />
        </div>
      </div>
    </div>
  );
}

export default App;