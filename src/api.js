const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

function getHeaders() {
  const token = getToken();

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  auth: {
    signUp: (userData) => request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

    signInWithPassword: (credentials) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

    getUser: async () => {
      if (!getToken()) return null;

      try {
        const data = await request('/auth/me');
        return data.user;
      } catch {
        return null;
      }
    },

    getToken,

    signOut: () => {
      localStorage.removeItem('token');
    },
  },

  getPosts: () => request('/posts'),

  createPost: (post) => request('/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  }),

  getProfileStats: () => request('/profiles/stats'),

  getPeers: () => request('/peers'),

  getProfile: (id) => request(`/peers/${id}`),

  getMessages: (targetId) => request(`/messages/${targetId}`),

  sendMessage: (message) => request('/messages', {
    method: 'POST',
    body: JSON.stringify(message),
  }),
};
