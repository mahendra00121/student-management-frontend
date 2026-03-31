'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, RefreshCw, Banknote, Filter, Download, History, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import DeleteModal from '@/components/DeleteModal';
import { TableSkeleton } from '@/components/SkeletonLoader';
import FeeForm from '@/components/FeeForm';
import ReceiptModal from '@/components/ReceiptModal';
import { clsx } from 'clsx';

const API_FEES = "http://localhost:5081/api/fees";
const API_STATUS = "http://localhost:5081/api/fees/status";

export default function FeesPage() {
    const [activeTab, setActiveTab] = useState<'transactions' | 'pending'>('transactions');
    const [fees, setFees] = useState<any[]>([]);
    const [statusList, setStatusList] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | undefined>(undefined);
    const [receiptData, setReceiptData] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null as number | null });

    // Fetch Data
    const loadData = async () => {
        setLoading(true);
        try {
            const [feeRes, statusRes] = await Promise.all([
                fetch(API_FEES),
                fetch(API_STATUS)
            ]);

            if (feeRes.ok) setFees(await feeRes.json());
            if (statusRes.ok) setStatusList(await statusRes.json());

        } catch (error) {
            console.error(error);
            toast.error("Could not load fee records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Perform Filter
    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        if (activeTab === 'transactions') {
            setFilteredData(fees.filter(f =>
                f.studentName?.toLowerCase().includes(lowerSearch) ||
                f.rollNo?.toString().includes(lowerSearch)
            ));
        } else {
            setFilteredData(statusList.filter(s =>
                s.name?.toLowerCase().includes(lowerSearch) ||
                s.rollNo?.toString().includes(lowerSearch)
            ));
        }
    }, [searchTerm, fees, statusList, activeTab]);

    const performDelete = async () => {
        const promise = fetch(`${API_FEES}/${deleteModal.id}`, { method: 'DELETE' })
            .then(async res => {
                if (!res.ok) throw new Error("Failed");
                await loadData();
            });

        toast.promise(promise, {
            loading: 'Deleting...',
            success: 'Record deleted',
            error: 'Failed to delete'
        });
        setDeleteModal({ isOpen: false, id: null });
    };

    return (
        <div className="h-screen w-full bg-gray-50/50 flex flex-col overflow-hidden font-sans text-gray-800">
            {/* Modal & Form Overlays */}
            {showForm && <FeeForm onCancel={() => { setShowForm(false); setSelectedStudentId(undefined); }} onSuccess={() => { setShowForm(false); setSelectedStudentId(undefined); loadData(); }} initialStudentId={selectedStudentId} />}
            <ReceiptModal isOpen={!!receiptData} onClose={() => setReceiptData(null)} data={receiptData} />
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={performDelete}
                title="Delete Record?"
                description="This will permanently remove this transaction record."
            />

            <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6 h-full">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <Banknote className="w-8 h-8 text-green-600" />
                            Fee Management
                        </h1>
                        <p className="text-gray-600 font-medium mt-1">Collect fees, track history and view pending dues.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-200 flex items-center gap-2 transition-all hover:-translate-y-1"
                    >
                        <Plus className="w-5 h-5" /> Collect Fee
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-200 inline-flex w-full md:w-auto self-start">
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={clsx("flex-1 md:w-40 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                            activeTab === 'transactions' ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-50")}
                    >
                        <History className="w-4 h-4" /> Transactions
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={clsx("flex-1 md:w-40 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                            activeTab === 'pending' ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-50")}
                    >
                        <AlertCircle className="w-4 h-4" /> Pending / Dues
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2 pl-4">
                    <Search className="text-gray-400 w-5 h-5 self-center" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search by student name..."
                        className="flex-1 py-3 outline-none text-gray-700"
                    />
                    <button onClick={loadData} className="p-3 hover:bg-gray-100 rounded-xl"><RefreshCw className={loading ? "animate-spin" : ""} /></button>
                </div>

                {/* Table */}
                <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col min-h-0">
                    <div className="overflow-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold sticky top-0 z-10 shadow-sm">
                                <tr>
                                    {activeTab === 'transactions' ? (
                                        <>
                                            <th className="px-8 py-5">Student</th>
                                            <th className="px-6 py-5">Amount</th>
                                            <th className="px-6 py-5">Date</th>
                                            <th className="px-6 py-5">Mode</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-8 py-5">Student</th>
                                            <th className="px-6 py-5">Class</th>
                                            <th className="px-6 py-5">Total Fee</th>
                                            <th className="px-6 py-5">Paid</th>
                                            <th className="px-6 py-5 text-red-600">Pending</th>
                                            <th className="px-6 py-5">Status</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && <TableSkeleton count={5} />}

                                {/* Transactions View */}
                                {!loading && activeTab === 'transactions' && filteredData.map(fee => (
                                    <tr key={fee.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-8 py-4">
                                            <div className="font-bold text-gray-900">{fee.studentName}</div>
                                            <div className="text-xs text-gray-500">{fee.class} | Roll: {fee.rollNo}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-600">₹{fee.amount}</td>
                                        <td className="px-6 py-4 text-gray-600">{new Date(fee.paymentDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">{fee.paymentMode}</span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setReceiptData(fee)} className="p-3 md:p-2 hover:bg-blue-50 text-blue-600 rounded-xl" title="View Receipt">
                                                    <Download className="w-5 h-5 md:w-4 md:h-4" />
                                                </button>
                                                <button onClick={() => setDeleteModal({ isOpen: true, id: fee.id })} className="p-3 md:p-2 hover:bg-red-50 text-red-600 rounded-xl">
                                                    <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {/* Pending View */}
                                {!loading && activeTab === 'pending' && filteredData.map(stat => (
                                    <tr key={stat.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-4 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{stat.name}</div>
                                            <div className="text-xs text-gray-500">Roll: {stat.rollNo}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{stat.class}</td>
                                        <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">₹{stat.totalFee}</td>
                                        <td className="px-6 py-4 text-green-600 font-medium whitespace-nowrap">₹{stat.paid}</td>
                                        <td className="px-6 py-4 text-red-600 font-bold whitespace-nowrap">₹{stat.pending}</td>
                                        <td className="px-6 py-4">
                                            {stat.pending <= 0 ? (
                                                <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold w-fit whitespace-nowrap">
                                                    <CheckCircle className="w-3 h-3" /> Paid
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold w-fit whitespace-nowrap">
                                                        <AlertCircle className="w-3 h-3" /> Due
                                                    </span>
                                                    <button
                                                        onClick={() => { setSelectedStudentId(stat.id); setShowForm(true); }}
                                                        className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 flex items-center gap-1 shadow-md transition-transform active:scale-95 shrink-0 whitespace-nowrap"
                                                    >
                                                        Pay Now
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!loading && filteredData.length === 0 && (
                            <div className="p-12 text-center text-gray-400">No records found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
