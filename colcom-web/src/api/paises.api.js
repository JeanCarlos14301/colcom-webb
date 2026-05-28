import { apiRequest } from './client.js';

const unwrap = async (promise) => {
  const res = await promise;
  return res.data;
};

export const paisesApi = {
  publicActive: () => unwrap(apiRequest('/public/paises')),
  active: () => unwrap(apiRequest('/paises')),
  all: () => unwrap(apiRequest('/paises')),
  getById: (id) => apiRequest(`/paises/${id}`),
};
