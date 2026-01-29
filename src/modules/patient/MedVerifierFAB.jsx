import React, { useState, useEffect, useRef } from 'react';
import { Scan, ShieldCheck, X, Pill, AlertTriangle, ShieldAlert, Camera, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Html5Qrcode } from 'html5-qrcode';

import { api } from '@/lib/api';

const MedVerifierFAB = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scanStep, setScanStep] = useState('camera'); // camera | result | error | permission | loading
    const [scanResult, setScanResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    const handleScanClick = () => {
        setIsOpen(true);
        setScanStep('camera');
        setErrorMsg('');
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
    };

    const startScanner = async () => {
        if (!scannerRef.current) return;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        try {
            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode("reader");
            }

            await html5QrCodeRef.current.start(
                { facingMode: "environment" },
                config,
                async (decodedText) => {
                    await stopScanner();
                    verifyRealToken(decodedText);
                },
                (errorMessage) => { }
            );
        } catch (err) {
            console.error("Camera entry error", err);
            setScanStep('permission');
            setErrorMsg("Camera access denied or device not found.");
        }
    };

    const closeScanner = async () => {
        await stopScanner();
        setIsOpen(false);
        setScanStep('camera');
        setScanResult(null);
        setErrorMsg('');
    };

    useEffect(() => {
        if (isOpen && scanStep === 'camera') {
            startScanner();
        }
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(console.error);
            }
        };
    }, [isOpen, scanStep]);

    const verifyRealToken = async (token) => {
        if (!token) return;
        setScanStep('loading');
        try {
            const result = await api.medicines.verifyQr(token);
            setScanResult(result.medicine);
            setScanStep('result');
        } catch (error) {
            setErrorMsg(error.message || 'SECURITY_VIOLATION: Invalid or tampered QR code scanned');
            setScanStep('error');
        }
    };

    return (
        <>
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60]">
                <Button
                    onClick={handleScanClick}
                    className="rounded-full w-14 h-14 bg-teal-700 dark:bg-teal-600 text-white shadow-[0_0_20px_rgba(13,148,136,0.3)] flex items-center justify-center hover:bg-teal-800 dark:hover:bg-teal-700 hover:scale-110 transition-all border-4 border-slate-50 dark:border-slate-800 ring-2 ring-teal-100 dark:ring-teal-900"
                >
                    <Scan size={24} />
                </Button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
                    >
                        <div className="absolute top-6 right-6 z-[80]">
                            <button onClick={closeScanner} className="text-white/70 bg-white/10 p-2 rounded-full hover:bg-white/20 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {(scanStep === 'camera' || scanStep === 'loading') && (
                            <div className="w-full max-w-sm flex flex-col items-center gap-8">
                                <div className="text-center space-y-2">
                                    <h3 className="text-white text-xl font-black tracking-tight">Medicine Authenticator</h3>
                                    <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Real-Time Blockchain Verification</p>
                                </div>

                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-full aspect-square bg-black rounded-[2.5rem] border-2 border-white/20 relative overflow-hidden shadow-2xl flex items-center justify-center"
                                >
                                    <div id="reader" ref={scannerRef} className="w-full h-full overflow-hidden"></div>

                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <div className="w-64 h-64 border-2 border-medical-green/40 rounded-3xl relative">
                                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-medical-green rounded-tl-xl" />
                                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-medical-green rounded-tr-xl" />
                                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-medical-green rounded-bl-xl" />
                                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-medical-green rounded-br-xl" />

                                            <motion.div
                                                animate={{ top: ['0%', '100%', '0%'] }}
                                                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                                className="absolute left-0 right-0 h-1 bg-medical-green shadow-[0_0_20px_#10B981] z-10"
                                            />
                                        </div>
                                    </div>

                                    {scanStep === 'loading' && (
                                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-sm">
                                            <RefreshCw className="text-teal-400 animate-spin" size={48} />
                                        </div>
                                    )}
                                </motion.div>

                                <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 font-bold px-4 py-1.5 rounded-full">
                                    Place Medicine QR inside frame
                                </Badge>
                            </div>
                        )}

                        {scanStep === 'permission' && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-full max-w-sm flex flex-col items-center text-center gap-6"
                            >
                                <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
                                    <Camera size={40} />
                                </div>
                                <h2 className="text-2xl font-black text-white">Camera Required</h2>
                                <p className="text-white/60 text-sm">Please grant camera access to scan medicine strips.</p>
                                <Button className="w-full h-14 bg-teal-600 text-white rounded-2xl font-bold" onClick={startScanner}>Try Again</Button>
                            </motion.div>
                        )}

                        {scanStep === 'result' && scanResult && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-full max-w-sm"
                            >
                                {scanResult.blockchainStatus === 'READY' ? (
                                    <Card className="border-green-500/50 bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden dark:border-slate-800">
                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500 shadow-[0_0_10px_#22C55E]" />
                                        <div className="p-8 flex flex-col items-center">
                                            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                                                <ShieldCheck size={40} />
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Authentic Product</h2>
                                            <p className="text-sm text-slate-500 mb-6">Verified via Blockchain Registry</p>
                                            <MedicineDetails card={scanResult} color="green" />
                                            <Button className="w-full h-14 mt-8 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold" onClick={closeScanner}>Verified Safe</Button>
                                        </div>
                                    </Card>
                                ) : (
                                    <Card className="border-amber-500/50 bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden dark:border-slate-800">
                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500 shadow-[0_0_10px_#F59E0B]" />
                                        <div className="p-8 flex flex-col items-center">
                                            <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6">
                                                <AlertTriangle size={40} />
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Warning: Dispensed</h2>
                                            <p className="text-xs text-amber-500 font-bold mb-6">ALREADY RECORDED ON CHAIN</p>
                                            <MedicineDetails card={scanResult} color="amber" />
                                            <Button variant="destructive" className="w-full h-14 mt-8 bg-amber-600 hover:bg-amber-700 rounded-2xl font-bold" onClick={closeScanner}>Do Not Use - Report</Button>
                                        </div>
                                    </Card>
                                )}
                            </motion.div>
                        )}

                        {scanStep === 'error' && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-full max-w-sm"
                            >
                                <Card className="border-red-600/50 bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden dark:border-slate-800">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600 shadow-[0_0_10px_#DC2626]" />
                                    <div className="p-8 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-red-600/10 text-red-600 rounded-full flex items-center justify-center mb-6">
                                            <ShieldAlert size={40} />
                                        </div>
                                        <h2 className="text-2xl font-black text-red-600 mb-1">Counterfeit Alert</h2>
                                        <p className="text-xs text-red-500/60 font-bold mb-8 uppercase">Invalid Signature</p>
                                        <div className="w-full p-6 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-2xl text-center">
                                            <p className="text-sm font-bold text-red-900 dark:text-red-400 mb-2">Cryptographic mismatch detected.</p>
                                            <p className="text-[11px] text-red-700 dark:text-red-500/80 leading-relaxed">This QR code data does not match any valid blockchain records. The medicine is likely counterfeit.</p>
                                        </div>
                                        <Button className="w-full h-14 mt-8 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black shadow-xl" onClick={closeScanner}>Dismiss Alert</Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const MedicineDetails = ({ card, color }) => {
    const colorClasses = {
        green: "text-green-600 bg-green-50 dark:bg-green-500/10 border-green-100",
        amber: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-100",
    };

    return (
        <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
                    <Pill size={24} />
                </div>
                <div>
                    <h4 className="font-black text-slate-900 dark:text-slate-100 text-base">{card.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{card.batchNumber}</p>
                </div>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-700/50" />
            <div className="flex justify-between items-center px-1">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Blockchain Link</span>
                    <span className="text-[11px] font-mono text-slate-900 dark:text-slate-200 uppercase tracking-tighter">VERIFIED_ON_LEDGER</span>
                </div>
                <Badge variant="outline" className="border-teal-500/30 text-teal-600 text-[9px] font-black uppercase">Live</Badge>
            </div>
        </div>
    );
};

export default MedVerifierFAB;
