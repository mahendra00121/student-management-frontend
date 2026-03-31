'use client';

import React, { useState, useEffect } from 'react';
import { CalendarCheck, Users, Save, CheckCircle, XCircle, Clock, FileText, ChevronLeft, ChevronRight, School, User } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { TableSkeleton } from '@/components/SkeletonLoader';

const API_CLASSES = "http://localhost:5081/api/classes";
const API_ATTENDANCE = "http://localhost:5081/api/attendance";

export default function AttendancePage() {
    const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'report'>('student');

    return (
        <div className="h-screen w-full bg-gray-50/50 flex flex-col overflow-hidden font-sans text-gray-800">
            <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6 h-full">

                {/* Header */}
                <div className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <CalendarCheck className="w-8 h-8 text-black" />
                            Attendance Manager
                        </h1>
                        <p className="text-gray-700 mt-1 font-medium">Track attendance for students and teachers.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="shrink-0 bg-white p-1 rounded-2xl shadow-sm border border-gray-200 inline-flex w-full md:w-auto self-start">
                    <button onClick={() => setActiveTab('student')} className={clsx("flex-1 md:w-48 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2", activeTab === 'student' ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-50")}>
                        <School className="w-4 h-4" /> Student Attendance
                    </button>
                    <button onClick={() => setActiveTab('teacher')} className={clsx("flex-1 md:w-48 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2", activeTab === 'teacher' ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-50")}>
                        <Users className="w-4 h-4" /> Teacher Attendance
                    </button>
                    <button onClick={() => setActiveTab('report')} className={clsx("flex-1 md:w-48 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2", activeTab === 'report' ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-50")}>
                        <FileText className="w-4 h-4" /> Monthly Report
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0 flex flex-col">
                    {activeTab === 'student' && <StudentAttendanceView />}
                    {activeTab === 'teacher' && <TeacherAttendanceView />}
                    {activeTab === 'report' && <MonthlyReportView />}
                </div>
            </div>
        </div>
    );
}

// --- SUB COMPONENTS ---

function StudentAttendanceView() {
    const [loading, setLoading] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<any[]>([]);

    useEffect(() => {
        fetch(API_CLASSES)
            .then(res => res.json())
            .then(data => {
                setClasses(data);
                setLoadingClasses(false);
            })
            .catch(() => {
                toast.error("Failed to load classes");
                setLoadingClasses(false);
            });
    }, []);

    useEffect(() => {
        if (selectedClass && selectedSection && selectedDate) fetchAttendance();
        else setStudents([]);
    }, [selectedClass, selectedSection, selectedDate]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_ATTENDANCE}?date=${selectedDate}&className=${selectedClass}&section=${selectedSection}`);
            if (res.ok) setStudents(await res.json());
            else {
                const errorTxt = await res.text();
                toast.error("Failed to load: " + errorTxt);
                setStudents([]);
            }
        } catch { toast.error("Failed to fetch data"); }
        finally { setLoading(false); }
    };

    const save = async () => {
        const records = students.filter(s => s.status).map(s => ({ studentId: s.studentId, status: s.status, remarks: s.remarks }));
        if (!records.length) return toast.info("Nothing to save");

        const res = await fetch(API_ATTENDANCE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: selectedDate, records }) });
        if (res.ok) toast.success("Attendance Saved!");
        else {
            const errorText = await res.text();
            console.error(errorText);
            toast.error("Failed to save: " + errorText);
        }
    };

    const handleMark = (id: number, status: string) => setStudents(p => p.map(s => s.studentId === id ? { ...s, status } : s));
    const handleMarkAll = (status: string) => setStudents(p => p.map(s => ({ ...s, status })));

    const uniqueClasses = Array.from(new Set(classes.map(c => c.className))).sort();
    const availableSections = classes.filter(c => c.className === selectedClass).map(c => c.section).sort();

    // Stats
    const stats = {
        total: students.length,
        present: students.filter(s => s.status === 'Present').length,
        absent: students.filter(s => s.status === 'Absent').length,
        late: students.filter(s => s.status === 'Late').length
    };

    if (loadingClasses) return (
        <div className="p-12 bg-white rounded-3xl border border-gray-100 h-96 flex flex-col gap-6">
            <div className="flex gap-4">
                <div className="h-10 bg-gray-100 rounded-xl w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-100 rounded-xl w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-100 rounded-xl w-48 animate-pulse"></div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-2xl animate-pulse"></div>
        </div>
    );

    if (classes.length === 0) return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-100 h-96">
            <School className="w-16 h-16 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No Classes Found</h3>
            <p className="text-gray-500 mt-2 mb-6 text-center max-w-sm">Please create classes and sections in the Classes page before marking attendance.</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center shrink-0">
                <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection('') }} className="bg-gray-50 border p-2 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-black/5 transition-all"><option value="">Class</option>{uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="bg-gray-50 border p-2 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-black/5 transition-all"><option value="">Section</option>{availableSections.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-gray-50 border p-2 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-black/5 transition-all" />

                {/* Visual Stats */}
                {students.length > 0 && (
                    <div className="flex items-center gap-4 ml-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
                            <span className="text-lg font-black text-gray-900">{stats.total}</span>
                        </div>
                        <div className="h-8 w-px bg-gray-100"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">P</span>
                            <span className="text-lg font-black text-green-600">{stats.present}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">A</span>
                            <span className="text-lg font-black text-red-500">{stats.absent}</span>
                        </div>
                    </div>
                )}

                <div className="flex-1"></div>
                {students.length > 0 && <div className="flex gap-2"><button onClick={() => handleMarkAll('Present')} className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold">All Present</button><button onClick={save} className="bg-black text-white px-4 py-2 rounded-xl font-bold flex gap-2 shadow-lg shadow-gray-200 hover:-translate-y-0.5 transition-all"><Save className="w-4 h-4" /> Save Attendance</button></div>}
            </div>

            <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col min-h-0">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    {!selectedClass || !selectedSection ? <div className="p-12 text-center text-gray-400">Select Class & Section</div> :
                        <table className="w-full text-left border-collapse relative">
                            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold sticky top-0 z-10 shadow-sm"><tr><th className="px-8 py-4">Roll</th><th className="px-6 py-4">Name</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4">Remarks</th></tr></thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? <TableSkeleton count={5} /> : students.length === 0 ? <tr><td colSpan={4} className="p-8 text-center">No students</td></tr> :
                                    students.map(s => (
                                        <tr key={s.studentId} className={clsx("transition-colors hover:bg-gray-50", s.status === 'Present' && "bg-green-50/20", s.status === 'Absent' && "bg-red-50/20")}>
                                            <td className="px-8 py-3 font-mono text-sm text-gray-500">{s.rollNo}</td>
                                            <td className="px-6 py-3 font-semibold">{s.studentName}</td>
                                            <td className="px-6 py-3 flex justify-center gap-2">
                                                {['Present', 'Absent', 'Late'].map(st => (
                                                    <button key={st} onClick={() => handleMark(s.studentId, st)} className={clsx("p-2 rounded-lg font-bold text-xs flex items-center gap-1", s.status === st ? (st === 'Present' ? "bg-green-100 text-green-700" : st === 'Absent' ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700") : "bg-gray-100 text-gray-400")}>
                                                        {st === 'Present' ? <CheckCircle className="w-3 h-3" /> : st === 'Absent' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {st[0]}
                                                    </button>
                                                ))}
                                            </td>
                                            <td className="px-6 py-3"><input className="bg-transparent border-b outline-none text-sm w-full" placeholder="..." value={s.remarks || ''} onChange={e => setStudents(p => p.map(x => x.studentId === s.studentId ? { ...x, remarks: e.target.value } : x))} /></td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>}
                </div>
            </div>
        </div>
    );
}

function TeacherAttendanceView() {
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [teachers, setTeachers] = useState<any[]>([]);

    useEffect(() => {
        fetchAttendance();
    }, [selectedDate]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_ATTENDANCE}/teachers?date=${selectedDate}`);
            if (res.ok) setTeachers(await res.json());
        } catch { toast.error("Failed to fetch teachers"); }
        finally { setLoading(false); }
    };

    const save = async () => {
        const records = teachers.filter(t => t.status).map(t => ({ studentId: t.studentId, status: t.status, remarks: t.remarks })); // Using studentId as TeacherId here per backend
        const res = await fetch(`${API_ATTENDANCE}/teachers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: selectedDate, records }) });
        if (res.ok) toast.success("Teacher Attendance Saved!");
        else {
            const errorText = await res.text();
            console.error(errorText);
            toast.error("Failed to save: " + errorText);
        }
    };

    const handleMark = (id: number, status: string) => setTeachers(p => p.map(t => t.studentId === id ? { ...t, status } : t));
    const handleMarkAll = (status: string) => setTeachers(p => p.map(t => ({ ...t, status })));

    // Stats
    const stats = {
        total: teachers.length,
        present: teachers.filter(t => t.status === 'Present').length,
        absent: teachers.filter(t => t.status === 'Absent').length,
        late: teachers.filter(t => t.status === 'Late').length,
        unmarked: teachers.filter(t => !t.status).length
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Controls */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center shrink-0">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-black/5" />
                </div>

                {/* Visual Stats */}
                <div className="flex items-center gap-4 ml-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</span>
                        <span className="text-xl font-black text-gray-900">{stats.total}</span>
                    </div>
                    <div className="h-8 w-px bg-gray-100"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Present</span>
                        <span className="text-xl font-black text-green-600">{stats.present}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Absent</span>
                        <span className="text-xl font-black text-red-500">{stats.absent}</span>
                    </div>
                    {stats.late > 0 && (
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Late</span>
                            <span className="text-xl font-black text-yellow-600">{stats.late}</span>
                        </div>
                    )}
                </div>

                <div className="flex-1"></div>
                {teachers.length > 0 && <div className="flex gap-2"><button onClick={() => handleMarkAll('Present')} className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold">All Present</button><button onClick={save} className="bg-black text-white px-4 py-2 rounded-xl font-bold flex gap-2 shadow-lg shadow-gray-200 hover:-translate-y-0.5 transition-all"><Save className="w-4 h-4" /> Save Attendance</button></div>}
            </div>

            <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col min-h-0">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse relative">
                        <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold sticky top-0 z-10 shadow-sm"><tr><th className="px-8 py-4">Teacher Name</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4">Remarks</th></tr></thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? <TableSkeleton count={5} /> : teachers.map(t => (
                                <tr key={t.studentId} className={clsx("transition-colors hover:bg-gray-50", t.status === 'Present' && "bg-green-50/20", t.status === 'Absent' && "bg-red-50/20")}>
                                    <td className="px-8 py-3 font-semibold text-gray-900">{t.studentName}</td>
                                    <td className="px-6 py-3 flex justify-center gap-2">
                                        {['Present', 'Absent', 'Late'].map(st => (
                                            <button key={st} onClick={() => handleMark(t.studentId, st)} className={clsx("p-2 rounded-lg font-bold text-xs flex items-center gap-1", t.status === st ? (st === 'Present' ? "bg-green-100 text-green-700" : st === 'Absent' ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700") : "bg-gray-100 text-gray-400")}>
                                                {st === 'Present' ? <CheckCircle className="w-3 h-3" /> : st === 'Absent' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {st[0]}
                                            </button>
                                        ))}
                                    </td>
                                    <td className="px-6 py-3"><input className="bg-transparent border-b outline-none text-sm w-full" placeholder="..." value={t.remarks || ''} onChange={e => setTeachers(p => p.map(x => x.studentId === t.studentId ? { ...x, remarks: e.target.value } : x))} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function MonthlyReportView() {
    const [reportType, setReportType] = useState('student');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetch(API_CLASSES).then(res => res.json()).then(setClasses).catch(() => { }); }, []);

    useEffect(() => {
        if (reportType === 'student' && (!selectedClass || !selectedSection)) { setData([]); return; }
        loadReport();
    }, [reportType, month, year, selectedClass, selectedSection]);

    const loadReport = async () => {
        setLoading(true);
        const url = `${API_ATTENDANCE}/report?type=${reportType}&month=${month}&year=${year}&className=${selectedClass}&section=${selectedSection}`;
        try {
            const res = await fetch(url);
            if (res.ok) processData(await res.json());
        } catch { toast.error("Failed to load report"); }
        finally { setLoading(false); }
    };

    const processData = (rawData: any[]) => {
        // Pivot data: Map<EntityId, { name, attendance: { day: status } }>
        const map = new Map();
        rawData.forEach(r => {
            if (!map.has(r.id)) map.set(r.id, { id: r.id, name: r.name, rollNo: r.rollNo, days: {} });
            const day = parseInt(r.date.split('-')[2]);
            map.get(r.id).days[day] = r.status;
        });
        setData(Array.from(map.values()));
    };

    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Derived for dropdowns
    const uniqueClasses = Array.from(new Set(classes.map(c => c.className))).sort();
    const availableSections = classes.filter(c => c.className === selectedClass).map(c => c.section).sort();

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center shrink-0">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Report Status</label>
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button onClick={() => setReportType('student')} className={clsx("px-3 py-1.5 rounded-lg text-xs font-bold", reportType === 'student' ? "bg-white shadow text-black" : "text-gray-500")}>Students</button>
                        <button onClick={() => setReportType('teacher')} className={clsx("px-3 py-1.5 rounded-lg text-xs font-bold", reportType === 'teacher' ? "bg-white shadow text-black" : "text-gray-500")}>Teachers</button>
                    </div>
                </div>
                <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="bg-gray-50 p-2 rounded-xl text-sm font-bold border"><option value="1">January</option><option value="2">February</option><option value="3">March</option><option value="4">April</option><option value="5">May</option><option value="6">June</option><option value="7">July</option><option value="8">August</option><option value="9">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select>
                <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="bg-gray-50 p-2 rounded-xl text-sm font-bold border"><option value="2025">2025</option><option value="2026">2026</option></select>

                {reportType === 'student' && (
                    <>
                        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="bg-gray-50 p-2 rounded-xl text-sm font-bold border"><option value="">Class</option>{uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}</select>
                        <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="bg-gray-50 p-2 rounded-xl text-sm font-bold border"><option value="">Section</option>{availableSections.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </>
                )}

                <div className="flex-1"></div>
                <button onClick={loadReport} className="bg-black text-white px-4 py-2 rounded-xl font-bold text-sm">Refresh Report</button>
            </div>

            <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col min-h-0">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    {data.length === 0 ? <div className="p-12 text-center text-gray-400">No data found for selected period</div> :
                        <table className="w-full text-left border-collapse relative">
                            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 bg-gray-50 sticky left-0 z-20 shadow-r">Name</th>
                                    {days.map(d => <th key={d} className="px-2 py-3 text-center min-w-[30px]">{d}</th>)}
                                    <th className="px-4 py-3 text-center">Summary</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.map(row => {
                                    const present = Object.values(row.days).filter(x => x === 'Present').length;
                                    const absent = Object.values(row.days).filter(x => x === 'Absent').length;
                                    return (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 font-bold text-sm bg-white sticky left-0 z-10 shadow-r border-r border-gray-100">
                                                {row.name} <span className="text-gray-400 font-mono text-xs block">{row.rollNo}</span>
                                            </td>
                                            {days.map(d => {
                                                const st = row.days[d];
                                                return (
                                                    <td key={d} className="px-1 py-1 text-center border-r border-gray-50">
                                                        {st === 'Present' ? <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold mx-auto">P</div> :
                                                            st === 'Absent' ? <div className="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-bold mx-auto">A</div> :
                                                                st === 'Late' ? <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-[10px] font-bold mx-auto">L</div> :
                                                                    <div className="w-1 h-1 rounded-full bg-gray-200 mx-auto"></div>}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-2 text-center text-xs font-bold text-gray-600">
                                                <span className="text-green-600">{present} P</span> / <span className="text-red-500">{absent} A</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>}
                </div>
            </div>
        </div>
    );
}

