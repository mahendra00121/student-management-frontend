'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Banknote, User, Calendar, CreditCard, FileText, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';

// Sample Styles
const inputClasses = "w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder-gray-400 text-gray-900 shadow-sm hover:border-gray-300 hover:bg-white";
const labelClasses = "block text-xs font-bold text-gray-600 mb-1.5 ml-1 uppercase tracking-wide";
const iconClasses = "absolute left-3.5 top-[2.4rem] text-gray-400 w-4 h-4 peer-focus:text-green-500 transition-colors";

interface FeeFormProps {
    onCancel: () => void;
    onSuccess: () => void;
    initialStudentId?: number;
}

export default function FeeForm({ onCancel, onSuccess, initialStudentId }: FeeFormProps) {
    const [students, setStudents] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        studentId: initialStudentId ? initialStudentId.toString() : '',
        amount: '',
        paymentMode: 'Cash',
        remarks: ''
    });

    useEffect(() => {
        // Fetch students for dropdown
        fetch("http://localhost:5081/api/students")
            .then(res => res.json())
            .then(data => setStudents(data))
            .catch(() => toast.error("Failed to load students list"));
    }, []);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.studentId || !formData.amount) {
            toast.error("Please fill required fields");
            return;
        }

        const promise = fetch("http://localhost:5081/api/fees", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: parseInt(formData.studentId),
                amount: parseFloat(formData.amount),
                paymentMode: formData.paymentMode,
                remarks: formData.remarks
            })
        }).then(async res => {
            if (!res.ok) throw new Error("Payment Failed");
            onSuccess();
        });

        toast.promise(promise, {
            loading: 'Processing Payment...',
            success: 'Payment Recorded!',
            error: 'Failed to record payment'
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
            >
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg"><Banknote className="text-white w-6 h-6" /></div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Collect Fee</h2>
                            <p className="text-green-100 text-xs">Record a new transaction</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="text-white/80 hover:text-white"><X className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">

                    {/* Student Select */}
                    <div className="relative">
                        <label className={labelClasses}>Select Student</label>
                        <User className={iconClasses} />
                        <select name="studentId" value={formData.studentId} onChange={handleChange} className={`${inputClasses} appearance-none`}>
                            <option value="">-- Choose Student --</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.roll}) - {s.class}</option>
                            ))}
                        </select>
                    </div>

                    {/* Amount & Mode */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className={labelClasses}>Amount (₹)</label>
                            <Banknote className={iconClasses} />
                            <input type="number" name="amount" value={formData.amount} onChange={handleChange} className={inputClasses} placeholder="0.00" />
                        </div>
                        <div className="relative">
                            <label className={labelClasses}>Payment Mode</label>
                            <CreditCard className={iconClasses} />
                            <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} className={`${inputClasses} appearance-none`}>
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Card</option>
                                <option>Cheque</option>
                            </select>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="relative">
                        <label className={labelClasses}>Remarks (Optional)</label>
                        <FileText className={clsx(iconClasses, "top-9")} />
                        <textarea name="remarks" value={formData.remarks} onChange={handleChange} className={`${inputClasses} h-20 resize-none`} placeholder="Term 1 fees..." />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl border text-gray-600 font-medium hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-8 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2">
                            <Send className="w-4 h-4" /> Collect Payment
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
