import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, CheckCircle2, ChevronDown, FileText, Library, Loader2, MessageSquareQuote, RefreshCw, Search, Send, ShieldCheck, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { askDocumentQuestion, fetchQAClassrooms, fetchQADocuments, resetQA, retryDocumentIndex, selectQAClassroom } from "@/redux/slice/documentQASlice";

export default function DocumentQA() {
  const dispatch = useAppDispatch();
  const { groups, groupId, documents, groupsLoading, documentsLoading, groupsError, documentsError, answerError, answer, question, asking, retryingId } = useAppSelector(state => state.documentQA);
  const isTeacher = useAppSelector(state => state.auth.user?.role === "teacher");
  const [draft, setDraft] = useState("");
  const [showSources, setShowSources] = useState(false);
  const answerRequest = useRef<{ abort: () => void } | null>(null);
  const classroom = groups.find(group => group.id === groupId);
  const readyCount = documents.filter(doc => doc.status === "ready").length;
  const hasPending = documents.some(doc => doc.status === "pending");
  const canAsk = Boolean(classroom?.can_ask && readyCount > 0 && !documentsError);

  useEffect(() => {
    const request = dispatch(fetchQAClassrooms());
    return () => { request.abort(); answerRequest.current?.abort(); dispatch(resetQA()); };
  }, [dispatch]);

  useEffect(() => {
    if (!groupId && groups.length) dispatch(selectQAClassroom((groups.find(group => group.can_ask) ?? groups[0]).id));
  }, [dispatch, groups, groupId]);

  useEffect(() => {
    if (!groupId || !classroom?.can_ask) return;
    const request = dispatch(fetchQADocuments(groupId));
    return () => request.abort();
  }, [dispatch, groupId, classroom?.can_ask]);

  useEffect(() => {
    if (!groupId || !hasPending || documentsLoading) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void dispatch(fetchQADocuments(groupId));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [dispatch, groupId, hasPending, documentsLoading]);

  function selectGroup(value: string) {
    answerRequest.current?.abort();
    setDraft("");
    setShowSources(false);
    dispatch(selectQAClassroom(value));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canAsk || asking || draft.trim().length < 3) return;
    answerRequest.current = dispatch(askDocumentQuestion({ groupId, question: draft.trim() }));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-4 sm:p-8">
      <header className="flex flex-col justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-center">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> Classroom knowledge
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Ask your course material.</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Make sense of your teacher’s PDFs, with answers you can trace back to the page.</p>
        </div>
        {isTeacher && <Button asChild variant="outline" className="min-h-11 shrink-0 self-start">
          <Link to="/t-dashboard/docs"><Upload className="h-4 w-4" aria-hidden="true" /> Upload course PDF</Link>
        </Button>}
      </header>

      {groupsError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 p-4 text-sm">
        <p>{groupsError}</p><Button variant="outline" onClick={() => dispatch(fetchQAClassrooms())}>Try again</Button>
      </div>}

      {groupsLoading && !groups.length ? <div role="status" className="flex items-center gap-3 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Loading your classrooms…
      </div> : !groups.length && !groupsError ? <Card className="items-center gap-4 px-6 py-14 text-center">
        <Library className="h-10 w-10 text-primary" aria-hidden="true" />
        <h2 className="text-xl font-semibold">Your classroom knowledge starts here</h2>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">{isTeacher ? "Create your classroom, then upload a text-based PDF so you and your students can explore it together." : "Join a teacher’s classroom to explore their course documents and ask questions."}</p>
        <Button asChild><Link to={isTeacher ? "/t-insights" : "/dashboard-panel/view-teachers"}>{isTeacher ? "Set up classroom" : "Find a classroom"}</Link></Button>
      </Card> : groups.length > 0 && <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-4" aria-label="Classroom sources">
          <Card className="gap-5 p-5">
            <div className="space-y-2">
              <Label htmlFor="qa-classroom">Classroom</Label>
              <Select value={groupId} onValueChange={selectGroup}>
                <SelectTrigger id="qa-classroom" className="min-h-11 w-full"><SelectValue placeholder="Choose a classroom" /></SelectTrigger>
                <SelectContent>{groups.map(group => <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><Library className="h-4 w-4 text-primary" aria-hidden="true" /> Source library</h2>
              <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Refresh document status" disabled={!groupId || !classroom?.can_ask || documentsLoading} onClick={() => dispatch(fetchQADocuments(groupId))}>
                <RefreshCw className={`h-4 w-4 ${documentsLoading ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" />
              </Button>
            </div>
            {documentsError && <p role="alert" className="text-sm text-destructive">{documentsError}</p>}
            {documentsLoading && !documents.length && <p role="status" className="text-sm text-muted-foreground">Loading documents…</p>}
            {!documentsLoading && !documents.length && !documentsError && <p className="text-sm leading-6 text-muted-foreground">{classroom && !classroom.can_ask ? "Activate classroom access to view its sources." : isTeacher ? "No documents here yet. Upload your first course PDF to get started." : "Your teacher’s uploaded PDFs will appear here."}</p>}
            {documents.length > 0 && <Button variant="outline" className="min-h-11 justify-between lg:hidden" aria-expanded={showSources} aria-controls="qa-source-list" onClick={() => setShowSources(value => !value)}>
              {showSources ? "Hide" : "Show"} {documents.length} source documents <ChevronDown className={`h-4 w-4 ${showSources ? "rotate-180" : ""}`} aria-hidden="true" />
            </Button>}
            <ul id="qa-source-list" className={`${showSources ? "block" : "hidden"} max-h-80 space-y-4 overflow-y-auto pr-1 lg:block lg:max-h-[520px]`}>
              {documents.map(doc => <li key={doc.id} className="space-y-2 rounded-xl border border-border bg-background p-3">
                <div className="flex items-start gap-2.5">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <Link to={`/docs/${encodeURIComponent(doc.id)}`} target="_blank" rel="noopener noreferrer" className="break-words text-sm font-medium leading-5 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">{doc.title}<span className="sr-only"> (opens in a new tab)</span></Link>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  {doc.status === "ready" ? <><CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> Ready · {doc.page_count} {doc.page_count === 1 ? "page" : "pages"}</> :
                    doc.status === "pending" ? <><Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Preparing for questions</> :
                    doc.status === "error" ? <><XCircle className="h-3.5 w-3.5" aria-hidden="true" /> Couldn’t prepare PDF</> : "Not indexed for Q&A"}
                </div>
                {doc.error && <p className="text-xs leading-5 text-muted-foreground">{doc.error}</p>}
                {doc.status === "unsupported" && <p className="text-xs leading-5 text-muted-foreground">{isTeacher ? "Upload again as a text-based PDF to enable questions." : "This resource is available to read, but not for questions yet."}</p>}
                {isTeacher && (doc.status === "error" || doc.status === "pending") && <Button variant="outline" size="sm" className="min-h-10 w-full" disabled={retryingId !== null} onClick={() => dispatch(retryDocumentIndex({ groupId, documentId: doc.id }))}>
                  <RefreshCw className={`h-3.5 w-3.5 ${retryingId === doc.id ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" /> {retryingId === doc.id ? "Retrying…" : "Retry preparation"}
                </Button>}
              </li>)}
            </ul>
          </Card>
          <p className="flex items-start gap-2 px-1 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> Questions search only the documents in this classroom.</p>
        </aside>

        <section className="min-w-0 space-y-5" aria-label="Document questions">
          {classroom && !classroom.can_ask && <Card className="gap-3 border-primary/30 bg-primary/5 p-5">
            <h2 className="font-semibold">Activate access to ask questions</h2>
            <p className="text-sm leading-6 text-muted-foreground">You need an active subscription to {classroom.name} to use its document Q&A.</p>
            <Button asChild className="self-start"><Link to="/dashboard-panel/payments">View classroom plans <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
          </Card>}
          <Card className="gap-5 p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-semibold"><MessageSquareQuote className="h-5 w-5 text-primary" aria-hidden="true" /> Ask a question</h2>
              <Badge variant="secondary" className="font-normal">{readyCount} {readyCount === 1 ? "document" : "documents"} ready</Badge>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <Label htmlFor="qa-question" className="sr-only">Your question about the course material</Label>
              <Textarea id="qa-question" value={draft} onChange={event => setDraft(event.target.value)} placeholder="Ask about a concept, definition, or example from your notes…" maxLength={1000} minLength={3} required disabled={!canAsk || asking} aria-describedby="qa-hint" className="min-h-32 resize-y rounded-xl bg-background p-4 text-base leading-7" />
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <p id="qa-hint" className="max-w-sm text-xs leading-5 text-muted-foreground">{!readyCount ? "Questions become available when a PDF is ready." : "Use the topic’s name for better results. Up to 1,000 characters."}</p>
                <Button type="submit" disabled={!canAsk || asking || draft.trim().length < 3} className="min-h-11 shrink-0 gap-2">
                  {asking ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}{asking ? "Finding an answer…" : "Ask course material"}
                </Button>
              </div>
            </form>
          </Card>

          <div aria-live="polite" aria-atomic="false" aria-busy={asking}>
            {answerError && <div role="alert" className="rounded-xl border border-destructive/40 p-5 text-sm leading-6">{answerError} Your question is still above so you can try again.</div>}
            {asking ? <Card className="gap-3 p-7"><div className="flex items-center gap-3 font-medium"><Search className="h-5 w-5 text-primary" aria-hidden="true" /> Reading relevant passages…</div><p className="text-sm leading-6 text-muted-foreground">Looking for an answer and the pages that support it. This may take a moment.</p></Card> : answer ? <Card className="gap-6 p-5 sm:p-7">
              <div className="space-y-2 border-b border-border pb-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your question</p><h2 className="break-words text-lg font-semibold leading-7">{question}</h2></div>
              <section className="space-y-3" aria-label="Answer"><h3 className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />{answer.found ? "From your course material" : "No supported answer found"}</h3><p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground">{answer.answer}</p></section>
              {answer.citations.length > 0 && <section className="space-y-3" aria-label="Supporting sources"><h3 className="text-sm font-semibold">Check the sources</h3><div className="grid gap-3 xl:grid-cols-2">{answer.citations.map((citation, index) => <Link key={`${citation.document_id}-${citation.page}-${index}`} to={`/docs/${encodeURIComponent(citation.document_id)}?page=${citation.page}`} target="_blank" rel="noopener noreferrer" className="group min-w-0 space-y-3 rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-ring">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words text-sm font-semibold">{citation.title}</p><p className="mt-1 text-xs text-primary">Page {citation.page}</p></div><ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" /></div>
                <blockquote className="break-words border-l-2 border-primary/30 pl-3 text-xs leading-6 text-muted-foreground">“{citation.quote}”</blockquote><span className="sr-only">Open source page in a new tab</span>
              </Link>)}</div></section>}
              <p className="border-t border-border pt-4 text-xs leading-5 text-muted-foreground">AI can make mistakes. Check the quoted source before relying on an answer.</p>
            </Card> : !answerError && <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
              <div className="rounded-2xl bg-primary/10 p-4 text-primary"><BookOpen className="h-7 w-7" aria-hidden="true" /></div>
              <div className="space-y-2"><h2 className="text-lg font-semibold">A clearer path from question to understanding</h2><p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">Ask about something in your notes. You’ll get an explanation with quoted passages and page links—or a clear message when the material doesn’t cover it.</p></div>
            </div>}
          </div>
        </section>
      </div>}
    </div>
  );
}
