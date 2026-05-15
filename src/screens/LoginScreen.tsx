import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    StatusBar, Alert, KeyboardAvoidingView, Platform, ScrollView,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../constants/DesignSystem';
import { useData } from '../context/DataContext';

const Logo = () => (
    <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🥩</Text>
        </View>
        <Text style={styles.appName}>Premium Meat</Text>
        <Text style={styles.appTagline}>Fresh. Local. Delivered.</Text>
    </View>
);

export default function LoginScreen({ navigation }: { navigation: any }) {
    const { BACKEND_URL, setCurrentUser } = useData();
    const [tab, setTab]           = useState<'user' | 'admin'>('user');
    const [gmail, setGmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);

    const handleUserLogin = async () => {
        if (!gmail.trim() || !password.trim()) {
            Alert.alert('Missing Fields', 'Please enter your email and password.');
            return;
        }
        setLoading(true);
        try {
            const res  = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gmail: gmail.trim(), password }),
            });
            const data = await res.json();
            if (!res.ok) {
                Alert.alert('Login Failed', data.error || 'Invalid credentials.');
                return;
            }
            await setCurrentUser(data.user);
            navigation.replace('Main');
        } catch (err) {
            Alert.alert('Connection Error', 'Could not reach the server. Check your network.');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminLogin = () => {
        // Admin bypass — password check can be added later
        navigation.replace('AdminDashboard');
    };

    const isUser  = tab === 'user';
    const isAdmin = tab === 'admin';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Logo />

                    {/* ── Tab switcher ── */}
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tabBtn, isUser && styles.tabBtnActive]}
                            onPress={() => { setTab('user'); setGmail(''); setPassword(''); }}
                        >
                            <Text style={[styles.tabText, isUser && styles.tabTextActive]}>👤 User Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabBtn, isAdmin && styles.tabBtnAdmin]}
                            onPress={() => { setTab('admin'); setGmail(''); setPassword(''); }}
                        >
                            <Text style={[styles.tabText, isAdmin && styles.tabTextActive]}>🔐 Admin</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Form ── */}
                    <View style={[styles.form, isAdmin && styles.formAdmin]}>
                        {isAdmin && (
                            <View style={styles.adminBadge}>
                                <Text style={styles.adminBadgeText}>🔐 Admin Access</Text>
                            </View>
                        )}

                        <Text style={styles.title}>
                            {isUser ? 'Welcome Back 👋' : 'Admin Dashboard'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isUser
                                ? 'Sign in to order the freshest meat.'
                                : 'Manage products, orders and shop settings.'}
                        </Text>

                        {isUser && (
                            <>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Gmail Address</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="you@gmail.com"
                                        placeholderTextColor={Colors.textLight}
                                        value={gmail}
                                        onChangeText={setGmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        returnKeyType="next"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="••••••••"
                                        placeholderTextColor={Colors.textLight}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        returnKeyType="done"
                                        onSubmitEditing={handleUserLogin}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.loginButton, loading && { opacity: 0.7 }]}
                                    onPress={handleUserLogin}
                                    disabled={loading}
                                >
                                    {loading
                                        ? <ActivityIndicator color="#fff" />
                                        : <Text style={styles.loginButtonText}>Login</Text>
                                    }
                                </TouchableOpacity>

                                <View style={styles.footerLinks}>
                                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                        <Text style={styles.linkText}>Create New Account</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <Text style={styles.linkTextMuted}>Forgot Password?</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {isAdmin && (
                            <TouchableOpacity
                                style={styles.loginButtonAdmin}
                                onPress={handleAdminLogin}
                            >
                                <Text style={styles.loginButtonText}>🔓 Access Dashboard</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.l,
        paddingTop: Spacing.xl * 2,
        paddingBottom: Spacing.xl * 2,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoCircle: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.s,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    logoIcon: {
        fontSize: 38,
    },
    appName: {
        ...Typography.h2,
        color: Colors.primary,
        marginBottom: 2,
    },
    appTagline: {
        fontSize: 13,
        color: Colors.textLight,
    },
    tabRow: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 4,
        marginBottom: Spacing.l,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    tabBtnActive: {
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    tabBtnAdmin: {
        backgroundColor: '#C0392B',
        shadowColor: '#C0392B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textLight,
    },
    tabTextActive: {
        color: Colors.white,
    },
    form: {
        width: '100%',
    },
    formAdmin: {
        borderWidth: 1,
        borderColor: '#FF8080',
        borderRadius: 16,
        padding: Spacing.m,
        backgroundColor: '#FFFAFA',
    },
    adminBadge: {
        backgroundColor: '#FFF0F0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: 'flex-start',
        marginBottom: Spacing.m,
        borderWidth: 1,
        borderColor: '#FFCCCC',
    },
    adminBadgeText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 13,
    },
    title: {
        ...Typography.h1,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.caption,
        fontSize: 14,
        marginBottom: Spacing.l,
        color: Colors.textLight,
    },
    inputContainer: {
        marginBottom: Spacing.m,
    },
    label: {
        ...Typography.caption,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        paddingHorizontal: Spacing.m,
        backgroundColor: Colors.surface,
        fontSize: 16,
        color: Colors.text,
    },
    loginButton: {
    width: 140,
    height: 140,
    borderRadius: 70,

    backgroundColor: '#C1121F',

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',

    marginTop: Spacing.l,

    shadowColor: '#C1121F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,

    borderWidth: 3,
    borderColor: '#FFB3B3',
},
    loginButtonAdmin: {
        height: 52,
        backgroundColor: '#C0392B',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.m,
        shadowColor: '#C0392B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'italic',
    letterSpacing: 1,
    textTransform: 'uppercase',
},
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.l,
        paddingHorizontal: Spacing.xs,
    },
    linkText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    linkTextMuted: {
        color: Colors.textLight,
        fontWeight: '600',
        fontSize: 14,
    },
});
