import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { INITIAL_CITIZEN_USER, INITIAL_AUTHORITY_USER } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  loginAsAuthority: (emailOrBadge: string, password?: string) => Promise<boolean>;
  loginAsCitizen: (emailOrPhone: string, password?: string) => Promise<boolean>;
  quickDemoSwitch: (newRole: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storageService.getUser());

  useEffect(() => {
    storageService.setUser(user);
  }, [user]);

  const loginAsAuthority = async (emailOrBadge: string): Promise<boolean> => {
    // Simulate auth verification
    const officialUser: User = {
      ...INITIAL_AUTHORITY_USER,
      badgeId: emailOrBadge.includes('@') ? 'TP-40218' : emailOrBadge.toUpperCase(),
      email: emailOrBadge.includes('@') ? emailOrBadge : 'r.verma@trafficpolice.gov.in',
    };
    setUser(officialUser);
    return true;
  };

  const loginAsCitizen = async (emailOrPhone: string): Promise<boolean> => {
    const citizenUser: User = {
      ...INITIAL_CITIZEN_USER,
      email: emailOrPhone.includes('@') ? emailOrPhone : 'citizen@community.org',
      phone: emailOrPhone.includes('@') ? '+91 98450 12345' : emailOrPhone,
    };
    setUser(citizenUser);
    return true;
  };

  const quickDemoSwitch = (newRole: UserRole) => {
    if (newRole === 'authority') {
      setUser(INITIAL_AUTHORITY_USER);
    } else {
      setUser(INITIAL_CITIZEN_USER);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'citizen',
        isAuthenticated: !!user,
        loginAsAuthority,
        loginAsCitizen,
        quickDemoSwitch,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
