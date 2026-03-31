'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, RefreshCw, Users, FileText, Phone, Filter } from 'lucide-react';
import { toast } from 'sonner';
import DeleteModal from '@/components/DeleteModal';
import { TableSkeleton } from '@/components/SkeletonLoader';
import StudentRegistrationForm from '@/components/StudentRegistrationForm';
import { clsx } from 'clsx';

const API_STUDENTS = "http://localhost:5081/api/students";

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState<any>(null);

    // Delete State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

    const loadStudents = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_STUDENTS);
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            } else {
                toast.error("Failed to fetch students");
            }
        } catch (error) {
            console.error(error);
            toast.error("Check backend connection");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const handleDelete = async () => {
        if (!deleteModal.id) return;

        try {
            const res = await fetch(`${API_STUDENTS}/${deleteModal.id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Student deleted successfully");
                loadStudents();
            } else {
                toast.error("Failed to delete student");
            }
        } catch (error) {
            toast.error("Error deleting student");
        }
        setDeleteModal({ isOpen: false, id: null });
    };

    // Filter Logic
    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.fatherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.class?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen w-full bg-gray-50/50 flex flex-col overflow-hidden font-sans text-gray-800">
            <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6 h-full">

                {/* Header */}
                <div className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
                            <Users className="w-8 h-8 text-indigo-600" />
                            Student Directory
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium">Manage student enrollments, profiles, and academic records.</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="shrink-0 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
                    {/* Search */}
                    <div className="relative flex-1 w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, roll no, or class..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button onClick={loadStudents} className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors" title="Refresh">
                            <RefreshCw className={clsx("w-5 h-5", loading && "animate-spin")} />
                        </button>
                        <button
                            onClick={() => { setEditingStudent(null); setShowForm(true); }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add Student
                        </button>
                    </div>
                </div>

                {/* Table View */}
                <div className="flex-1 bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col min-h-0">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse relative">
                            <thead className="sticky top-0 z-10 bg-white shadow-sm">
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-extrabold tracking-wider">
                                    <th className="px-8 py-5">Student Profile</th>
                                    <th className="px-6 py-5">Roll No</th>
                                    <th className="px-6 py-5">Class Info</th>
                                    <th className="px-6 py-5">Parent Details</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <TableSkeleton count={5} />
                                ) : filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-50 text-indigo-600 flex items-center justify-center font-black text-sm uppercase shadow-sm">
                                                        {student.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{student.name}</div>
                                                        <div className="text-xs font-semibold text-gray-400 flex items-center gap-1 mt-0.5">
                                                            <Phone className="w-3 h-3" /> {student.contact}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                                    #{student.rollNo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 text-sm">Class {student.class}</span>
                                                    <span className="text-xs font-medium text-gray-400">Section {student.section}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-600">{student.fatherName}</span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex justify-end gap-2 transition-opacity">
                                                    <button
                                                        onClick={() => { setEditingStudent(student); setShowForm(true); }}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                        title="Edit Profile"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal({ isOpen: true, id: student.id })}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-300">
                                                <Filter className="w-12 h-12 mb-4 opacity-20" />
                                                <p className="text-lg font-bold">No students found</p>
                                                <p className="text-sm">Try adjusting your search or add a new student.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gray-50/50 p-4 border-t border-gray-100 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Total Records: {filteredStudents.length}
                    </div>
                </div>

            </div>

            {/* Modals */}
            <StudentRegistrationForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSuccess={() => { loadStudents(); setShowForm(false); }}
                student={editingStudent}
            />

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title="Remove Student?"
                description="This will permanently delete the student's profile and all associated academic records."
                isDestructive={true}
            />
        </div>
    );
}
