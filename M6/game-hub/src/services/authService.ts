import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { auth, googleProvider, db } from "../config/firebase";
import type { User } from "../types/user";

export const authService = {
  // Register with email and password
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`,
      });

      // Create user document in Firestore
      const userData: Omit<User, "uid"> = {
        email: firebaseUser.email!,
        firstName,
        lastName,
        bio: "",
        photoURL: firebaseUser.photoURL || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        uid: firebaseUser.uid,
        ...userData,
      };
    } catch (error: unknown) {
      console.error("Error registering user:", error);
      const message =
        error instanceof FirebaseError
          ? error.message
          : "Failed to register user";
      throw new Error(message);
    }
  },

  // Login with email and password
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      return await this.getUserData(firebaseUser.uid);
    } catch (error: unknown) {
      console.error("Error logging in:", error);
      const message =
        error instanceof FirebaseError ? error.message : "Failed to login";
      throw new Error(message);
    }
  },

  // Login with Google
  async loginWithGoogle(): Promise<User> {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        // First time Google login - create user document
        const [firstName, ...lastNameParts] = firebaseUser.displayName?.split(
          " "
        ) || ["", ""];
        const lastName = lastNameParts.join(" ");

        const userData: Omit<User, "uid"> = {
          email: firebaseUser.email!,
          firstName: firstName || "User",
          lastName: lastName || "",
          bio: "",
          photoURL: firebaseUser.photoURL || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(doc(db, "users", firebaseUser.uid), {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return {
          uid: firebaseUser.uid,
          ...userData,
        };
      }

      return await this.getUserData(firebaseUser.uid);
    } catch (error: unknown) {
      console.error("Error logging in with Google:", error);
      const message =
        error instanceof FirebaseError
          ? error.message
          : "Failed to login with Google";
      throw new Error(message);
    }
  },

  // Get user data from Firestore
  async getUserData(uid: string): Promise<User> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));

      if (!userDoc.exists()) {
        throw new Error("User data not found");
      }

      const userData = userDoc.data();
      return {
        uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio || "",
        photoURL: userData.photoURL || "",
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      };
    } catch (error: unknown) {
      console.error("Error getting user data:", error);
      throw new Error("Failed to get user data");
    }
  },

  // Update user profile
  async updateUserProfile(uid: string, userData: Partial<User>): Promise<void> {
    try {
      const updateData = {
        ...userData,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "users", uid), updateData);

      // Update Firebase Auth profile if name changed
      if (userData.firstName || userData.lastName) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await updateProfile(currentUser, {
            displayName: `${userData.firstName || ""} ${
              userData.lastName || ""
            }`.trim(),
          });
        }
      }
    } catch (error: unknown) {
      console.error("Error updating user profile:", error);
      throw new Error("Failed to update profile");
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      console.error("Error logging out:", error);
      throw new Error("Failed to logout");
    }
  },
};
