import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Stethoscope, Store, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const roles = [
    { id: 'patient', label: 'Patient', icon: User, color: 'text-teal-600', bg: 'bg-teal-50' },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'pharmacist', label: 'Pharmacist', icon: Store, color: 'text-orange-600', bg: 'bg-orange-50' },
];

import Logo from '@/components/ui/Logo';

const LoginPage = () => {
    const [selectedRole, setSelectedRole] = useState('patient');
    const navigate = useNavigate();

    const handleLogin = () => {
        // Determine route based on role
        // In a real app, you would authenticate first
        const routes = {
            patient: '/patient/dashboard',
            doctor: '/doctor/dashboard',
            pharmacist: '/pharmacist/scan'
        };
        navigate(routes[selectedRole]);
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
                    <CardTitle className="text-center text-xl">Welcome Back</CardTitle>
                    <CardDescription className="text-center">Select your role to continue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Role Selector */}
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

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                                {selectedRole === 'patient' ? 'Phone Number' : 'License ID'}
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-medium text-slate-900"
                                placeholder={selectedRole === 'patient' ? '98765 43210' : 'LIC-8821-X'}
                            />
                        </div>
                    </div>

                </CardContent>
                <CardFooter>
                    <Button
                        onClick={handleLogin}
                        className="w-full h-12 text-base font-semibold shadow-xl shadow-teal-900/20 hover:scale-[1.02] transition-transform"
                    >
                        Sign In <ArrowRight className="ml-2" size={18} />
                    </Button>
                </CardFooter>
            </Card>

            <p className="text-center mt-6 text-sm text-slate-400">
                Don't have an account? <a href="#" className="text-teal-600 font-semibold hover:underline">Sign up</a>
            </p>

        </motion.div>
    );
};

export default LoginPage;
