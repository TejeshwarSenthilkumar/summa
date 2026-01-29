import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Stethoscope, Store, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import Logo from '@/components/ui/Logo';

const roles = [
    { id: 'patient', label: 'Patient', icon: User, color: 'text-teal-600', bg: 'bg-teal-50', backendRole: 'PATIENT' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50', backendRole: 'DOCTOR' },
    { id: 'pharmacist', label: 'Pharmacist', icon: Store, color: 'text-orange-600', bg: 'bg-orange-50', backendRole: 'PHARMACY' },
];

const LoginPage = () => {
    const [selectedRole, setSelectedRole] = useState('patient');
    const [step, setStep] = useState('role'); // 'role' | 'otp'
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const setAuth = useAuthStore(state => state.setAuth);

    const handleLogin = async () => {
        if (!identifier) {
            if (selectedRole === 'patient') alert("Please enter Mobile Number or Aadhaar");
            else alert("Please enter License ID or Mobile Number");
            return;
        }

        setIsLoading(true);
        try {
            const role = roles.find(r => r.id === selectedRole)?.backendRole;
            await api.auth.sendOtp(identifier, role);
            setStep('otp');
        } catch (error) {
            alert(error.message || 'User not found or role mismatch');
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async () => {
        setIsLoading(true);
        try {
            const role = roles.find(r => r.id === selectedRole)?.backendRole;
            const response = await api.auth.verifyOtp(identifier, otp, role);

            setAuth(response.user, response.accessToken);

            // Navigate based on role
            if (response.user.role === 'PATIENT') navigate('/patient/dashboard');
            else if (response.user.role === 'DOCTOR') navigate('/doctor/dashboard');
            else if (response.user.role === 'PHARMACY') navigate('/pharmacist/scan');
            else navigate('/dashboard');

        } catch (error) {
            alert(error.message || 'Invalid OTP. Use 123456');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
        >
            <div className="text-center mb-8 flex flex-col items-center">
                <Logo size="lg" className="mb-4" />
                <p className="text-slate-500 font-medium">Secure Healthcare Access Portal</p>
            </div>

            <Card className="border-0 shadow-2xl shadow-teal-900/10 backdrop-blur-xl bg-white/80">
                <CardHeader className="pb-4">
                    <CardTitle className="text-center text-xl">
                        {step === 'otp' ? 'Verify Identity' : 'Welcome Back'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {step === 'otp'
                            ? `Enter the OTP sent to registered mobile`
                            : 'Select your role to continue'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Role Selector - Only show if not in OTP mode */}
                    {step === 'role' && (
                        <div className="grid grid-cols-3 gap-3">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200",
                                        selectedRole === role.id
                                            ? `border-teal-600 ${role.bg} shadow-sm transform scale-105`
                                            : "border-transparent bg-slate-50 hover:bg-slate-100 text-slate-400"
                                    )}
                                >
                                    <role.icon
                                        size={24}
                                        className={selectedRole === role.id ? role.color : "currentColor"}
                                    />
                                    <span className={cn(
                                        "text-xs font-semibold",
                                        selectedRole === role.id ? "text-slate-900" : "currentColor"
                                    )}>
                                        {role.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Inputs */}
                    <div className="space-y-4">
                        {step === 'role' ? (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                                    {selectedRole === 'patient' ? 'Mobile / Aadhaar' : selectedRole === 'doctor' ? 'Mobile / License ID' : 'License ID'}
                                </label>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-medium text-slate-900"
                                    placeholder={
                                        selectedRole === 'patient' ? 'Enter Mobile / Aadhaar'
                                            : selectedRole === 'doctor' ? 'Enter Mobile / License ID'
                                                : 'LIC-8821-X'
                                    }
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                                    One Time Password
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-medium text-slate-900 text-center tracking-widest text-lg"
                                    placeholder="• • • • • •"
                                />
                                <div className="text-center">
                                    <button className="text-xs text-teal-600 font-medium hover:underline">
                                        Resend OTP
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </CardContent>
                <CardFooter>
                    {step === 'role' ? (
                        <Button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full h-12 text-base font-semibold shadow-xl shadow-teal-900/20 hover:scale-[1.02] transition-transform"
                        >
                            {isLoading ? 'Processing...' : (selectedRole === 'patient' ? 'Get OTP' : 'Sign In')} <ArrowRight className="ml-2" size={18} />
                        </Button>
                    ) : (
                        <Button
                            onClick={verifyOtp}
                            disabled={isLoading}
                            className="w-full h-12 text-base font-semibold shadow-xl shadow-teal-900/20 hover:scale-[1.02] transition-transform bg-teal-700 hover:bg-teal-800"
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Login'} <ShieldCheck className="ml-2" size={18} />
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {step === 'role' && (
                <p className="text-center mt-6 text-sm text-slate-400">
                    Don't have an account? <Link to="/signup" className="text-teal-600 font-semibold hover:underline">Sign up</Link>
                </p>
            )}

            {step === 'otp' && (
                <p className="text-center mt-6 text-sm text-slate-400">
                    <button onClick={() => setStep('role')} className="text-slate-500 hover:text-slate-700">
                        &larr; Back to Role Selection
                    </button>
                </p>
            )}

        </motion.div>
    );
};

export default LoginPage;
