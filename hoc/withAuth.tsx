"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

const withAuth = (WrappedComponent: React.ComponentType) => {
  return function AuthWrapper(props: any) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
      // Listen to authentication state changes
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setAuthenticated(true); // User is logged in
          setLoading(false);      // Stop loading
        } else {
          setAuthenticated(false);
          setLoading(false);
          router.push("/login");  // Redirect to login page if not authenticated
        }
      });

      // Clean up subscription
      return () => unsubscribe();
    }, [router]);

    if (loading) {
      // Show loading spinner or placeholder while authentication is being verified
      return <div>Loading...</div>;
    }

    if (!authenticated) {
      return null; // Prevent the page from rendering if not authenticated
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
