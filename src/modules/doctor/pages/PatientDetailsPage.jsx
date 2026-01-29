import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { User, Droplets, AlertCircle, FileText, ChevronRight, Stethoscope, Clock, ShieldCheck, ChevronDown } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const PatientDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock Patient Data
    const patient = {
        name: "Rahul Deshmukh",
        age: 34,
        bloodGroup: "O+",
        img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
        allergies: ["Penicillin", "Peanuts"],
        conditions: ["Hypertension"],
        history: [
            {
                id: 1,
                date: "15 Jan 2024",
                doctor: "Dr. Sharma",
                speciality: "General Physician",
                diagnosis: "Viral Fever",
                medicines: ["Dolo 650 (3 days)", "Cetirizine (5 days)"]
            },
            {
                id: 2,
                date: "10 Nov 2023",
                doctor: "Dr. Anjali",
                speciality: "Pulmonologist",
                diagnosis: "Asthma Checkup",
                medicines: ["Montelukast"]
            }
        ]
    };

    return (
        <PageTransition className="px-4 py-6 pb-32 space-y-6">

            {/* Professional Header */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-start gap-5">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img src={patient.img} alt={patient.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">{patient.name}</h1>
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-3">
                        <span>34 Years</span>
                        <span className="w-1 h-1 bg-slate-400 rounded-full" />
                        <span>Male</span>
                    </div>
                    <Badge variant="secondary" className="bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-0">
                        {patient.bloodGroup} Blood Group
                    </Badge>
                </div>
            </div>

            {/* Medical Summary in clear section */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 p-4 rounded-xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-2">
                        <AlertCircle size={14} /> Allergies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {patient.allergies.map(a => (
                            <span key={a} className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {a}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-4 rounded-xl">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                        <FileText size={14} /> Conditions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {patient.conditions.map(c => (
                            <span key={c} className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {c}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Primary Action - Clear & Bold */}
            <Button
                onClick={() => navigate(`/doctor/diagnose/${id}`)}
                className="w-full h-14 text-lg font-bold bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
                <Stethoscope size={20} /> Start Diagnosis
            </Button>

            {/* Patient History with Expandable Prescriptions */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 px-1">Medical History</h3>
                <div className="space-y-4">
                    {patient.history.map(record => (
                        <div key={record.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{record.diagnosis}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{record.doctor} • {record.speciality}</p>
                                </div>
                                <span className="text-xs font-medium text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                    {record.date}
                                </span>
                            </div>

                            {/* Expandable Meds Section - Simple Implementation */}
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Prescribed Medicines</p>
                                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                    {record.medicines.map((med, idx) => (
                                        <li key={idx}>{med}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </PageTransition>
    );
};

export default PatientDetailsPage;
