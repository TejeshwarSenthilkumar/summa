import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';
import PharmacistLayout from './layouts/PharmacistLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';

// Modules (Now acting as Dashboard Pages)
import PatientDashboard from './modules/patient';
import PatientProfile from './modules/patient/ProfilePage';
import MedicineLog from './modules/patient/MedicineLog';
import DoctorDashboard from './modules/doctor';
import PharmacistDashboard from './modules/pharmacist';


// Pharmacist Pages
import ScanQR from './modules/pharmacist/pages/ScanQR';
import DispensePage from './modules/pharmacist/pages/DispensePage';
import Stock from './modules/pharmacist/pages/Stock';
import HistoryPage from './modules/pharmacist/pages/History';
import Profile from './modules/pharmacist/pages/Profile';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Route>

                {/* Patient Routes */}
                <Route element={<PatientLayout />}>
                    <Route path="/patient/dashboard" element={<PatientDashboard />} />
                    <Route path="/patient/medicine-log" element={<MedicineLog />} />
                    <Route path="/patient/profile" element={<PatientProfile />} />
                </Route>

                {/* Doctor Routes */}
                <Route element={<DoctorLayout />}>
                    <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                </Route>

                {/* Pharmacist Routes */}
                <Route element={<PharmacistLayout />}>
                    <Route path="/pharmacist" element={<Navigate to="/pharmacist/scan" replace />} />
                    <Route path="/pharmacist/scan" element={<ScanQR />} />
                    <Route path="/pharmacist/dispense" element={<DispensePage />} />
                    <Route path="/pharmacist/stock" element={<Stock />} />
                    <Route path="/pharmacist/history" element={<HistoryPage />} />
                    <Route path="/pharmacist/profile" element={<Profile />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
