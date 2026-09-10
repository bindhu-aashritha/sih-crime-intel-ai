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
  const [statusMsg, setStatusMsg] = useState('');
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
      setStatusMsg('⚠️ Could not connect to backend API (Is FastAPI running on port 8000?)');
    }
  };

  // Filter graph nodes when user selects a search entity
  const handleSearchSelect = (selectedEntity) => {
    setActiveFilter(selectedEntity);
    
    if (!selectedEntity) {
      setFilteredGraph(graphData); // Reset to display full network
      return;
    }

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
    setStatusMsg('Ingesting raw synthetic data into Neo4j...');
    try {
      const res = await triggerIngest();
      setStatusMsg(`✅ Success: ${res.message || 'Dataset ingested into Neo4j'}`);
      await loadData(); // Reload graph data automatically
    } catch (err) {
      console.error('Failed to ingest synthetic data:', err);
      setStatusMsg('❌ Ingestion failed. Ensure FastAPI is running and Neo4j container is up.');
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
          padding: '20px 24px',
          borderRadius: '8px',
          color: '#ffffff',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>
            NCRB — AI Criminal Network Intelligence System
          </h2>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>PS ID: 26189 | Ministry of Home Affairs</span>
        </div>

        <div>
          <button
            onClick={handleIngest}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#64748b' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap'
            }}
          >
            {loading ? 'Ingesting Data...' : '⚡ Ingest Synthetic Dataset'}
          </button>
        </div>
      </header>

      {/* Status Bar Notification */}
      {statusMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#e2e8f0', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
          {statusMsg}
        </div>
      )}

      {/* Search Bar */}
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