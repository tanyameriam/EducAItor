"use client";

import { useGradingStore } from "@/lib/store/useGradingStore";
import { Button, Chip, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { Search, ArrowUpRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatRelativeTime } from "@/lib/utils/time";

type StatusFilter = "All" | "Checking now" | "Marks ready" | "In progress" | "Draft";

export default function AllAssignmentsTable() {
  const store = useGradingStore();
  const assignments = store.getAssignmentList();
  const courses = store.courses;
  
  const [filterMode, setFilterMode] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed': return { label: 'Marks ready', color: 'success' };
      case 'grading': return { label: 'Checking now', color: 'accent' };
      case 'evaluating': return { label: 'In progress', color: 'warning' };
      case 'draft': return { label: 'Draft', color: 'default' };
      default: return { label: status, color: 'default' };
    }
  };

  const filteredAssignments = assignments
    .filter(a => {
      const display = getStatusDisplay(a.status);
      return filterMode === "All" || display.label === filterMode;
    })
    .filter(a => 
      !search || 
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      courses[a.courseId]?.code.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-[#121212] text-[#e0e0e0] flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-white/5 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/assignments" className="text-sm text-muted hover:text-foreground transition-colors font-medium">
            ← Dashboard
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">Full Assignments List</h1>
        </div>
        <Link href="/assignments/new">
          <Button size="sm" className="bg-accent text-white font-bold rounded-lg px-4">
            <BookOpen className="size-3.5 mr-2" /> New Assignment
          </Button>
        </Link>
      </header>

      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {(["All", "Checking now", "Marks ready", "In progress", "Draft"] as StatusFilter[]).map(mode => (
              <Button
                key={mode}
                size="sm"
                variant={filterMode === mode ? "primary" : "ghost"}
                className={`rounded-full px-4 font-semibold text-xs border border-white/5 transition-all ${
                  filterMode === mode 
                    ? "bg-accent/20 border-accent/40 text-accent shadow-sm" 
                    : "bg-[#1e1e1e] hover:bg-[#2a2a2a] text-muted outline-none"
                }`}
                onPress={() => setFilterMode(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>
          <div className="relative w-full md:w-64 outline-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted pointer-events-none" />
            <input
              placeholder="Search assignments..."
              className="pl-9 pr-4 py-2 text-sm bg-[#1e1e1e] border border-white/5 rounded-lg text-foreground placeholder:text-muted outline-none focus:border-accent/40 transition-colors w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl shadow-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#1e1e1e]/50 border-b border-white/5">
                <th className="px-6 py-4 text-[11px] font-bold text-muted uppercase tracking-wider">Assignment</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted uppercase tracking-wider">Submissions</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssignments.map((a) => {
                const status = getStatusDisplay(a.status);
                const course = courses[a.courseId];
                return (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold text-sm text-foreground group-hover:text-accent transition-colors">{a.title}</p>
                        <p className="text-[11px] text-muted mt-1 uppercase tracking-wider font-semibold">{a.type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">{course?.code}</span>
                        <span className="text-[10px] text-muted truncate max-w-[150px]">{course?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-foreground">
                      {a.totalSubmissions}
                    </td>
                    <td className="px-6 py-5 w-40">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${a.status === 'completed' ? 'bg-success' : 'bg-accent'}`}
                            style={{ width: `${a.evaluationProgress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-foreground w-8 shrink-0">{a.evaluationProgress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Chip 
                        size="sm" 
                        variant="soft" 
                        className={`font-black text-[9px] uppercase tracking-[0.05em] h-5 border-none ${
                           status.color === 'success' ? 'bg-success/20 text-success' :
                           status.color === 'accent' ? 'bg-accent/20 text-accent' :
                           status.color === 'warning' ? 'bg-warning/20 text-warning' : 'bg-white/10 text-muted'
                        }`}
                      >
                        {status.label}
                      </Chip>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link href={`/assignments/${a.id}`}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="bg-[#1e1e1e] border-white/5 text-xs font-bold hover:bg-accent hover:text-white transition-all rounded-lg"
                        >
                          Review <ArrowUpRight className="size-3 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAssignments.length === 0 && (
            <div className="py-20 text-center text-muted font-medium italic">
              No assignments found matching these filters.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
