import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';

const GraphCanvas = ({ graphData, onNodeSelect, timeRange }) => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const nodePositionsRef = useRef(new Map());

  const savePositions = () => {
    if (!networkRef.current) return;
    try {
      const net = networkRef.current;
      if (net.body && net.body.nodeIndices && net.body.nodeIndices.length > 0) {
        const positions = net.getPositions();
        if (positions) {
          Object.keys(positions).forEach((nodeId) => {
            nodePositionsRef.current.set(nodeId, positions[nodeId]);
          });
        }
      }
    } catch (e) {
      // Suppress transient vis-network cleanup errors
    }
  };

  const styleNode = (id, group, type) => {
    const label = String(id || '');

    // 1. Phone Numbers (CDR Data)
    if (/^\d{10,12}$/.test(label) || type === 'Phone' || group === 'Phone') {
      return {
        id,
        label,
        shape: 'dot',
        size: 16,
        color: {
          background: '#ef4444',
          border: '#991b1b',
          highlight: { background: '#f87171', border: '#7f1d1d' }
        },
        font: {
          color: '#0f172a',
          size: 11,
          face: 'Arial, sans-serif',
          bold: true,
          strokeWidth: 3,
          strokeColor: '#ffffff'
        }
      };
    }

    // 2. FIR Documents
    if (label.startsWith('FIR-') || type === 'FIR' || group === 'FIR') {
      return {
        id,
        label,
        shape: 'box',
        margin: 8,
        color: {
          background: '#7c3aed',
          border: '#5b21b6',
          highlight: { background: '#8b5cf6', border: '#4c1d95' }
        },
        font: {
          color: '#ffffff',
          size: 12,
          face: 'Arial, sans-serif',
          bold: true,
          strokeWidth: 0
        }
      };
    }

    // 3. Locations
    if (
      ['bandra', 'mumbai', 'bengaluru', 'chandigarh', 'mg road', 'fitan'].some((loc) =>
        label.toLowerCase().includes(loc)
      ) ||
      type === 'Location' ||
      group === 'Location'
    ) {
      return {
        id,
        label,
        shape: 'ellipse',
        margin: 6,
        color: {
          background: '#0284c7',
          border: '#0369a1',
          highlight: { background: '#38bdf8', border: '#075985' }
        },
        font: {
          color: '#ffffff',
          size: 11,
          face: 'Arial, sans-serif',
          bold: true,
          strokeWidth: 0
        }
      };
    }

    // 4. Default: Person / Suspect
    return {
      id,
      label,
      shape: 'dot',
      size: 20,
      color: {
        background: '#10b981',
        border: '#047857',
        highlight: { background: '#34d399', border: '#065f46' }
      },
      font: {
        color: '#0f172a',
        size: 12,
        face: 'Arial, sans-serif',
        bold: true,
        strokeWidth: 3,
        strokeColor: '#ffffff'
      }
    };
  };

  useEffect(() => {
    if (!containerRef.current || !graphData || graphData.length === 0) return;

    savePositions();

    const activeData = graphData.filter((item, idx) => {
      if (timeRange === undefined || timeRange === null) return true;
      const step = item.timestamp ? new Date(item.timestamp).getTime() : idx + 1;
      return step <= timeRange;
    });

    const nodesMap = new Map();
    const edges = [];

    activeData.forEach((item, index) => {
      if (!nodesMap.has(item.source)) {
        nodesMap.set(item.source, styleNode(item.source, item.source_group, item.source_type));
      }

      if (!nodesMap.has(item.target)) {
        nodesMap.set(item.target, styleNode(item.target, item.target_group, item.target_type));
      }

      edges.push({
        id: `e_${index}`,
        from: item.source,
        to: item.target,
        label: item.relationship || '',
        font: {
          size: 10,
          align: 'middle',
          color: '#334155',
          face: 'Arial, sans-serif',
          background: '#ffffff', // Ensures label text remains crisp and readable
          strokeWidth: 0
        },
        arrows: { to: { enabled: true, scaleFactor: 0.8 } },
        color: { color: '#64748b', highlight: '#2563eb' }, // Darker grey edge lines for clarity
        smooth: { type: 'continuous' }
      });
    });

    const data = {
      nodes: Array.from(nodesMap.values()),
      edges: edges
    };

    // BALANCED FORCE ATLAS 2 LAYOUT
    const options = {
      nodes: { borderWidth: 2 },
      physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -70, // Balanced repulsion so nodes stay grouped together
          centralGravity: 0.015,     // Keeps distinct clusters centered on canvas
          springLength: 110,         // Clean distance for clear relationship labels
          springConstant: 0.08,
          damping: 0.4,
          avoidOverlap: 0.8          // Prevents node collisions without forcing gaps
        },
        stabilization: {
          iterations: 150
        }
      },
      interaction: {
        hover: true,
        navigationButtons: true,
        keyboard: true,
        dragNodes: true,
        zoomView: true
      },
      height: '650px'
    };

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    network.once('stabilizationIterationsDone', () => {
      network.setOptions({ physics: { enabled: false } });
      savePositions();
      network.fit(); // Automatically frames all nodes and labels inside view box
    });

    network.on('click', (params) => {
      if (params.nodes && params.nodes.length > 0) {
        const selectedId = params.nodes[0];
        const selectedNodeObj = nodesMap.get(selectedId);

        const relatedEdges = activeData.filter(
          (edge) => edge.source === selectedId || edge.target === selectedId
        );

        if (onNodeSelect) {
          onNodeSelect({
            id: selectedId,
            nodeData: selectedNodeObj,
            connections: relatedEdges
          });
        }
      }
    });

    return () => {
      savePositions();
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [graphData, timeRange]);

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Criminal Relationship Map</h3>

        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', fontWeight: 'bold' }}>
          <span style={{ color: '#10b981' }}>● Suspect</span>
          <span style={{ color: '#ef4444' }}>● Phone (CDR)</span>
          <span style={{ color: '#7c3aed' }}>■ FIR Case</span>
          <span style={{ color: '#0284c7' }}>⬏ Location</span>
        </div>
      </div>

      <div ref={containerRef} style={{ height: '650px', backgroundColor: '#f8fafc', borderRadius: '6px' }} />
    </div>
  );
};

export default GraphCanvas;