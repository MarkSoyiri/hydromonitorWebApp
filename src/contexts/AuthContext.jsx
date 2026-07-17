import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/services/firebase';
import { authService } from '@/services';
import { buildingService } from '@/services';
import { roomService } from '@/services';
import { deviceService } from '@/services';
import { ROLES } from '@/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [building, setBuilding] = useState(null);
  const [room, setRoom] = useState(null);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await authService.getProfile();
      if (data?.success && data?.data) {
        setProfile(data.data);
        setProfileError(null);
        const p = data.data;

        if (p.buildingId) {
          buildingService.getById(p.buildingId)
            .then((res) => {
              if (res.data?.success) setBuilding(res.data.data);
            })
            .catch(() => {});
        }

        if (p.roomId) {
          roomService.getById(p.roomId)
            .then((res) => {
              if (res.data?.success) setRoom(res.data.data);
              if (res.data?.data?.device?.deviceId) {
                setDevice(res.data.data.device);
              }
            })
            .catch(() => {});
        }

        return data.data;
      }
    } catch (err) {
      setProfile(null);
      setProfileError(err?.message || 'Failed to load profile');
    }
    return null;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile();
      } else {
        setProfile(null);
        setBuilding(null);
        setRoom(null);
        setDevice(null);
      }
      setLoading(false);
      setInitializing(false);
    });
    return unsubscribe;
  }, [fetchProfile]);

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const token = await credential.user.getIdToken();
    await authService.login(token);
    const profileData = await fetchProfile();
    return profileData;
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setBuilding(null);
    setRoom(null);
    setDevice(null);
    setProfileError(null);
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = fetchProfile;

  const updateProfile = async (data) => {
    const { data: res } = await authService.updateProfile(data);
    if (res?.success && res?.data) {
      setProfile((prev) => ({ ...prev, ...res.data }));
    }
    return res;
  };

  const hasRole = (requiredRole) => {
    if (!profile) return false;
    const hierarchy = { SUPER_ADMIN: 3, ADMIN: 2, TENANT: 1 };
    return hierarchy[profile.role] >= hierarchy[requiredRole];
  };

  const isSuperAdmin = profile?.role === ROLES.SUPER_ADMIN;
  const isAdmin = profile?.role === ROLES.ADMIN;
  const isTenant = profile?.role === ROLES.TENANT;

  const value = {
    user,
    profile,
    building,
    room,
    device,
    loading,
    initializing,
    profileError,
    login,
    logout,
    resetPassword,
    refreshProfile,
    updateProfile,
    hasRole,
    isSuperAdmin,
    isAdmin,
    isTenant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
