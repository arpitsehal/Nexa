import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [interests, setInterests] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [customFeeds, setCustomFeeds] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('nexa-theme') || 'dark');

  // State for Chat Sidebar
  const [activeChatArticle, setActiveChatArticle] = useState(null);

  // State for Profile Sidebar
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Listen to Firebase Auth state and Firestore document
  useEffect(() => {
    let unsubscribeSnapshot = null;

    // Handle Theme injection
    localStorage.setItem('nexa-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        setInterests([]);
        setBookmarks([]);
        setCustomFeeds([]);
        setAuthLoading(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        return;
      }
      
      // Listen to Firestore document for this user
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Initialize default cloud document if there isn't one yet
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, { interests: [], bookmarks: [], customFeeds: [] });
      }

      // Real-time listen to cloud database
      unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setInterests(data.interests || []);
          setBookmarks(data.bookmarks || []);
          setCustomFeeds(data.customFeeds || []);
        }
        setAuthLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const saveInterests = async (newInterests) => {
    // Optimistic UI update
    setInterests(newInterests);
    
    // Cloud save
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { interests: newInterests }, { merge: true });
    }
  };

  const toggleBookmark = async (article) => {
    // Find if already bookmarked
    const exists = bookmarks.find(b => b.title === article.title);
    
    // Optimistic array generation
    const newBookmarks = exists 
      ? bookmarks.filter(b => b.title !== article.title)
      : [...bookmarks, article];
    
    // Optimistic state set
    setBookmarks(newBookmarks);
    
    // Cloud save
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { bookmarks: newBookmarks }, { merge: true });
    }
  };

  const saveCustomFeeds = async (newFeeds) => {
    setCustomFeeds(newFeeds);
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { customFeeds: newFeeds }, { merge: true });
    }
  };

  const logout = () => {
    signOut(auth);
    setActiveChatArticle(null);
  };

  return (
    <AppContext.Provider value={{
      user, logout,
      interests, setInterests: saveInterests,
      bookmarks, toggleBookmark,
      customFeeds, setCustomFeeds: saveCustomFeeds,
      activeChatArticle, setActiveChatArticle,
      isProfileOpen, setIsProfileOpen,
      theme, setTheme,
      authLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};
