import axios from 'axios';

// Change this later to your computer's local IP if testing on a real phone
// Example: http://192.168.1.10:5000/api
const BASE_URL = 'http://192.168.4.97:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export default api;
