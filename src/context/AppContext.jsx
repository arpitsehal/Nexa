import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [interests, setInterests] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  
  // New state for Chat Sidebar
  const [activeChatArticle, setActiveChatArticle] = useState(null);

  // Load from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('my_et_user');
    const savedInterests = localStorage.getItem('my_et_interests');
    const savedBookmarks = localStorage.getItem('my_et_bookmarks');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedInterests) setInterests(JSON.parse(savedInterests));
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (user) localStorage.setItem('my_et_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('my_et_interests', JSON.stringify(interests));
  }, [interests]);

  useEffect(() => {
    localStorage.setItem('my_et_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const login = (name) => setUser({ name });
  const logout = () => {
    setUser(null);
    setInterests([]);
    setBookmarks([]);
    setActiveChatArticle(null);
    localStorage.clear();
  };

  const toggleBookmark = (article) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.title === article.title);
      if (exists) return prev.filter(b => b.title !== article.title);
      return [...prev, article];
    });
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      interests, setInterests,
      bookmarks, toggleBookmark,
      activeChatArticle, setActiveChatArticle
    }}>
      {children}
    </AppContext.Provider>
  );
};
