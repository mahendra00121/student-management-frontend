'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, User, UserPlus, Mail, Phone, Book, Award, Briefcase, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface TeacherFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    teacher?: any; // For editing
}

export default function TeacherRegistrationForm({ isOpen, onClose, onSuccess, teacher }: TeacherFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        email: '',
        phone: '',
        qualification: '',
        experience: '',
        joinDate: new Date().toISOString().split('T')[0]
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (teacher) {
            setFormData({
                name: teacher.name || '',
                subject: teacher.subject || '',
                email: teacher.email || '',
                phone: teacher.phone || '',
                qualification: teacher.qualification || '',
                experience: teacher.experience || '',
                joinDate: teacher.joinDate || new Date().toISOString().split('T')[0]
            });
        } else {
            setFormData({
                name: '',
                subject: '',
                email: '',
                phone: '',
                qualification: '',
                experience: '',
                joinDate: new Date().toISOString().split('T')[0]
            });
        }
    }, [teacher, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const url = 'http://localhost:5081/api/teachers';
        const method = teacher ? 'PUT' : 'POST';
        const body = teacher ? { ...formData, id: teacher.id } : formData;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(teacher ? "Teacher updated successfully" : "Teacher added successfully");
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
                    <div className="bg-emerald-600 p-6 text-white flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                {teacher ? "Edit Teacher Details" : "New Faculty Registration"}
                            </h2>
                            <p className="text-emerald-100 text-sm mt-1 font-medium italic opacity-80">Faculty Management Profile</p>
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
                                    <User className="w-3.5 h-3.5 text-emerald-500" /> Full Name
                                </label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Dr. Amit Verma"
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-emerald-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                                />
                            </div>

                            {/* Subject Expertise */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <Book className="w-3.5 h-3.5 text-emerald-500" /> Subject Expertise
                                </label>
                                <input
                                    required
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="e.g. Mathematics"
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-emerald-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                                />
                            </div>

                            {/* Email Address */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <Mail className="w-3.5 h-3.5 text-emerald-500" /> Email Address
                                </label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="e.g. amit@example.com"
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-emerald-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <Phone className="w-3.5 h-3.5 text-emerald-500" /> Phone Number
                                </label>
                                <input
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="e.g. 9876543210"
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-emerald-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                                />
                            </div>

                            {/* Qualification */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <Award className="w-3.5 h-3.5 text-emerald-500" /> Qualification
                                </label>
                                <input
                                    required
                                    value={formData.qualification}
                                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                                    placeholder="e.g. PhD, M.Tech"
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-emerald-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                                />
                            </div>

                            {/* Experience */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <Briefcase className="w-3.5 h-3.5 text-emerald-500" /> Experience (Years)
                                </label>
                                <input
                                    required
                                    value={formData.experience}
                                    onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                    placeholder="e.g. 10 Years"
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-emerald-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 outline-none"
                                />
                            </div>

                            {/* Join Date */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2 px-1 mb-2">
                                    <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Joining Date
                                </label>
                                <input
                                    required
                                    type="date"
                                    value={formData.joinDate}
                                    onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                                    className="w-full bg-white border border-gray-200 shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-emerald-200 transition-all rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 outline-none"
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
                                className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-emerald-400"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" /> {teacher ? "Save Profile" : "Register Teacher"}
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
