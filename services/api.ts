import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.20.10.2:5263/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
