import React, { useState } from 'react';

const SearchBar = ({ graphData, onSearchSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Extract unique entities for search autosuggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 1 && graphData) {
      const allEntities = new Set();
      
      graphData.forEach((item) => {
        if (item.source && item.source.toLowerCase().includes(value.toLowerCase())) {
          allEntities.add(item.source);
        }
        if (item.target && item.target.toLowerCase().includes(value.toLowerCase())) {
          allEntities.add(item.target);
        }
      });

      setSuggestions(Array.from(allEntities).slice(0, 5)); // Top 5 matching nodes
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (selectedEntity) => {
    setSearchTerm(selectedEntity);
    setSuggestions([]);
    if (onSearchSelect) {
      onSearchSelect(selectedEntity);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    if (onSearchSelect) {
      onSearchSelect(null); // Reset filter
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '15px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search Suspect Name, Phone Number, or FIR ID..."
          style={{
            flex: 1,
            padding: '10px 14px',
            fontSize: '14px',
            border: '1px solid #dfe6e9',
            borderRadius: '6px',
            outline: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            style={{
              padding: '10px 15px',
              backgroundColor: '#b2bec3',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Autosuggestion Dropdown List */}
      {suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #dfe6e9',
            borderRadius: '6px',
            marginTop: '4px',
            padding: 0,
            listStyle: 'none',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {suggestions.map((entity, index) => (
            <li
              key={index}
              onClick={() => handleSelect(entity)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: index !== suggestions.length - 1 ? '1px solid #f1f2f6' : 'none',
                fontSize: '14px',
                color: '#2d3436'
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#ffffff')}
            >
              🔍 {entity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;