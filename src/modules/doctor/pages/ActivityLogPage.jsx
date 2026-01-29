import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import PageTransition from '@/components/ui/PageTransition';

const ActivityLogPage = () => {
    // Mock Data
    const activities = [
        { id: 1, patient: "Rahul Deshmukh", diagnosis: "Viral Fever", date: "Jan 24, 2024", time: "10:30 AM", status: "Prescribed" },
        { id: 2, patient: "Anita Sharma", diagnosis: "Hypertension Check", date: "Jan 24, 2024", time: "11:15 AM", status: "Consultation" },
        { id: 3, patient: "Vikram Singh", diagnosis: "Migraine", date: "Jan 23, 2024", time: "04:45 PM", status: "Prescribed" },
        { id: 4, patient: "Sneha Patel", diagnosis: "General Checkup", date: "Jan 23, 2024", time: "05:30 PM", status: "Completed" },
        { id: 5, patient: "Arjun Kumar", diagnosis: "Asthma Review", date: "Jan 22, 2024", time: "09:00 AM", status: "Prescribed" }
    ];

    return (
        <PageTransition className="px-4 py-6 pb-24">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Activity Log</h1>

            <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-xl">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                            <TableHead className="w-[140px] font-semibold text-slate-600 dark:text-slate-400">Patient</TableHead>
                            <TableHead className="font-semibold text-slate-600 dark:text-slate-400">Diagnosis</TableHead>
                            <TableHead className="text-right font-semibold text-slate-600 dark:text-slate-400">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map((activity) => (
                            <TableRow key={activity.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-slate-900 dark:text-slate-200">{activity.patient}</span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">{activity.status}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-600 dark:text-slate-400">
                                    {activity.diagnosis}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{activity.date}</span>
                                        <span className="text-[10px] text-slate-400">{activity.time}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </PageTransition>
    );
};

export default ActivityLogPage;
