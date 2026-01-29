import React, { useState, useEffect } from 'react';
import { QrCode, Search, User, ScanLine, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/components/ui/PageTransition';

const ScanQRPage = () => {
    const navigate = useNavigate();

    // Mock scan effect
    useEffect(() => {
        const timer = setTimeout(() => {
            // navigate('/doctor/patient/P-12345');
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleScanSuccess = () => {
        navigate('/doctor/patient/P-12345');
    };

    return (
        <PageTransition className="flex flex-col items-center justify-start min-h-[85vh] px-6 pt-12 pb-20">

            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Scan Patient QR</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Align the QR code within the frame to access patient records.</p>
            </div>

            {/* Professional Scanner UI */}
            <div className="relative w-72 h-72 rounded-3xl overflow-hidden shadow-xl bg-slate-50 dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 mb-8 relative">

                {/* Camera Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                    <User className="text-slate-300 dark:text-slate-700 w-24 h-24" strokeWidth={1.5} />
                </div>

                {/* Scan Overlay */}
                <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
                    <div className="flex justify-between w-full opacity-40">
                        <div className="w-8 h-8 border-t-4 border-l-4 border-teal-500 rounded-tl-xl" />
                        <div className="w-8 h-8 border-t-4 border-r-4 border-teal-500 rounded-tr-xl" />
                    </div>
                    <div className="flex justify-between w-full opacity-40">
                        <div className="w-8 h-8 border-b-4 border-l-4 border-teal-500 rounded-bl-xl" />
                        <div className="w-8 h-8 border-b-4 border-r-4 border-teal-500 rounded-br-xl" />
                    </div>
                </div>

                {/* Simple Horizontal Scan Line */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-40 w-full flex items-center justify-center pointer-events-none">
                    <div className="w-full h-0.5 bg-teal-500/50 animate-pulse" />
                </div>

            </div>

            <div className="w-full max-w-xs space-y-4">
                <Button
                    onClick={handleScanSuccess}
                    className="w-full h-12 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-base font-semibold transition-colors"
                >
                    Simulate Scan
                </Button>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-50 dark:bg-slate-950 px-2 text-slate-500">Or manually enter ID</span>
                    </div>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Patient ID (e.g., PAT-1029)"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white transition-all"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400">
                        <Search size={18} />
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default ScanQRPage;
