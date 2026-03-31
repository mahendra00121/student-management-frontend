'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, User, Users, UserPlus, Hash, Calendar, Phone, GraduationCap, MapPin, Notebook as Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface StudentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    student?: any; // For editing
}

export default function StudentRegistrationForm({ isOpen, onClose, onSuccess, student }: StudentFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        fatherName: '',
        rollNo: '',
        age: '',
        class: '',
        section: '',
        contact: '',
        annualFee: '',
        admissionDate: new Date().toISOString().split('T')[0]
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name || '',
                fatherName: student.fatherName || '',
                rollNo: student.rollNo || '',
                age: student.age?.toString() || '',
                class: student.class || '',
                section: student.section || '',
                contact: student.contact || '',
                annualFee: student.annualFee?.toString() || '',
                admissionDate: student.admissionDate || new Date().toISOString().split('T')[0]
            });
        } else {
            setFormData({
                name: '',
                fatherName: '',
                rollNo: '',
                age: '',
                class: '',
                section: '',
                contact: '',
                annualFee: '',
                admissionDate: new Date().toISOString().split('T')[0]
            });
        }
    }, [student, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const url = 'http://localhost:5081/api/students';
        const method = student ? 'PUT' : 'POST';
        const body = student ? { ...formData, id: student.id } : formData;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...body,
                    age: parseInt(formData.age) || 0,
                    annualFee: parseFloat(formData.annualFee) || 0
                })
            });

            if (res.ok) {
                toast.success(student ? "Student updated successfully" : "Student enrolled successfully");
                onSuccess();
                onClose();
            } else {
                const err = await res.text();
                toast.error("Error: " + err);
            }
        } catch (error) {
            toast.error("Network error. Please check if backend is running.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
                >
                    {/* Header */}
                    <div className="bg-indigo-600 p-6 text-white flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                {student ? "Edit Student Profile" : "New Student Enrollment"}
                            </h2>
                            <p className="text-indigo-100 text-sm mt-1 font-medium italic opacity-80">Complete the directory profile below</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <User className="w-3.5 h-3.5 text-indigo-500" /> Full Name
                                </label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-indigo-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                                />
                            </div>

                            {/* Father's Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <Users className="w-3.5 h-3.5 text-indigo-500" /> Father's Name
                                </label>
                                <input
                                    required
                                    value={formData.fatherName}
                                    onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                                    placeholder="e.g. Vijay Sharma"
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-indigo-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                                />
                            </div>

                            {/* Roll Number */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <Hash className="w-3.5 h-3.5 text-indigo-500" /> Roll Number
                                </label>
                                <input
                                    required
                                    value={formData.rollNo}
                                    onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                                    placeholder="e.g. 2024001"
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-indigo-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                                />
                            </div>

                            {/* Age */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Age
                                </label>
                                <input
                                    required
                                    type="number"
                                    value={formData.age}
                                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                                    placeholder="e.g. 15"
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-indigo-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                                />
                            </div>

                            {/* Class */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Class
                                </label>
                                <select
                                    required
                                    value={formData.class}
                                    onChange={e => setFormData({ ...formData, class: e.target.value })}
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-indigo-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 outline-none"
                                >
                                    <option value="">Select Class</option>
                                    {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Section */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <Pencil className="w-3.5 h-3.5 text-indigo-500" /> Section
                                </label>
                                <input
                                    value={formData.section}
                                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                                    placeholder="e.g. A"
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-indigo-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                                />
                            </div>

                            {/* Contact */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <Phone className="w-3.5 h-3.5 text-indigo-500" /> Contact Number
                                </label>
                                <input
                                    required
                                    value={formData.contact}
                                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                    placeholder="e.g. 9876543210"
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-indigo-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                                />
                            </div>

                            {/* Annual Fee */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Annual Fee (₹)
                                </label>
                                <input
                                    required
                                    type="number"
                                    value={formData.annualFee}
                                    onChange={e => setFormData({ ...formData, annualFee: e.target.value })}
                                    placeholder="e.g. 25000"
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-indigo-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-indigo-400"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" /> {student ? "Save Changes" : "Confirm Enrollment"}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
