import { auth, db } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true at app start

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const ref = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...snap.data(),
            });
          } else {
            // fallback: set minimal user if no Firestore doc
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
          }
        } catch (err) {
          console.error("Error loading user profile:", err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async ({ email, password, ...profile }) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", res.user.uid), {
      uid: res.user.uid,
      email,
      ...profile,
      createdAt: new Date(),
    });
    setUser({ uid: res.user.uid, email, ...profile });
  };

  const signIn = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const deleteAccount = async (password) => {
    if (!auth.currentUser) throw new Error("No authenticated user");

    // Re-authenticate user before deleting account
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    );
    await reauthenticateWithCredential(auth.currentUser, credential);

    // Delete user data from Firestore
    await deleteDoc(doc(db, "users", auth.currentUser.uid));

    // Delete the user account
    await deleteUser(auth.currentUser);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    if (!user?.uid) throw new Error("No authenticated user");

    await updateDoc(doc(db, "users", user.uid), {
      ...profileData,
      updatedAt: new Date(),
    });

    // Update local user state
    setUser((prev) => ({
      ...prev,
      ...profileData,
    }));
  };

  const memoedValue = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      deleteAccount,
      updateProfile,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
