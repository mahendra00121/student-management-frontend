'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Book, Hash, FileText, Award, Send
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
                    rows={2}
                    className={clsx(inputClasses, "resize-none h-[82px] peer")}
                />
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


interface SubjectFormProps {
    onCancel?: () => void;
    onSuccess?: (data: any) => void;
    initialData?: any;
}

export default function SubjectForm({ onCancel, onSuccess, initialData }: SubjectFormProps) {
    const [formData, setFormData] = useState({
        subjectName: initialData?.subjectName || '',
        subjectCode: initialData?.subjectCode || '',
        description: initialData?.description || '',
        credits: initialData?.credits || ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                subjectName: initialData.subjectName || '',
                subjectCode: initialData.subjectCode || '',
                description: initialData.description || '',
                credits: initialData.credits || ''
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.subjectName) {
            toast.error("Subject Name is required.");
            return false;
        }
        if (!formData.subjectCode) {
            toast.error("Subject Code is required.");
            return false;
        }
        if (!formData.credits || Number(formData.credits) < 0) {
            toast.error("Valid Credits value is required.");
            return false;
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (onSuccess) onSuccess({
            ...formData,
            credits: Number(formData.credits)
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
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-5 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md shadow-inner">
                            <Book className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-wide">
                                {initialData ? 'Edit Subject' : 'Add New Subject'}
                            </h1>
                            <p className="text-blue-100 text-sm opacity-80">Manage curriculum subjects</p>
                        </div>
                    </div>
                </div>

                <form id="subject-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-gray-50">
                    <div className="grid grid-cols-12 gap-x-6 gap-y-6">

                        <div className="col-span-12">
                            <FormField
                                label="Subject Name" name="subjectName" value={formData.subjectName} onChange={handleChange}
                                icon={Book} placeholder="e.g. Mathematics"
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormField
                                label="Subject Code" name="subjectCode" value={formData.subjectCode} onChange={handleChange}
                                icon={Hash} placeholder="e.g. MATH101"
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormField
                                label="Credits" name="credits" value={formData.credits} onChange={handleChange}
                                type="number" icon={Award} placeholder="e.g. 4"
                            />
                        </div>

                        <div className="col-span-12">
                            <FormField
                                label="Description (Optional)" name="description" value={formData.description} onChange={handleChange}
                                isTextArea icon={FileText} placeholder="Brief description of the subject..." required={false}
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
                        form="subject-form"
                        type="submit"
                        className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:-translate-y-0.5"
                    >
                        <Send className="w-4 h-4" />
                        {initialData ? 'Update Subject' : 'Save Subject'}
                    </button>
                </div>

            </motion.div>
        </div>
    );
}
