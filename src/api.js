const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const api = {
  auth: {
    signUp: async (userData) => {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to sign up');
      }
      return await res.json();
    },
    signInWithPassword: async (credentials) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Invalid credentials');
      }
      return await res.json();
    },
    getUser: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      try {
        const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user;
      } catch (e) {
        return null;
      }
    },
    getToken: () => {
      return localStorage.getItem('token');
    },
    signOut: () => {
      localStorage.removeItem('token');
    }
  },

  // Custom wrappers for our specific backend to simulate supabase experience
  getPosts: async () => {
    const res = await fetch(`${API_URL}/posts`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch posts');
    return await res.json();
  },
  createPost: async (post) => {
    const res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(post)
    });
    if (!res.ok) throw new Error('Failed to create post');
    return await res.json();
  },
  getProfileStats: async () => {
    const res = await fetch(`${API_URL}/profiles/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  },
  getPeers: async () => {
    const res = await fetch(`${API_URL}/peers`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch peers');
    return await res.json();
  },
  getProfile: async (id) => {
    const res = await fetch(`${API_URL}/peers/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch peer profile');
    return await res.json();
  },
  getMessages: async (targetId) => {
    const res = await fetch(`${API_URL}/messages/${targetId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return await res.json();
  },
  sendMessage: async (message) => {
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(message)
    });
    if (!res.ok) throw new Error('Failed to send message');
    return await res.json();
  }
};
