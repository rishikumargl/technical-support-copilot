import { create } from 'zustand';

export const useChatStore = create((set) => ({
  messages: [],
  loading: false,
  currentSearchType: 'hybrid',

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  setLoading: (loading) => set({ loading }),

  setSearchType: (type) => set({ currentSearchType: type }),

  clearMessages: () => set({ messages: [] })
}));

export const useDocumentStore = create((set) => ({
  documents: [],
  loading: false,
  stats: null,

  setDocuments: (documents) => set({ documents }),

  addDocument: (doc) => set((state) => ({
    documents: [doc, ...state.documents]
  })),

  removeDocument: (id) => set((state) => ({
    documents: state.documents.filter(d => d.id !== id)
  })),

  setLoading: (loading) => set({ loading }),

  setStats: (stats) => set({ stats })
}));
