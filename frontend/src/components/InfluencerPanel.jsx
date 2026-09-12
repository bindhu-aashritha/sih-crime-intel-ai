import React from 'react';

const InfluencerPanel = ({ influencers, communities }) => {
  return (
    <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Centrality Section */}
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
        🎯 Key Network Influencers
      </h3>
      <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '20px' }}>
        {influencers && influencers.length > 0 ? (
          <ul style={{ paddingLeft: '0', listStyle: 'none', margin: 0 }}>
            {influencers.map((inf, i) => (
              <li key={i} style={{ padding: '8px 10px', marginBottom: '6px', backgroundColor: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #2563eb' }}>
                <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e293b' }}>{inf.person}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Betweenness Centrality: <strong>{typeof inf.betweenness_score === 'number' ? inf.betweenness_score.toFixed(4) : inf.betweenness_score}</strong>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>No influencer metrics available.</div>
        )}
      </div>

      {/* Gang / Community Detection Section */}
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
        🚨 Detected Gang / Sub-networks
      </h3>
      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
        {communities && communities.length > 0 ? (
          communities.map((comm, idx) => (
            <div key={idx} style={{ marginBottom: '12px', padding: '10px', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ fontSize: '13px', color: '#991b1b' }}>Gang / Network #{idx + 1}</strong>
                <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#dc2626', color: '#fff', borderRadius: '12px', fontWeight: 'bold' }}>
                  {comm.size || comm.members.length} members
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#451a03', wordBreak: 'break-word', lineHeight: '1.4' }}>
                {comm.members ? comm.members.join(', ') : 'No members listed'}
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>No sub-networks detected.</div>
        )}
      </div>
    </div>
  );
};

export default InfluencerPanel;