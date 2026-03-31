'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Users, AlertCircle, RefreshCw, School, Hash, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import DeleteModal from '@/components/DeleteModal';
import { TableSkeleton } from '@/components/SkeletonLoader';
import ClassForm from '@/components/ClassForm';

const API_URL = "http://localhost:5081/api/classes";

export default function ClassesPage() {
    const [showForm, setShowForm] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    const [editingClass, setEditingClass] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: 'single' as 'single' | 'all',
        id: null as number | null,
    });

    // 1. Fetch Classes
    const fetchClasses = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch classes. Backend up?');
            const data = await response.json();
            setClasses(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error connecting to server');
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleAddClass = () => {
        setEditingClass(null);
        setShowForm(true);
    };

    const handleEdit = (cls: any) => {
        setEditingClass(cls);
        setShowForm(true);
    };

    // --- DELETE HANDLERS ---
    const confirmDelete = (id: number) => {
        setDeleteModal({ isOpen: true, type: 'single', id });
    };

    const confirmDeleteAll = () => {
        setDeleteModal({ isOpen: true, type: 'all', id: null });
    };

    const performDelete = async () => {
        const isAll = deleteModal.type === 'all';
        const url = isAll ? `${API_URL}/all` : `${API_URL}/${deleteModal.id}`;

        const promise = fetch(url, { method: 'DELETE' }).then(async (res) => {
            if (!res.ok) throw new Error('Failed to delete');
            await fetchClasses();
            return isAll ? 'All records deleted' : 'Class record deleted';
        });

        toast.promise(promise, {
            loading: 'Deleting...',
            success: (data) => `${data} successfully.`,
            error: (err) => `Error: ${err.message}`
        });
    };

    const handleFormSuccess = async (formData: any) => {
        const isEdit = !!editingClass;

        const operationPromise = async () => {
            let res;
            if (isEdit) {
                res = await fetch(API_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingClass.id, ...formData })
                });
            } else {
                res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            if (!res.ok) throw new Error(isEdit ? 'Failed to update' : 'Failed to create');

            setShowForm(false);
            setEditingClass(null);
            await fetchClasses();
            return isEdit ? 'Class updated' : 'Class added';
        };

        toast.promise(operationPromise(), {
            loading: isEdit ? 'Updating class...' : 'Adding class...',
            success: (msg) => `${msg} successfully!`,
            error: (err) => `Failed: ${err.message}`
        });
    };

    // Filter 
    const filteredClasses = classes.filter(c =>
        c.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.classTeacher?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If form is active
    if (showForm) {
        return (
            <main>
                <ClassForm
                    initialData={editingClass}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingClass(null);
                    }}
                    onSuccess={handleFormSuccess}
                />
            </main>
        );
    }

    return (
        <div className="h-screen w-full bg-gray-50/50 flex flex-col overflow-hidden font-sans text-gray-800">
            <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6 h-full">

                {/* Header Section */}
                <div className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <School className="w-8 h-8 text-black" />
                            Classes & Sections
                            <span className="ml-2 bg-gray-900 text-white text-sm py-1 px-3 rounded-full shadow-sm border border-gray-700">
                                {classes.length}
                            </span>
                        </h1>
                        <p className="text-gray-700 mt-1 text-base font-medium">Manage academic class structures and allocations.</p>
                    </div>

                    <div className="flex gap-3">
                        {classes.length > 0 && (
                            <button
                                onClick={confirmDeleteAll}
                                className="group shrink-0 flex items-center justify-center gap-2 bg-white border-2 border-red-50 hover:bg-red-50 text-red-600 px-5 py-3 rounded-xl font-semibold transition-all hover:-translate-y-1"
                            >
                                <Trash2 className="w-5 h-5" />
                                <span className="hidden sm:inline">Delete All</span>
                            </button>
                        )}
                        <button
                            onClick={handleAddClass}
                            className="group shrink-0 flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-gray-200 transition-all hover:-translate-y-1 hover:shadow-xl"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            Add New Class
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="shrink-0 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 pl-4">
                    <Search className="text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search classes by name, teacher..."
                        className="flex-1 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    />
                    <button
                        onClick={fetchClasses}
                        className="p-3 text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-medium">
                        {error} (Did you create the "Classes" table in SQL?)
                    </div>
                )}

                {/* List */}
                <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col min-h-0">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse relative">
                            <thead className="sticky top-0 z-10 bg-white shadow-sm">
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                    <th className="px-8 py-5 whitespace-nowrap bg-gray-50/90 backdrop-blur-sm">Class Name</th>
                                    <th className="px-6 py-5 whitespace-nowrap bg-gray-50/90 backdrop-blur-sm">Section</th>
                                    <th className="px-6 py-5 whitespace-nowrap bg-gray-50/90 backdrop-blur-sm">Class Teacher</th>
                                    <th className="px-6 py-5 hidden md:table-cell whitespace-nowrap bg-gray-50/90 backdrop-blur-sm">Room</th>
                                    <th className="px-6 py-5 hidden md:table-cell whitespace-nowrap bg-gray-50/90 backdrop-blur-sm">Capacity</th>
                                    <th className="px-8 py-5 text-right whitespace-nowrap bg-gray-50/90 backdrop-blur-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <TableSkeleton count={5} />
                                ) : filteredClasses.length > 0 ? (
                                    filteredClasses.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg pointer-events-none shrink-0">
                                                        <BookOpen className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-base">{c.className}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap">
                                                    {c.section}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">{c.classTeacher || '-'}</td>
                                            <td className="px-6 py-4 hidden md:table-cell text-gray-500 whitespace-nowrap">{c.roomNumber}</td>
                                            <td className="px-6 py-4 hidden md:table-cell text-gray-500 whitespace-nowrap">{c.capacity}</td>
                                            <td className="px-8 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                                    <button onClick={() => handleEdit(c)} className="p-3 md:p-2 text-gray-500 md:text-gray-400 hover:text-orange-600 hover:bg-white hover:shadow-md rounded-xl transition-all"><Edit2 className="w-5 h-5 md:w-4 md:h-4" /></button>
                                                    <button onClick={() => confirmDelete(c.id)} className="p-3 md:p-2 text-gray-500 md:text-gray-400 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all"><Trash2 className="w-5 h-5 md:w-4 md:h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-20 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                    <School className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="text-lg font-medium text-gray-500">{loading ? 'Loading...' : 'No classes found.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={performDelete}
                title={deleteModal.type === 'all' ? "Delete All Classes?" : "Remove Class?"}
                description={deleteModal.type === 'all'
                    ? "This will wipe the entire class directory. Alert?"
                    : "Are you sure you want to remove this class record?"}
            />
        </div>
    );
}
