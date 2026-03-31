'use client';

import React, { useState, useEffect } from 'react';
import { Award, FileText, Plus, Save, Search, CheckCircle2, TrendingUp, Calendar, Trash2, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton } from '@/components/SkeletonLoader';
import DeleteModal from '@/components/DeleteModal';

const API_EXAMS = "http://localhost:5081/api/exams";
const API_RESULTS = "http://localhost:5081/api/results";
const API_CLASSES = "http://localhost:5081/api/classes";
const API_SUBJECTS = "http://localhost:5081/api/subjects";

export default function ExamsPage() {
    const [activeTab, setActiveTab] = useState<'exams' | 'results' | 'reports'>('exams');
    const [loading, setLoading] = useState(true);

    // Exams Data
    const [exams, setExams] = useState<any[]>([]);
    const [showExamForm, setShowExamForm] = useState(false);
    const [examData, setExamData] = useState({ examName: '', session: '', startDate: '', endDate: '', isActive: true });

    // Results Data
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedFilters, setSelectedFilters] = useState({ examId: '', class: '', section: '', subjectId: '' });
    const [fetchedContext, setFetchedContext] = useState({ examId: '', subjectId: '' }); // Store context for saving
    const [students, setStudents] = useState<any[]>([]); // Students with marks

    // Report Cards Data
    const [reportFilters, setReportFilters] = useState({ examId: '', class: '', section: '' });
    const [reportData, setReportData] = useState<any[]>([]);
    const [selectedStudentForPrint, setSelectedStudentForPrint] = useState<number | null>(null);
    const [studentMarksheet, setStudentMarksheet] = useState<any[]>([]);

    // Delete State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null }>({ isOpen: false, id: null });

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [examRes, classRes, subRes] = await Promise.all([
                fetch(API_EXAMS),
                fetch(API_CLASSES),
                fetch(API_SUBJECTS)
            ]);

            if (examRes.ok) setExams(await examRes.json());
            if (classRes.ok) setClasses(await classRes.json());
            if (subRes.ok) setSubjects(await subRes.json());
        } catch (error) {
            toast.error("Failed to load initial data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    // Exam Handlers
    const handleAddExam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(API_EXAMS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(examData)
            });
            if (res.ok) {
                toast.success("Exam created successfully");
                setShowExamForm(false);
                loadInitialData();
                setExamData({ examName: '', session: '', startDate: '', endDate: '', isActive: true });
            } else {
                toast.error("Failed to create exam");
            }
        } catch {
            toast.error("Error creating exam");
        }
    };

    const handleDeleteExam = async () => {
        if (!deleteModal.id) return;
        try {
            const res = await fetch(`${API_EXAMS}/${deleteModal.id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Exam deleted successfully");
                loadInitialData();
            } else {
                toast.error("Failed to delete exam");
            }
        } catch {
            toast.error("Error deleting exam");
        }
        setDeleteModal({ isOpen: false, id: null });
    };

    // Results Handlers
    const fetchStudentsForResults = async () => {
        if (!selectedFilters.examId || !selectedFilters.class || !selectedFilters.section || !selectedFilters.subjectId) {
            toast.error("Please select all filters");
            return;
        }

        setLoading(true);
        try {
            // Encode parameters to handle special characters properly
            const query = new URLSearchParams({
                examId: selectedFilters.examId,
                className: selectedFilters.class,
                section: selectedFilters.section,
                subjectId: selectedFilters.subjectId
            }).toString();

            const res = await fetch(`${API_RESULTS}?${query}`);
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
                setFetchedContext({
                    examId: selectedFilters.examId,
                    subjectId: selectedFilters.subjectId
                });
                if (data.length === 0) toast.info("No students found for selected criteria");
            } else {
                const err = await res.text();
                toast.error("Failed to fetch: " + err);
            }
        } catch (err) {
            console.error(err);
            toast.error("Network error fetching students");
        } finally {
            setLoading(false);
        }
    };

    const handleMarksChange = (studentId: number, field: string, value: string) => {
        setStudents(prev => prev.map(s =>
            s.studentId === studentId ? { ...s, [field]: value } : s
        ));
    };

    const saveResults = async () => {
        if (!fetchedContext.examId || !fetchedContext.subjectId) {
            toast.error("No active session. Please fetch students again.");
            return;
        }

        try {
            const payload = {
                examId: parseInt(fetchedContext.examId),
                subjectId: parseInt(fetchedContext.subjectId),
                results: students.map(s => ({
                    studentId: s.studentId,
                    studentName: s.studentName,
                    rollNo: s.rollNo,
                    marksObtained: parseFloat(s.marksObtained) || 0,
                    maxMarks: parseFloat(s.maxMarks) || 100,
                    remarks: s.remarks || ''
                }))
            };

            const res = await fetch(API_RESULTS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Results saved successfully");
            } else {
                const errText = await res.text();
                toast.error("Failed to save: " + errText);
                console.error("Save Error:", errText);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error saving results. Check console.");
        }
    };

    // Report Card Handlers
    const fetchReportCards = async () => {
        if (!reportFilters.examId || !reportFilters.class || !reportFilters.section) {
            toast.error("Please select all filters");
            return;
        }
        setLoading(true);
        try {
            const query = new URLSearchParams({
                examId: reportFilters.examId,
                className: reportFilters.class,
                section: reportFilters.section
            }).toString();

            const res = await fetch(`${API_RESULTS}/generate?${query}`);
            if (res.ok) {
                const data = await res.json();
                setReportData(data);
            } else {
                toast.error("Failed to fetch report data");
            }
        } catch {
            toast.error("Error generating reports");
        } finally {
            setLoading(false);
        }
    };

    const viewStudentMarksheet = async (studentId: number) => {
        if (selectedStudentForPrint === studentId) {
            setSelectedStudentForPrint(null);
            return;
        }

        try {
            const res = await fetch(`${API_RESULTS}/student-marksheet?studentId=${studentId}&examId=${reportFilters.examId}`);
            if (res.ok) {
                const data = await res.json();
                setStudentMarksheet(data);
                setSelectedStudentForPrint(studentId);
            } else {
                toast.error("Failed to load marksheet details");
            }
        } catch {
            toast.error("Error loading marksheet");
        }
    }


    return (
        <div className="h-screen w-full bg-gray-50/50 flex flex-col overflow-hidden font-sans text-gray-800">
            <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6 h-full">

                {/* Header */}
                <div className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
                            <Award className="w-8 h-8 text-indigo-600" />
                            Exams & Results
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium">Manage examinations, upload marks, and generate report cards.</p>
                    </div>
                </div>

                {/* Tabs Switcher */}
                <div className="shrink-0 bg-white p-1 rounded-2xl shadow-sm border border-gray-200 inline-flex w-full md:w-auto self-start">
                    <button
                        onClick={() => setActiveTab('exams')}
                        className={clsx("flex-1 md:w-48 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                            activeTab === 'exams' ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50")}
                    >
                        <Calendar className="w-4 h-4" />
                        Exam Schedule
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={clsx("flex-1 md:w-48 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                            activeTab === 'results' ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50")}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Enter Marks
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={clsx("flex-1 md:w-48 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                            activeTab === 'reports' ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50")}
                    >
                        <FileText className="w-4 h-4" />
                        Report Cards
                    </button>
                </div>

                {/* Tab: EXAMS */}
                {activeTab === 'exams' && (
                    <div className="flex-1 flex flex-col min-h-0 space-y-6">
                        {/* Toolbar */}
                        <div className="flex justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100 pl-4">
                            <p className="text-sm font-semibold text-gray-500">{exams.length} Active Exams</p>
                            <button
                                onClick={() => setShowExamForm(true)}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                            >
                                <Plus className="w-4 h-4" /> Create Exam
                            </button>
                        </div>

                        {/* create form */}
                        <AnimatePresence>
                            {showExamForm && (
                                <motion.form
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    onSubmit={handleAddExam}
                                    className="bg-white p-6 rounded-3xl shadow-lg border border-indigo-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                                >
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Exam Name</label>
                                        <input required value={examData.examName} onChange={e => setExamData({ ...examData, examName: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 font-bold text-sm" placeholder="e.g. Mid Term" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Session</label>
                                        <input required value={examData.session} onChange={e => setExamData({ ...examData, session: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 font-bold text-sm" placeholder="e.g. 2023-24" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Start Date</label>
                                        <input type="date" required value={examData.startDate} onChange={e => setExamData({ ...examData, startDate: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 font-bold text-sm" />
                                    </div>
                                    <button type="submit" className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-emerald-600 transition-colors">
                                        Save Exam
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        {/* List */}
                        <div className="flex-1 bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col min-h-0">
                            <div className="overflow-auto flex-1 custom-scrollbar">
                                <table className="w-full text-left border-collapse relative">
                                    <thead className="sticky top-0 z-10 bg-white shadow-sm">
                                        <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-extrabold tracking-wider">
                                            <th className="px-8 py-5">Exam Name</th>
                                            <th className="px-6 py-5">Session</th>
                                            <th className="px-6 py-5">Duration</th>
                                            <th className="px-6 py-5">Status</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {loading ? <TableSkeleton count={3} /> : exams.map(exam => (
                                            <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-8 py-4 font-bold text-gray-900">{exam.examName}</td>
                                                <td className="px-6 py-4 font-mono text-sm text-gray-600">{exam.session}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(exam.startDate).toLocaleDateString()} - {exam.endDate ? new Date(exam.endDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={clsx("px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                                                        exam.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500")}>
                                                        {exam.isActive ? 'Active' : 'Closed'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <button onClick={() => setDeleteModal({ isOpen: true, id: exam.id })} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: RESULTS */}
                {activeTab === 'results' && (
                    <div className="flex-1 flex flex-col min-h-0 space-y-6">
                        {/* Filters */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Exam</label>
                                <select value={selectedFilters.examId} onChange={e => setSelectedFilters({ ...selectedFilters, examId: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select Exam</option>
                                    {exams.map(e => <option key={e.id} value={e.id}>{e.examName}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Class</label>
                                <select value={selectedFilters.class} onChange={e => setSelectedFilters({ ...selectedFilters, class: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c.id} value={c.className}>{c.className}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Section</label>
                                <select value={selectedFilters.section} onChange={e => setSelectedFilters({ ...selectedFilters, section: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select Section</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Subject</label>
                                <select value={selectedFilters.subjectId} onChange={e => setSelectedFilters({ ...selectedFilters, subjectId: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                                </select>
                            </div>
                            <button onClick={fetchStudentsForResults} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                                <Search className="w-4 h-4" /> Fetch
                            </button>
                        </div>

                        {/* Marks Entry Table */}
                        {students.length > 0 && (
                            <div className="flex-1 bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col min-h-0">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 bg-indigo-50 rounded-lg text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                            {students.length} Students
                                        </div>
                                    </div>
                                    <button onClick={saveResults} className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center gap-2 text-sm">
                                        <Save className="w-4 h-4" /> Save Marks
                                    </button>
                                </div>
                                <div className="overflow-auto flex-1 custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 z-10 bg-white shadow-sm ring-1 ring-gray-900/5">
                                            <tr className="bg-gray-50/50 text-xs uppercase text-gray-500 font-extrabold tracking-wider">
                                                <th className="px-8 py-4">Roll No</th>
                                                <th className="px-6 py-4">Student Name</th>
                                                <th className="px-6 py-4">Marks Obtained</th>
                                                <th className="px-6 py-4">Max Marks</th>
                                                <th className="px-6 py-4">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {students.map(student => (
                                                <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-8 py-4 font-mono text-sm font-bold text-gray-600">{student.rollNo}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-900">{student.studentName}</td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            value={student.marksObtained}
                                                            onChange={(e) => handleMarksChange(student.studentId, 'marksObtained', e.target.value)}
                                                            className="w-24 bg-white border border-gray-200 rounded-lg px-3 py-2 font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            value={student.maxMarks}
                                                            onChange={(e) => handleMarksChange(student.studentId, 'maxMarks', e.target.value)}
                                                            className="w-24 bg-gray-50 border border-transparent rounded-lg px-3 py-2 font-bold text-gray-500 focus:bg-white focus:border-gray-200 outline-none transition-all"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="text"
                                                            value={student.remarks}
                                                            onChange={(e) => handleMarksChange(student.studentId, 'remarks', e.target.value)}
                                                            className="w-full bg-gray-50 border border-transparent rounded-lg px-3 py-2 text-sm font-medium text-gray-700 focus:bg-white focus:border-gray-200 outline-none transition-all"
                                                            placeholder="Excellent..."
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="flex-1 flex flex-col min-h-0 space-y-6">
                        {/* Filters */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Exam</label>
                                <select value={reportFilters.examId} onChange={e => setReportFilters({ ...reportFilters, examId: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select Exam</option>
                                    {exams.map(e => <option key={e.id} value={e.id}>{e.examName}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Class</label>
                                <select value={reportFilters.class} onChange={e => setReportFilters({ ...reportFilters, class: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c.id} value={c.className}>{c.className}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Section</label>
                                <select value={reportFilters.section} onChange={e => setReportFilters({ ...reportFilters, section: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select Section</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                </select>
                            </div>
                            <button onClick={fetchReportCards} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" /> Generate
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 bg-white rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col min-h-0">
                            {reportData.length > 0 ? (
                                <div className="overflow-auto flex-1 custom-scrollbar">
                                    <table className="w-full text-left border-collapse relative">
                                        <thead className="sticky top-0 z-10 bg-white shadow-sm">
                                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-extrabold tracking-wider">
                                                <th className="px-8 py-5">Rank</th>
                                                <th className="px-6 py-5">Roll No</th>
                                                <th className="px-6 py-5">Student Name</th>
                                                <th className="px-6 py-5">Percentage</th>
                                                <th className="px-6 py-5">Grade</th>
                                                <th className="px-6 py-5">Status</th>
                                                <th className="px-8 py-5 text-right">View</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {reportData.map((row) => (
                                                <React.Fragment key={row.studentId}>
                                                    <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => viewStudentMarksheet(row.studentId)}>
                                                        <td className="px-8 py-4 font-black text-gray-400">#{row.rank}</td>
                                                        <td className="px-6 py-4 font-mono text-sm font-bold text-gray-600">{row.rollNo}</td>
                                                        <td className="px-6 py-4 font-bold text-gray-900">{row.name}</td>
                                                        <td className="px-6 py-4 font-bold text-indigo-600">{row.percentage}%</td>
                                                        <td className="px-6 py-4">
                                                            <span className={clsx("w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs",
                                                                row.grade.startsWith('A') ? "bg-emerald-100 text-emerald-700" :
                                                                    row.grade.startsWith('B') ? "bg-blue-100 text-blue-700" :
                                                                        row.grade.startsWith('C') ? "bg-yellow-100 text-yellow-700" :
                                                                            "bg-red-100 text-red-700"
                                                            )}>{row.grade}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={clsx("px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wide",
                                                                row.result === 'Pass' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                                            )}>{row.result}</span>
                                                        </td>
                                                        <td className="px-8 py-4 text-right">
                                                            <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                                                <TrendingUp className={clsx("w-5 h-5 transition-transform", selectedStudentForPrint === row.studentId ? "rotate-180" : "")} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {/* Expanded Marksheet View */}
                                                    {selectedStudentForPrint === row.studentId && (
                                                        <tr className="bg-indigo-50/30">
                                                            <td colSpan={7} className="p-6">
                                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
                                                                    <div className="flex justify-between mb-4">
                                                                        <h4 className="font-bold text-indigo-900">Detailed Marksheet</h4>
                                                                        <button className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
                                                                            <Printer className="w-3 h-3" /> Print Report Card
                                                                        </button>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                                        {studentMarksheet.map((sub, i) => (
                                                                            <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">{sub.subjectName}</p>
                                                                                <p className="text-lg font-black text-gray-900">{sub.marksObtained} <span className="text-gray-400 text-xs font-medium">/ {sub.maxMarks}</span></p>
                                                                                {sub.remarks && <p className="text-[10px] text-gray-400 mt-1 italic">"{sub.remarks}"</p>}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                !loading && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                                        <p className="font-medium text-sm">Select exam and class details to generate reports.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDeleteExam}
                title="Delete Exam?"
                description="This will remove the exam schedule. Results associated with this exam might be affected."
            />
        </div>
    );
}
