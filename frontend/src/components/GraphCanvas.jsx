import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';

const GraphCanvas = ({ graphData }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !graphData || graphData.length === 0) return;

    const nodesMap = new Map();
    const edges = [];

    // Parse Neo4j graph response into Vis.js format
    graphData.forEach((item, index) => {
      if (!nodesMap.has(item.source)) {
        nodesMap.set(item.source, {
          id: item.source,
          label: item.source,
          group: item.source_type,
          color: item.source_type === 'Person' ? '#ff7675' : '#74b9ff'
        });
      }

      if (!nodesMap.has(item.target)) {
        nodesMap.set(item.target, {
          id: item.target,
          label: item.target,
          group: item.target_type,
          color: item.target_type === 'Person' ? '#ff7675' : '#a29bfe'
        });
      }

      edges.push({
        id: `e_${index}`,
        from: item.source,
        to: item.target,
        label: item.relationship,
        font: { size: 10, align: 'middle' },
        arrows: 'to'
      });
    });

    const data = {
      nodes: Array.from(nodesMap.values()),
      edges: edges
    };

    const options = {
      nodes: {
        shape: 'dot',
        size: 16,
        font: { size: 12, color: '#2d3436' }
      },
      physics: {
        barnesHut: { gravitationalConstant: -3000, springLength: 95 }
      },
      height: '600px'
    };

    new Network(containerRef.current, data, options);
  }, [graphData]);

  return (
    <div style={{ border: '1px solid #dfe6e9', borderRadius: '8px', padding: '10px' }}>
      <h3>Criminal Relationship Map</h3>
      <div ref={containerRef} style={{ height: '600px', backgroundColor: '#f8f9fa' }} />
    </div>
  );
};

export default GraphCanvas;