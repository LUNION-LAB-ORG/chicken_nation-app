import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Typage de la simulation de l'authentification
type AuthContextType = {
  user: boolean;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
};

// Création du contexte
const AuthContext = createContext<AuthContextType | null>(null);

// Création du provider
// Ce provider permet de gérer l'état de l'authentification
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<boolean>(false); // False = non connecté

  // Fonctions de connexion et de déconnexion
  const login = () => setUser(true);
  const logout = () => setUser(false);

  // Retourne le contexte
  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour utiliser le contexte
export function useAuth() {
  return useContext(AuthContext) as AuthContextType;
}

// Ajout de l'export par défaut pour corriger l'avertissement
export default AuthProvider;
