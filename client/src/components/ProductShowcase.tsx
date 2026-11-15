import { useState } from "react";
import {
  BookOpen,
  Brain,
  ClipboardCheck,
  CheckCircle2,
  Download,
  Share2,
  HelpCircle,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<"notes" | "quiz" | "grading">("notes");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const tabs = [
    { id: "notes" as const, label: "01. Note Synthesizer", icon: BookOpen },
    { id: "quiz" as const, label: "02. Quiz Simulator", icon: Brain },
    { id: "grading" as const, label: "03. Rubric Auto-Grading", icon: ClipboardCheck },
  ];

  return (
    <section id="showcase" className="py-24 sm:py-32 bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-left max-w-2xl space-y-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary font-semibold">
            // Interactive Workspace
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-foreground leading-[1.1]">
            Experience the core tools live.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Click through the modules below to test how notes, quizzes, and grading operate in production.
          </p>
        </div>

        {/* Minimalist Tab Selector (Linear pill style) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.08] dark:border-white/[0.08] pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Showcase Canvas Card */}
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-card p-6 sm:p-8 shadow-xs">
          {activeTab === "notes" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      B-Trees & Multi-Level Indexing (CS201)
                    </h3>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      Source: 04_btree_indexing.pdf • Synthesized into Markdown
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg gap-1.5 border-black/[0.08] dark:border-white/[0.08]">
                    <Share2 className="w-3 h-3" /> Share
                  </Button>
                  <Button size="sm" className="h-8 text-xs rounded-lg gap-1.5 bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold">
                    <Download className="w-3 h-3" /> Export Anki Deck
                  </Button>
                </div>
              </div>

              <div className="space-y-4 font-mono text-xs leading-relaxed">
                <div className="p-4 rounded-xl bg-muted/30 border border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider font-sans">
                    Core Invariant Summary
                  </span>
                  <p className="text-muted-foreground font-sans text-xs">
                    In a B-Tree of Order M, every internal node (except root) holds at least ceil(M/2) children.
                    This structure bounds disk lookup I/O strictly to O(log_M N), optimizing database page retrieval.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-black/[0.06] dark:border-white/[0.06] text-muted-foreground">
                  <span className="text-foreground font-bold">// Complexity Proof:</span><br />
                  Search Time: O(log_M N)<br />
                  Insert Time: O(M * log_M N) due to node splitting at capacity<br />
                  Space Utilization: Guarantees &ge; 50% block occupancy
                </div>
              </div>
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.06] text-xs">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">
                    Adaptive Quiz • Question 3 of 8
                  </span>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">Difficulty: Advanced</span>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground">
                  Why does a fully associative cache suffer from higher power consumption compared to direct mapped?
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { text: "A. It requires parallel tag comparison across all lines simultaneously", correct: true },
                    { text: "B. It enforces strict FIFO page replacement protocols", correct: false },
                    { text: "C. It doubles the write-through memory bandwidth", correct: false },
                    { text: "D. It disables cache line dirty bit tracking", correct: false },
                  ].map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = option.correct;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedOption(idx)}
                        className={`p-3.5 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? isCorrect
                              ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                              : "bg-destructive/10 border-destructive/40 text-destructive"
                            : "bg-muted/30 hover:bg-muted border-black/[0.06] dark:border-white/[0.06] text-foreground"
                        }`}
                      >
                        <span>{option.text}</span>
                        {isSelected && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== null && (
                  <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground space-y-1">
                    <p className="font-bold text-primary flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" /> Explanation:
                    </p>
                    <p className="text-muted-foreground">
                      Fully associative caches employ parallel hardware comparators that test every cache tag line concurrently, incurring high capacitive switching power dissipation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "grading" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.06] text-xs">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">
                    Assignment Rubric: Operating Systems Concurrency
                  </span>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">34 / 35 Graded</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-muted/30 border border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase">Student Submission</span>
                  <p className="font-bold text-foreground">Aarav Sharma</p>
                  <p className="text-primary font-bold">Grade: 96 / 100 (A+)</p>
                  <p className="text-[11px] text-muted-foreground font-sans">"Accurate proof of deadlock-free semaphore ordering."</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-black/[0.06] dark:border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase">Student Submission</span>
                  <p className="font-bold text-foreground">Meera Patel</p>
                  <p className="text-primary font-bold">Grade: 91 / 100 (A)</p>
                  <p className="text-[11px] text-muted-foreground font-sans">"Minor omission in priority inheritance edge case."</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-primary uppercase font-bold">Batch Release</span>
                    <p className="text-[11px] text-muted-foreground font-sans mt-1">AI completed grading with 99.1% teacher rubric alignment.</p>
                  </div>
                  <Button size="sm" className="w-full h-8 text-xs rounded-lg bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold">
                    Approve Marks
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
