import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5001/api'
    : 'http://192.168.4.97:5001/api';

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
