
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QrCode, User } from 'lucide-react';
import { usePharmacyStore } from '../store';

const ScanQR = () => {
    const navigate = useNavigate();
    const setPatient = usePharmacyStore(state => state.setPatient);

    const handleScan = () => {
        // Simulate finding 'Harish Kumar'
        setPatient('p1');
        navigate('/pharmacist/dispense');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
            <div className="bg-slate-100 p-8 rounded-full mb-8 animate-pulse">
                <QrCode size={64} className="text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Scan Patient ID</h2>
            <p className="text-slate-500 mb-8 max-w-xs">
                Point camera at patient's digital health card or prescription QR code.
            </p>
            <Button size="lg" className="w-full max-w-xs h-14 text-lg bg-teal-600 hover:bg-teal-700" onClick={handleScan}>
                <User className="mr-2" /> Simulate Scan
            </Button>
        </div>
    );
};

export default ScanQR;
