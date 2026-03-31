'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    School, Hash, Users, BookOpen, Send, User
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';

// Simplified Input Styles
const inputClasses = "w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-gray-900 shadow-sm hover:border-gray-300 hover:bg-white";
const labelClasses = "block text-xs font-bold text-gray-600 mb-1.5 ml-1 uppercase tracking-wide";
const iconClasses = "absolute left-3.5 top-[2.4rem] text-gray-400 w-4 h-4 peer-focus:text-indigo-500 transition-colors";

const FormField = ({
    label, name, value, onChange, type = "text", icon: Icon, placeholder, required = true, isTextArea = false, options = []
}: {
    label: string, name: string, value: string, onChange: any, type?: string, icon: any, placeholder?: string, required?: boolean, isTextArea?: boolean, options?: string[]
}) => (
    <div className="relative group">
        <label htmlFor={name} className={labelClasses}>{label}</label>
        <div className="relative">
            <Icon className={clsx(iconClasses, isTextArea ? "top-3" : "")} />
            {isTextArea ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    rows={1}
                    className={clsx(inputClasses, "resize-none h-[42px] peer")}
                />
            ) : type === "select" ? (
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={clsx(inputClasses, "appearance-none peer")}
                >
                    <option value="" disabled>{placeholder || "Select"}</option>
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`${inputClasses} peer`}
                />
            )}
        </div>
    </div>
);


interface ClassFormProps {
    onCancel?: () => void;
    onSuccess?: (data: any) => void;
    initialData?: any;
}

export default function ClassForm({ onCancel, onSuccess, initialData }: ClassFormProps) {
    const [formData, setFormData] = useState({
        className: initialData?.className || '',
        section: initialData?.section || '',
        classTeacher: initialData?.classTeacher || '',
        roomNumber: initialData?.roomNumber || '',
        capacity: initialData?.capacity || ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                className: initialData.className || '',
                section: initialData.section || '',
                classTeacher: initialData.classTeacher || '',
                roomNumber: initialData.roomNumber || '',
                capacity: initialData.capacity || ''
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.className) {
            toast.error("Class Name is required.");
            return false;
        }
        if (!formData.section) {
            toast.error("Section is required.");
            return false;
        }
        if (!formData.capacity || Number(formData.capacity) <= 0) {
            toast.error("Valid Capacity is required.");
            return false;
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (onSuccess) onSuccess({
            ...formData,
            capacity: Number(formData.capacity)
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-8 py-5 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md shadow-inner">
                            <School className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-wide">
                                {initialData ? 'Edit Class Details' : 'Add New Class'}
                            </h1>
                            <p className="text-orange-100 text-sm opacity-80">Organize your grades and sections</p>
                        </div>
                    </div>
                </div>

                <form id="class-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-gray-50">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-6">

                        <div className="col-span-12 md:col-span-6">
                            <FormField
                                label="Class Name" name="className" value={formData.className} onChange={handleChange}
                                icon={BookOpen} placeholder="e.g. 10th Grade"
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormField
                                label="Section" name="section" value={formData.section} onChange={handleChange}
                                icon={Hash} placeholder="e.g. A"
                            />
                        </div>

                        <div className="col-span-12">
                            <FormField
                                label="Class Teacher" name="classTeacher" value={formData.classTeacher} onChange={handleChange}
                                icon={User} placeholder="e.g. Mrs. Alice Johnson"
                            />
                        </div>

                        <div className="col-span-12 md:col-span-6">
                            <FormField
                                label="Room Number" name="roomNumber" value={formData.roomNumber} onChange={handleChange}
                                icon={School} placeholder="e.g. 101-B"
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormField
                                label="Student Capacity" name="capacity" value={formData.capacity} onChange={handleChange}
                                type="number" icon={Users} placeholder="e.g. 40"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-4 shrink-0">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="class-form"
                        type="submit"
                        className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold text-sm hover:from-orange-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200 hover:-translate-y-0.5"
                    >
                        <Send className="w-4 h-4" />
                        {initialData ? 'Update Class' : 'Create Class'}
                    </button>
                </div>

            </motion.div>
        </div>
    );
}
