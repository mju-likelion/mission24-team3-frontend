import Axios from '../lib/axios';

export const refreshAccessToken = async (token) => {
  const res = await Axios.post('/auth/refresh', {
    refreshToken: token,
  });
  return res;
};

export const tryLogin = async (data) => {
  const res = await Axios.post('/auth/login', {
    email: data.id,
    password: data.password,
  });

  return res;
};

export const tryRegister = async (data) => {
  const res = await Axios.post('/auth/register', {
    email: data.id,
    password: data.password,
    name: data.name,
  });
  return res;
};