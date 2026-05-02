import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await api.get('/auth/me');
                    const userData = res.data.data;
                    
                    if (userData.role === 'Manager') {
                        try {
                            const delegationRes = await api.get('/admin/delegation/status');
                            if (delegationRes.data.success && delegationRes.data.isActingAdmin) {
                                userData.isActingAdmin = true;
                                userData.actingAdminUntil = delegationRes.data.endDate;
                            }
                        } catch (err) { }
                    }
                    
                    setUser(userData);
                } catch (error) {
                    console.error("Auth init error:", error);
                    // If /auth/me fails (and interceptor refresh also fails), logout
                    logoutLocally();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });

            const { token, refreshToken, user: loginUser } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            if (loginUser.role === 'Manager') {
                try {
                    const delegationRes = await api.get('/admin/delegation/status');
                    if (delegationRes.data.success && delegationRes.data.isActingAdmin) {
                        loginUser.isActingAdmin = true;
                        loginUser.actingAdminUntil = delegationRes.data.endDate;
                    }
                } catch (err) { }
            }

            setUser(loginUser);
            toast.success('Login successful');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/auth/register', userData);

            const { token, refreshToken, user } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            toast.success('Registration successful');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed');
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            logoutLocally();
        }
    };

    const logoutLocally = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        sessionStorage.clear();
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
