"use client";

import type React from "react";

import { useUser } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState } from "react";

type UserRole = "user" | "host" | "admin";

interface AuthContextType {
  role: UserRole;
  roles: UserRole[];
  isLoadingRole: boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  role: "user",
  roles: ["user"],
  isLoadingRole: true,
  hasRole: () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();
  const [roles, setRoles] = useState<UserRole[]>(["user"]);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      // Get roles from publicMetadata
      const userRoles = (user.publicMetadata.roles as UserRole[]) || ["user"];
      setRoles(userRoles);
      setIsLoadingRole(false);
    } else if (isLoaded) {
      // User is loaded but not authenticated
      setRoles(["user"]);
      setIsLoadingRole(false);
    }
  }, [isLoaded, user]);

  // Get the highest priority role for backwards compatibility
  const getPrimaryRole = (): UserRole => {
    if (roles.includes("admin")) return "admin";
    if (roles.includes("host")) return "host";
    return "user";
  };

  // Check if user has a specific role
  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{
        role: getPrimaryRole(),
        roles,
        isLoadingRole,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useClerkToken = () => useContext(AuthContext);
