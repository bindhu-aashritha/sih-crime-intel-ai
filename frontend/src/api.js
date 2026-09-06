import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const fetchGraphData = async () => {
  const response = await axios.get(`${API_BASE_URL}/graph`);
  return response.data.graph;
};

export const fetchInfluencers = async () => {
  const response = await axios.get(`${API_BASE_URL}/analytics/influencers`);
  return response.data.key_influencers;
};

export const fetchCommunities = async () => {
  const response = await axios.get(`${API_BASE_URL}/analytics/communities`);
  return response.data.communities;
};

export const triggerIngest = async () => {
  const response = await axios.post(`${API_BASE_URL}/ingest/synthetic`);
  return response.data;
};