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
    } catch (error) {
      console.error("Error registering user:", error);
      throw new Error(this.getAuthErrorMessage(error));
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
    } catch (error) {
      console.error("Error logging in:", error);
      throw new Error(this.getAuthErrorMessage(error));
    }
  },

  // Login with Google
  async loginWithGoogle(): Promise<User> {
    try {
      // Clear any existing popup
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        // First time Google login - create user document
        const displayName = firebaseUser.displayName || "";
        const nameParts = displayName.split(" ");
        const firstName = nameParts[0] || "User";
        const lastName = nameParts.slice(1).join(" ") || "";

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
      }

      return await this.getUserData(firebaseUser.uid);
    } catch (error) {
      console.error("Error logging in with Google:", error);
      throw new Error(this.getAuthErrorMessage(error));
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
    } catch (error) {
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
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Failed to update profile");
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
      throw new Error("Failed to logout");
    }
  },

  // Helper method to get user-friendly error messages
  getAuthErrorMessage(error: unknown): string {
    // Safely handle the unknown error type
    const errorObj = error as { code?: string; message?: string };
    const errorCode = errorObj?.code;

    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password is too weak. Please choose a stronger password.";
      case "auth/operation-not-allowed":
        return "This sign-in method is not enabled. Please contact support.";
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled.";
      case "auth/popup-blocked":
        return "Popup was blocked. Please allow popups and try again.";
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection and try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/invalid-credential":
        return "Invalid credentials. Please check your email and password.";
      default:
        return (
          errorObj?.message || "An unexpected error occurred. Please try again."
        );
    }
  },
};
