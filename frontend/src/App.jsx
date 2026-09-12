import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
  const [exporting, setExporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);
  
  const [selectedEntityInfo, setSelectedEntityInfo] = useState(null);
  const [timeStep, setTimeStep] = useState(100);

  const reportRef = useRef(null);

  const loadData = async () => {
    try {
      const graph = await fetchGraphData();
      const infs = await fetchInfluencers();
      const comms = await fetchCommunities();
      
      setGraphData(graph || []);
      setFilteredGraph(graph || []);
      setInfluencers(infs || []);
      setCommunities(comms || []);
      setTimeStep((graph || []).length);
    } catch (err) {
      console.error('Error connecting to Backend API:', err);
      setStatusMsg('⚠️ Could not connect to backend API (Is FastAPI running on port 8000?)');
    }
  };

  const handleSearchSelect = (selectedEntity) => {
    setActiveFilter(selectedEntity);
    setSelectedEntityInfo(null);
    
    if (!selectedEntity) {
      setFilteredGraph(graphData);
      return;
    }

    const connections = graphData.filter(
      (edge) =>
        (edge.source && edge.source.toLowerCase() === selectedEntity.toLowerCase()) ||
        (edge.target && edge.target.toLowerCase() === selectedEntity.toLowerCase())
    );

    setFilteredGraph(connections);
  };

  const handleNodeSelect = ({ id, nodeData, connections }) => {
    const relatedEntities = connections.map(c => c.source === id ? c.target : c.source);
    const relTypes = Array.from(new Set(connections.map(c => c.relationship)));
    
    const isPhone = /^\d{10,12}$/.test(id);
    const isFIR = id.startsWith('FIR-');
    
    let riskLevel = 'MEDIUM';
    let roleSummary = '';

    if (connections.length >= 4) {
      riskLevel = 'HIGH / CRITICAL';
      roleSummary = `Acts as a primary nexus node connecting ${connections.length} different entities across multiple channels.`;
    } else if (isPhone) {
      riskLevel = 'HIGH';
      roleSummary = `Monitored cellular endpoint involved in financial transaction routes and CDR communication logs.`;
    } else if (isFIR) {
      riskLevel = 'CASE FILE';
      roleSummary = `Registered police case document anchoring suspects, locations, and incident details.`;
    } else {
      roleSummary = `Associated suspect entity linked to active investigation records.`;
    }

    setSelectedEntityInfo({
      id,
      riskLevel,
      roleSummary,
      degree: connections.length,
      relTypes: relTypes.join(', '),
      connectedList: relatedEntities.slice(0, 5).join(', ') + (relatedEntities.length > 5 ? '...' : '')
    });
  };

  // Detailed Formal PDF Briefing Generator with Per-FIR Case Table Breakdowns
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    setStatusMsg('📄 Generating Detailed Intelligence Dossier with Per-FIR Case Tables...');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const activeEdges = filteredGraph.length > 0 ? filteredGraph : graphData;

      // 1. Calculate Node Degrees and Types
      const nodeDegrees = {};
      const nodeTypes = {};
      
      activeEdges.forEach((edge) => {
        const src = edge.source;
        const tgt = edge.target;

        if (src) nodeDegrees[src] = (nodeDegrees[src] || 0) + 1;
        if (tgt) nodeDegrees[tgt] = (nodeDegrees[tgt] || 0) + 1;

        [src, tgt].forEach((id) => {
          if (!id) return;
          if (id.startsWith('FIR-')) nodeTypes[id] = 'FIR Case Document';
          else if (/^\d{10,12}$/.test(id)) nodeTypes[id] = 'Phone (CDR Log)';
          else if (['Mumbai', 'Bandra', 'MG Road', 'Bengaluru', 'Chandigarh', 'Fitan'].some(loc => id.includes(loc))) {
            nodeTypes[id] = 'Location / City';
          } else {
            nodeTypes[id] = 'Suspect Entity';
          }
        });
      });

      // 2. Group Relationships by FIR Case anchors
      const firGroups = {};
      const generalEdges = [];

      activeEdges.forEach((edge) => {
        const src = edge.source || '';
        const tgt = edge.target || '';
        const rel = edge.relationship || edge.type || 'LINKED_TO';

        let assignedFIR = null;
        if (src.startsWith('FIR-')) assignedFIR = src;
        else if (tgt.startsWith('FIR-')) assignedFIR = tgt;

        if (assignedFIR) {
          if (!firGroups[assignedFIR]) firGroups[assignedFIR] = [];
          firGroups[assignedFIR].push({ source: src, relationship: rel, target: tgt });
        } else {
          generalEdges.push({ source: src, relationship: rel, target: tgt });
        }
      });

      // Page 1: Header & Executive Summary
      pdf.setFillColor(30, 41, 59); // Slate banner
      pdf.rect(0, 0, pageWidth, 40, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('NATIONAL CRIME RECORDS BUREAU (NCRB)', 14, 18);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('CONFIDENTIAL // LAW ENFORCEMENT INTELLIGENCE BRIEF', 14, 26);
      pdf.text(`REPORT GENERATED: ${new Date().toLocaleString()}`, 14, 32);

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('1. INVESTIGATIVE EXECUTIVE SUMMARY', 14, 52);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const firKeys = Object.keys(firGroups);
      const summaryText = [
        `This automated Case Intelligence Brief synthesizes relationships extracted across CDR logs, bank transfer ledgers, and registered FIR documents.`,
        `Scope includes ${activeEdges.length} active relationships spanning ${firKeys.length} distinct FIR case files and ${communities.length} syndicate clusters.`,
        `Identified FIR Case Anchors: ${firKeys.join(', ') || 'None detected'}.`
      ];

      let yPos = 60;
      summaryText.forEach(line => {
        pdf.text(line, 14, yPos);
        yPos += 6;
      });

      // Target Entity Analysis if node selected
      if (selectedEntityInfo) {
        pdf.setFillColor(241, 245, 249);
        pdf.rect(14, yPos + 2, pageWidth - 28, 38, 'F');
        pdf.setDrawColor(37, 99, 235);
        pdf.rect(14, yPos + 2, pageWidth - 28, 38, 'S');

        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text(`TARGET ENTITY DOSSIER: ${selectedEntityInfo.id}`, 20, yPos + 10);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(15, 23, 42);
        pdf.text(`Calculated Risk Assessment: ${selectedEntityInfo.riskLevel}`, 20, yPos + 18);
        pdf.text(`Direct Network Degree: ${selectedEntityInfo.degree} connected nodes`, 20, yPos + 24);
        pdf.text(`Communication Vectors: ${selectedEntityInfo.relTypes}`, 20, yPos + 30);
        pdf.text(`Key Connections: ${selectedEntityInfo.connectedList}`, 20, yPos + 36);
        yPos += 46;
      } else {
        yPos += 6;
      }

      // Add Screenshot Capture of Graph Map
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text('2. OVERALL NETWORK TOPOLOGY VISUALIZATION', 14, yPos);

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true
      });
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = pageWidth - 28;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const maxImgH = Math.min(imgHeight, 95);
      pdf.addImage(imgData, 'PNG', 14, yPos + 4, imgWidth, maxImgH);
      yPos += maxImgH + 12;

      // -------------------------------------------------------------
      // 3. INDIVIDUAL TABLES FOR EACH FIR CASE FILE
      // -------------------------------------------------------------
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('3. PER-FIR CASE BREAKDOWN TABLES', 14, yPos);
      yPos += 8;

      if (firKeys.length > 0) {
        firKeys.forEach((firId, index) => {
          if (yPos > pageHeight - 35) {
            pdf.addPage();
            yPos = 20;
          }

          // FIR Section Title
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(37, 99, 235);
          pdf.text(`CASE FILE BREAKDOWN: ${firId} (${firGroups[firId].length} linked relationships)`, 14, yPos);
          yPos += 4;

          // Table Header
          pdf.setFillColor(241, 245, 249);
          pdf.rect(14, yPos, pageWidth - 28, 6, 'F');
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(15, 23, 42);
          pdf.text('SOURCE ENTITY', 16, yPos + 4);
          pdf.text('RELATIONSHIP / VECTOR', 75, yPos + 4);
          pdf.text('TARGET / LOCATION / SUSPECT', 135, yPos + 4);
          pdf.line(14, yPos + 6, pageWidth - 14, yPos + 6);

          yPos += 10;
          pdf.setFont('helvetica', 'normal');

          firGroups[firId].forEach((edge) => {
            if (yPos > pageHeight - 18) {
              pdf.addPage();
              yPos = 20;
            }
            pdf.text(String(edge.source).slice(0, 30), 16, yPos);
            pdf.text(`-- [ ${edge.relationship} ] -->`, 75, yPos);
            pdf.text(String(edge.target).slice(0, 30), 135, yPos);
            yPos += 6;
          });

          yPos += 6; // Spacing between FIR tables
        });
      }

      // Remaining Non-FIR / General CDR Relationships Table
      if (generalEdges.length > 0) {
        if (yPos > pageHeight - 35) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(37, 99, 235);
        pdf.text(`DIRECT INTER-ENTITY RELATIONSHIPS / CDR TRANSFERS (${generalEdges.length} links)`, 14, yPos);
        yPos += 4;

        pdf.setFillColor(241, 245, 249);
        pdf.rect(14, yPos, pageWidth - 28, 6, 'F');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(15, 23, 42);
        pdf.text('SOURCE ENTITY', 16, yPos + 4);
        pdf.text('RELATIONSHIP / VECTOR', 75, yPos + 4);
        pdf.text('TARGET ENTITY', 135, yPos + 4);
        pdf.line(14, yPos + 6, pageWidth - 14, yPos + 6);

        yPos += 10;
        pdf.setFont('helvetica', 'normal');

        generalEdges.slice(0, 12).forEach((edge) => {
          if (yPos > pageHeight - 18) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(String(edge.source).slice(0, 30), 16, yPos);
          pdf.text(`-- [ ${edge.relationship} ] -->`, 75, yPos);
          pdf.text(String(edge.target).slice(0, 30), 135, yPos);
          yPos += 6;
        });

        if (generalEdges.length > 12) {
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(8);
          pdf.text(`... and ${generalEdges.length - 12} additional transfers/calls.`, 16, yPos);
          yPos += 8;
        }
      }

      // Page 2: Centrality Rankings & Communities
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('4. KEY INFLUENCERS & CENTRALITY RANKINGS TABLE', 14, 20);

      const calculatedInfluencers = Object.entries(nodeDegrees)
        .map(([nodeId, degree]) => {
          const score = (degree / (graphData.length || 1)).toFixed(4);
          return { id: nodeId, name: nodeId, degree, score, type: nodeTypes[nodeId] || 'Entity' };
        })
        .sort((a, b) => b.degree - a.degree);

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setFillColor(226, 232, 240);
      pdf.rect(14, 26, pageWidth - 28, 7, 'F');
      pdf.text('#', 16, 31);
      pdf.text('ENTITY ID / NAME', 24, 31);
      pdf.text('ENTITY TYPE', 85, 31);
      pdf.text('SCORE', 140, 31);
      pdf.text('DEGREE', 170, 31);
      pdf.line(14, 33, pageWidth - 14, 33);

      pdf.setFont('helvetica', 'normal');
      let rowY = 39;

      calculatedInfluencers.slice(0, 15).forEach((inf, idx) => {
        pdf.text(`${idx + 1}`, 16, rowY);
        pdf.text(`${inf.name}`.slice(0, 32), 24, rowY);
        pdf.text(`${inf.type}`, 85, rowY);
        pdf.text(`${inf.score}`, 140, rowY);
        pdf.text(`${inf.degree}`, 170, rowY);
        rowY += 6;
      });

      rowY += 8;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('5. DETECTED SYNDICATE CLUSTERS (COMMUNITIES)', 14, rowY);

      rowY += 8;
      if (communities && communities.length > 0) {
        communities.forEach((comm, idx) => {
          if (rowY > pageHeight - 20) {
            pdf.addPage();
            rowY = 20;
          }
          const membersList = Array.isArray(comm) 
            ? comm 
            : (comm.members || comm.nodes || comm.community || []);

          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Cluster / Gang #${idx + 1} (${membersList.length} members)`, 14, rowY);
          
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Members: ${membersList.length > 0 ? membersList.join(', ') : 'N/A'}`, 14, rowY + 5);
          rowY += 12;
        });
      } else {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text('No community clusters detected.', 14, rowY);
      }

      pdf.save(`NCRB_Intelligence_Brief_${new Date().toISOString().slice(0, 10)}.pdf`);
      setStatusMsg('✅ Detailed Intelligence Report with Per-FIR Tables downloaded successfully!');
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setStatusMsg('❌ Failed to generate PDF report.');
    } finally {
      setExporting(false);
    }
  };

  const handleIngest = async () => {
    setLoading(true);
    setStatusMsg('Ingesting raw synthetic data into Neo4j...');
    try {
      const res = await triggerIngest();
      setStatusMsg(`✅ Success: ${res.message || 'Dataset ingested into Neo4j'}`);
      await loadData();
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
      {/* Header */}
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

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            style={{
              padding: '12px 20px',
              backgroundColor: exporting ? '#64748b' : '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: exporting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {exporting ? 'Generating PDF...' : '📄 Generate Detailed Case Brief (PDF)'}
          </button>

          <button
            onClick={handleIngest}
            disabled={loading}
            style={{
              padding: '12px 20px',
              backgroundColor: loading ? '#64748b' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {loading ? 'Ingesting Data...' : '⚡ Ingest Synthetic Dataset'}
          </button>
        </div>
      </header>

      {/* Status Bar */}
      {statusMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#e2e8f0', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>
          {statusMsg}
        </div>
      )}

      {/* Search Bar & Timeline Filter Control */}
      <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <SearchBar graphData={graphData} onSearchSelect={handleSearchSelect} />
        
        {/* Time Series Slider Control */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', whiteSpace: 'nowrap' }}>
            ⏱ Network Evolution Timeline:
          </label>
          <input
            type="range"
            min="1"
            max={graphData.length || 100}
            value={timeStep}
            onChange={(e) => setTimeStep(Number(e.target.value))}
            style={{ flex: 1, cursor: 'pointer' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#2563eb', minWidth: '130px' }}>
            Showing {timeStep} / {graphData.length} edges
          </span>
        </div>

        {activeFilter && (
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#0284c7' }}>
            Showing 1-hop sub-network connections for: <strong>{activeFilter}</strong> ({filteredGraph.length} relationships found)
          </div>
        )}
      </div>

      {/* AI Intelligence Brief Card */}
      {selectedEntityInfo && (
        <div style={{
          backgroundColor: '#1e1b4b',
          color: '#ffffff',
          padding: '18px 22px',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: selectedEntityInfo.riskLevel.includes('HIGH') ? '6px solid #ef4444' : '6px solid #3b82f6',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '16px', color: '#a5b4fc' }}>
              🤖 AI Intelligence Brief — Entity: <span style={{ color: '#ffffff', textDecoration: 'underline' }}>{selectedEntityInfo.id}</span>
            </h4>
            <span style={{
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold',
              backgroundColor: selectedEntityInfo.riskLevel.includes('HIGH') ? '#dc2626' : '#2563eb',
              color: '#ffffff'
            }}>
              RISK ASSESSMENT: {selectedEntityInfo.riskLevel}
            </span>
          </div>

          <p style={{ margin: '10px 0 12px 0', fontSize: '14px', lineHeight: '1.5', color: '#e0e7ff' }}>
            <strong>Analysis:</strong> {selectedEntityInfo.roleSummary}
          </p>

          <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: '#c7d2fe' }}>
            <div><strong>Direct Connections:</strong> {selectedEntityInfo.degree} nodes</div>
            <div><strong>Interaction Types:</strong> {selectedEntityInfo.relTypes}</div>
            <div><strong>Linked Network:</strong> {selectedEntityInfo.connectedList}</div>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px' }}>
        <div ref={reportRef} style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <GraphCanvas graphData={filteredGraph} onNodeSelect={handleNodeSelect} timeRange={timeStep} />
        </div>

        <div>
          <InfluencerPanel influencers={influencers} communities={communities} />
        </div>
      </div>
    </div>
  );
}

export default App;