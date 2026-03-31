'use client';

import React, { useEffect, useState } from 'react';
import {
    Users, Plus, Search, Trash2, Edit2,
    RefreshCw, Mail, Phone, Calendar, Award,
    Briefcase, Book, User, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import TeacherRegistrationForm from '@/components/TeacherRegistrationForm';
import DeleteModal from '@/components/DeleteModal';
import { TableSkeleton } from '@/components/SkeletonLoader';

const API_TEACHERS = "http://localhost:5081/api/teachers";

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState<any>(null);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_TEACHERS);
            if (res.ok) {
                const data = await res.json();
                setTeachers(data);
            } else {
                toast.error("Failed to load faculty directory");
            }
        } catch (error) {
            toast.error("Network error. Backend might be offline.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleDelete = async () => {
        try {
            const res = await fetch(`${API_TEACHERS}/${teacherToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Faculty record removed");
                fetchTeachers();
                setIsDeleteModalOpen(false);
            } else {
                toast.error("Failed to delete record");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.qualification?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-screen w-full bg-gray-50/50 flex flex-col overflow-hidden font-sans text-gray-800">
            <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6 h-full">

                {/* Header Section */}
                <div className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <Users className="w-8 h-8 text-black" />
                            Faculty Directory
                            <span className="ml-2 bg-gray-900 text-white text-sm py-1 px-3 rounded-full shadow-sm border border-gray-700">
                                {teachers.length}
                            </span>
                        </h1>
                        <p className="text-gray-700 mt-1 text-base font-medium">Coordinate teaching staff and faculty assignments.</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => { setEditingTeacher(null); setIsFormOpen(true); }}
                            className="group shrink-0 flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-gray-200 transition-all hover:-translate-y-1 hover:shadow-xl"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            Add Faculty
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="shrink-0 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 pl-4">
                    <Search className="text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, subject or qualification..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    />
                    <button
                        onClick={fetchTeachers}
                        className="p-3 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* List Container */}
                <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col min-h-0">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse relative">
                            <thead className="sticky top-0 z-10 bg-white shadow-sm">
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                    <th className="px-8 py-5 whitespace-nowrap bg-gray-50/90 backdrop-blur-sm">Faculty Member</th>
                                    <th className="px-6 py-5 whitespace-nowrap bg-gray-50/90 backdrop-blur-sm">Subject & Expertise</th>
                                    <th className="px-6 py-5 whitespace-nowrap bg-gray-50/90 backdrop-blur-sm">Experience & Contact</th>
                                    <th className="px-6 py-5 hidden md:table-cell whitespace-nowrap bg-gray-50/90 backdrop-blur-sm">Verified On</th>
                                    <th className="px-8 py-5 text-right whitespace-nowrap bg-gray-50/90 backdrop-blur-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <TableSkeleton count={5} />
                                ) : filteredTeachers.length > 0 ? (
                                    filteredTeachers.map((teacher) => (
                                        <tr key={teacher.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg pointer-events-none shrink-0">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-base">{teacher.name}</p>
                                                        <p className="text-xs font-medium text-gray-400">{teacher.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap">
                                                        {teacher.subject}
                                                    </span>
                                                    <span className="text-xs font-medium text-gray-500">{teacher.qualification}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-800 font-semibold text-sm">{teacher.phone}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{teacher.experience} Experience</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell text-gray-500 whitespace-nowrap">
                                                <span className="text-xs font-semibold text-gray-600">{teacher.joinDate || '-'}</span>
                                            </td>
                                            <td className="px-8 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                                    <button
                                                        onClick={() => { setEditingTeacher(teacher); setIsFormOpen(true); }}
                                                        className="p-3 md:p-2 text-gray-500 md:text-gray-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                    >
                                                        <Edit2 className="w-5 h-5 md:w-4 md:h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setTeacherToDelete(teacher); setIsDeleteModalOpen(true); }}
                                                        className="p-3 md:p-2 text-gray-500 md:text-gray-400 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                                    <Users className="w-10 h-10" />
                                                </div>
                                                <p className="text-lg font-medium text-gray-500">No faculty found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TeacherRegistrationForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchTeachers}
                teacher={editingTeacher}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Remove Faculty Member"
                description={`Are you sure you want to remove ${teacherToDelete?.name} from the records? All associated data will be archived.`}
            />
        </div>
    );
}
