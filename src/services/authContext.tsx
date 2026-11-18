import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  onAuthStateChanged,
  User,
  db,
  doc,
  getDoc,
  setDoc,
} from './firebase';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync user profile with Firestore
  const syncUserProfile = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      const profileData: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || (user.isAnonymous ? 'Guest Explorer' : user.email?.split('@')[0] || 'Connoisseur'),
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
      };

      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          userId: user.uid,
          email: user.email || '',
          displayName: profileData.displayName,
          photoURL: user.photoURL || '',
          isAnonymous: user.isAnonymous,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      setUserProfile(profileData);
    } catch (err) {
      console.warn('Could not sync profile with Firestore:', err);
      // Fallback to local profile
      setUserProfile({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || (user.isAnonymous ? 'Guest Explorer' : 'Connoisseur'),
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setAuthError(err.message || 'Failed to authenticate with Google.');
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      setAuthError(null);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Email Sign-In Error:', err);
      setAuthError(err.message || 'Invalid email or password.');
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    try {
      setAuthError(null);
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user && name) {
        const userDocRef = doc(db, 'users', res.user.uid);
        await setDoc(userDocRef, {
          userId: res.user.uid,
          email: res.user.email,
          displayName: name,
          isAnonymous: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error('Sign-Up Error:', err);
      setAuthError(err.message || 'Could not create account.');
      throw err;
    }
  };

  const signInAsGuest = async () => {
    try {
      setAuthError(null);
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error('Guest Sign-In Error:', err);
      setAuthError(err.message || 'Could not continue as guest.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setAuthError(null);
      await signOut(auth);
    } catch (err: any) {
      console.error('Logout Error:', err);
      setAuthError(err.message || 'Logout failed.');
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        logout,
        authError,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
