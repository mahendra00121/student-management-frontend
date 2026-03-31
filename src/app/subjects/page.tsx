'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, RefreshCw, Book, Hash, Award, Link as LinkIcon, School, Users } from 'lucide-react';
import { toast } from 'sonner';
import DeleteModal from '@/components/DeleteModal';
import { TableSkeleton } from '@/components/SkeletonLoader';
import SubjectForm from '@/components/SubjectForm';
import AllocationForm from '@/components/AllocationForm';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const API_SUBJECTS = "http://localhost:5081/api/subjects";
const API_ALLOCATIONS = "http://localhost:5081/api/SubjectAllocations";
const API_CLASSES = "http://localhost:5081/api/classes";
const API_TEACHERS = "http://localhost:5081/api/teachers";

export default function SubjectsPage() {
    const [activeTab, setActiveTab] = useState<'subjects' | 'allocations'>('subjects');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // Data
    const [subjects, setSubjects] = useState<any[]>([]);
    const [allocations, setAllocations] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);

    const [editingSubject, setEditingSubject] = useState<any>(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null as number | null, type: 'subject' }); // type: 'subject' | 'allocation'

    // Fetchers
    const loadData = async () => {
        setLoading(true);
        try {
            const [subRes, allocRes, classRes, teachRes] = await Promise.all([
                fetch(API_SUBJECTS),
                fetch(API_ALLOCATIONS),
                fetch(API_CLASSES),
                fetch(API_TEACHERS)
            ]);

            if (subRes.ok) setSubjects(await subRes.json());
            if (allocRes.ok) setAllocations(await allocRes.json());
            if (classRes.ok) setClasses(await classRes.json());
            if (teachRes.ok) setTeachers(await teachRes.json());

        } catch (error) {
            console.error(error);
            toast.error("Failed to load data. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handlers
    const confirmDelete = (id: number, type: 'subject' | 'allocation') => {
        setDeleteModal({ isOpen: true, id, type: type as any });
    };

    const performDelete = async () => {
        const url = deleteModal.type === 'subject'
            ? `${API_SUBJECTS}/${deleteModal.id}`
            : `${API_ALLOCATIONS}/${deleteModal.id}`;

        const promise = fetch(url, { method: 'DELETE' }).then(async (res) => {
            if (!res.ok) throw new Error("Delete failed");
            await loadData();
            return "Deleted successfully";
        });

        toast.promise(promise, {
            loading: 'Deleting...',
            success: (msg) => msg,
            error: 'Failed to delete'
        });
        setDeleteModal({ ...deleteModal, isOpen: false });
    };

    const handleSubjectSuccess = async (formData: any) => {
        const isEdit = !!editingSubject;
        const url = API_SUBJECTS;
        const method = isEdit ? 'PUT' : 'POST';
        const body = isEdit ? { id: editingSubject.id, ...formData } : formData;

        const promise = fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(async res => {
            if (!res.ok) throw new Error("Failed");
            await loadData();
            setShowForm(false);
            setEditingSubject(null);
        });

        toast.promise(promise, {
            loading: 'Saving...',
            success: 'Saved successfully',
            error: 'Failed to save'
        });
    };

    // Render Forms
    if (showForm) {
        if (activeTab === 'subjects') {
            return (
                <main>
                    <SubjectForm
                        initialData={editingSubject}
                        onCancel={() => { setShowForm(false); setEditingSubject(null); }}
                        onSuccess={handleSubjectSuccess}
                    />
                </main>
            );
        } else {
            return (
                <main>
                    <AllocationForm
                        onCancel={() => setShowForm(false)}
                        onSuccess={() => { setShowForm(false); loadData(); }}
                        classes={classes}
                        subjects={subjects}
                        teachers={teachers}
                    />
                </main>
            );
        }
    }

    return (
        <div className="h-screen w-full bg-gray-50/50 flex flex-col overflow-hidden font-sans text-gray-800">
            <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6 h-full">

                {/* Header & Tabs */}
                <div className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <Book className="w-8 h-8 text-black" />
                            Curriculum & Assign
                        </h1>
                        <p className="text-gray-700 mt-1 font-medium">Manage subjects and assign them to classes.</p>
                    </div>
                </div>

                {/* Tabs Switcher */}
                <div className="shrink-0 bg-white p-1 rounded-2xl shadow-sm border border-gray-200 inline-flex w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('subjects')}
                        className={clsx("flex-1 md:w-48 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                            activeTab === 'subjects' ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-50")}
                    >
                        <Book className="w-4 h-4" />
                        Subjects Master
                    </button>
                    <button
                        onClick={() => setActiveTab('allocations')}
                        className={clsx("flex-1 md:w-48 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                            activeTab === 'allocations' ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-50")}
                    >
                        <LinkIcon className="w-4 h-4" />
                        Class Allocations
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100 pl-4">
                    <p className="text-sm font-semibold text-gray-500">
                        {activeTab === 'subjects' ? `${subjects.length} Subjects Found` : `${allocations.length} Active Allocations`}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={loadData} className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
                        <button
                            onClick={() => { setEditingSubject(null); setShowForm(true); }}
                            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-gray-200 hover:opacity-90 transition-all text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            {activeTab === 'subjects' ? 'Add Subject' : 'Assign Subject'}
                        </button>
                    </div>
                </div>

                {/* Table View */}
                <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col min-h-0">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse relative">
                            <thead className="sticky top-0 z-10 bg-white shadow-sm">
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                    {activeTab === 'subjects' ? (
                                        <>
                                            <th className="px-8 py-5">Subject Name</th>
                                            <th className="px-6 py-5">Code</th>
                                            <th className="px-6 py-5">Credits</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-8 py-5">Class & Section</th>
                                            <th className="px-6 py-5">Subject</th>
                                            <th className="px-6 py-5">Assigned Teacher</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && <TableSkeleton count={3} />}

                                {!loading && activeTab === 'subjects' && subjects.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-4 font-bold text-gray-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Book className="w-4 h-4" /></div>
                                            {sub.subjectName}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{sub.subjectCode}</td>
                                        <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">{sub.credits} Credits</span></td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex justify-end gap-2 transition-opacity">
                                                <button onClick={() => { setEditingSubject(sub); setShowForm(true); }} className="p-3 md:p-2 text-gray-500 md:text-gray-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold"><Edit2 className="w-5 h-5 md:w-4 md:h-4" /></button>
                                                <button onClick={() => confirmDelete(sub.id, 'subject')} className="p-3 md:p-2 text-gray-500 md:text-gray-400 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold"><Trash2 className="w-5 h-5 md:w-4 md:h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {!loading && activeTab === 'allocations' && allocations.map(alloc => (
                                    <tr key={alloc.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-8 py-4 font-bold text-gray-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><School className="w-4 h-4" /></div>
                                            <span className="whitespace-nowrap">{alloc.className} - {alloc.section}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 font-medium whitespace-nowrap">
                                            {alloc.subjectName} <span className="text-gray-400 text-xs">({alloc.subjectCode})</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 flex items-center gap-2 whitespace-nowrap">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            {alloc.teacherName}
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex justify-end transition-opacity">
                                                <button onClick={() => confirmDelete(alloc.id, 'allocation')} className="p-3 md:p-2 text-gray-500 md:text-gray-400 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-xl transition-all font-bold"><Trash2 className="w-5 h-5 md:w-4 md:h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && ((activeTab === 'subjects' && subjects.length === 0) || (activeTab === 'allocations' && allocations.length === 0)) && (
                            <div className="p-12 text-center text-gray-400">No records found.</div>
                        )}
                    </div>
                </div>
            </div>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={performDelete}
                title="Confirm Delete"
                description="Are you sure you want to remove this record? This cannot be undone."
            />
        </div>
    );
}
