import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.230.238.85:5263/api',
   withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
