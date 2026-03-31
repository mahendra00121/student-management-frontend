'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Book, Users, School, Send, Link as LinkIcon
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';

// Reusing styles
const inputClasses = "w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-gray-900 shadow-sm hover:border-gray-300 hover:bg-white";
const labelClasses = "block text-xs font-bold text-gray-600 mb-1.5 ml-1 uppercase tracking-wide";
const iconClasses = "absolute left-3.5 top-[2.4rem] text-gray-400 w-4 h-4 peer-focus:text-indigo-500 transition-colors";

interface AllocationFormProps {
    onCancel: () => void;
    onSuccess: () => void;
    classes: any[];
    subjects: any[];
    teachers: any[];
}

export default function AllocationForm({ onCancel, onSuccess, classes, subjects, teachers }: AllocationFormProps) {
    const [formData, setFormData] = useState({
        classId: '',
        subjectId: '',
        teacherId: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.classId || !formData.subjectId || !formData.teacherId) {
            toast.error("Please select all fields.");
            return;
        }

        const promise = fetch("http://localhost:5081/api/SubjectAllocations", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                classId: parseInt(formData.classId),
                subjectId: parseInt(formData.subjectId),
                teacherId: parseInt(formData.teacherId)
            })
        }).then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to assign');
            }
            onSuccess();
            return "Subject assigned successfully";
        });

        toast.promise(promise, {
            loading: 'Assigning...',
            success: (msg) => msg,
            error: (err) => `Error: ${err.message}`
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            >
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-5 shrink-0 flex items-center gap-4">
                    <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md shadow-inner">
                        <LinkIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-wide">Assign Subject</h1>
                        <p className="text-purple-100 text-sm opacity-80">Map Class, Subject & Teacher</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Class Select */}
                    <div className="relative group">
                        <label className={labelClasses}>Class</label>
                        <div className="relative">
                            <School className={iconClasses} />
                            <select
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                className={`${inputClasses} appearance-none`}
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.className} - {c.section}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Subject Select */}
                    <div className="relative group">
                        <label className={labelClasses}>Subject</label>
                        <div className="relative">
                            <Book className={iconClasses} />
                            <select
                                name="subjectId"
                                value={formData.subjectId}
                                onChange={handleChange}
                                className={`${inputClasses} appearance-none`}
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.subjectName} ({s.subjectCode})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Teacher Select */}
                    <div className="relative group">
                        <label className={labelClasses}>Teacher</label>
                        <div className="relative">
                            <Users className={iconClasses} />
                            <select
                                name="teacherId"
                                value={formData.teacherId}
                                onChange={handleChange}
                                className={`${inputClasses} appearance-none`}
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl border hover:bg-gray-50 text-gray-600 font-semibold text-sm">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-lg shadow-purple-200">Assign</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
