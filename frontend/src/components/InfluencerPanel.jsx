import React from 'react';

const InfluencerPanel = ({ influencers, communities }) => {
  return (
    <div style={{ padding: '15px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #dfe6e9' }}>
      <h3>Key Network Influencers</h3>
      <ul style={{ paddingLeft: '20px' }}>
        {influencers.map((inf, i) => (
          <li key={i} style={{ marginBottom: '8px' }}>
            <strong>{inf.person}</strong>
            <br />
            <small>Betweenness Score: {inf.betweenness_score}</small>
          </li>
        ))}
      </ul>

      <hr />

      <h3>Detected Gang / Sub-networks</h3>
      {communities.map((comm, idx) => (
        <div key={idx} style={{ marginBottom: '10px' }}>
          <strong>{comm.community_id}</strong> ({comm.size} members)
          <div style={{ fontSize: '12px', color: '#636e72' }}>
            {comm.members.join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InfluencerPanel;