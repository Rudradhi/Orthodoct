import { useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export const useUserSync = (user: FirebaseUser | null) => {
  useEffect(() => {
    const syncUser = async () => {
      if (!user) return;

      const userPath = `users/${user.uid}`;
      const userRef = doc(db, 'users', user.uid);
      
      try {
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Create new user profile
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            role: 'patient' // Default role
          });
        } else {
          // Update last login
          await setDoc(userRef, {
            lastLogin: serverTimestamp(),
            // Sync profile info if it changed
            displayName: user.displayName || userSnap.data().displayName,
            photoURL: user.photoURL || userSnap.data().photoURL,
            phoneNumber: user.phoneNumber || userSnap.data().phoneNumber,
          }, { merge: true });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, userPath);
      }
    };

    syncUser();
  }, [user]);
};
