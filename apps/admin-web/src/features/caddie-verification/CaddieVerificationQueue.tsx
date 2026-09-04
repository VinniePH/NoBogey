import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CaddieVerificationDetail,
  CaddieVerificationStatus,
  CaddieVerificationSummary,
  VerificationStatusFilter
} from "@nobogey/contracts";
import {
  CaddieVerificationAdapterError,
  approveCaddieVerification,
  getCaddieVerificationDetail,
  listCaddiesForVerification,
  rejectCaddieVerification,
  requestMoreInfo
} from "../../lib/caddie-verification";

const statusLabels: Record<CaddieVerificationStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  verified: "Verified",
  changes_requested: "Changes requested",
  rejected: "Rejected"
};

type SortOrder = "submitted_desc" | "submitted_asc" | "name";
type ReviewAction = "approve" | "reject" | "more_info";
const pageSize = 5;

function messageFor(error: unknown) {
  return error instanceof CaddieVerificationAdapterError ? error.message : "Something went wrong while updating this verification. Please retry.";
}

function StatusBadge({ status }: { status: CaddieVerificationStatus }) {
  return <span className={`verification-status status-${status}`} aria-label={`Verification status: ${statusLabels[status]}`}>{statusLabels[status]}</span>;
}

function formatSubmittedAt(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function CaddieVerificationQueue() {
  const [filter, setFilter] = useState<VerificationStatusFilter>("all");
  const [sort, setSort] = useState<SortOrder>("submitted_desc");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CaddieVerificationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await listCaddiesForVerification(filter));
    } catch (loadError) {
      setError(messageFor(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [filter]);
  useEffect(() => { setPage(1); }, [filter, query, sort]);

  const sortedItems = useMemo(() => items.filter(item => item.displayName.toLowerCase().includes(query.trim().toLowerCase())).sort((left, right) => {
    if (sort === "name") return left.displayName.localeCompare(right.displayName);
    const comparison = left.submittedAt.localeCompare(right.submittedAt);
    return sort === "submitted_desc" ? -comparison : comparison;
  }), [items, query, sort]);
  const pageCount = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedItems = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstItem = sortedItems.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(currentPage * pageSize, sortedItems.length);

  return <main className="verification-page">
    <section className="verification-hero">
      <p className="eyebrow">Club operations</p>
      <h1>Caddie Verification</h1>
    </section>
    <section className="verification-card" aria-labelledby="verification-queue-title">
      <div className="section-heading verification-heading">
        <div><h2 id="verification-queue-title">Verification queue</h2><p>{loading ? "Loading submissions…" : sortedItems.length ? `${firstItem}–${lastItem} of ${sortedItems.length} submissions` : "No submissions shown"}</p></div>
        <button className="outline-button" onClick={() => void load()} disabled={loading}>Refresh queue</button>
      </div>
      <div className="verification-filters">
        <label>Search caddies<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name…" /></label>
        <label>Status<select value={filter} onChange={event => setFilter(event.target.value as VerificationStatusFilter)}>{(["all", "draft", "pending", "changes_requested", "verified", "rejected"] as const).map(value => <option key={value} value={value}>{value === "all" ? "All statuses" : statusLabels[value]}</option>)}</select></label>
        <label>Sort by<select value={sort} onChange={event => setSort(event.target.value as SortOrder)}><option value="submitted_desc">Newest submission</option><option value="submitted_asc">Oldest submission</option><option value="name">Caddie name</option></select></label>
      </div>
      {loading ? <div className="verification-state" role="status">Loading verification submissions…</div> : error ? <div className="verification-state verification-error" role="alert"><p>{error}</p><button className="outline-button" onClick={() => void load()}>Retry queue</button></div> : sortedItems.length === 0 ? <div className="verification-state"><h3>No verification submissions</h3><p>Submissions will appear here when the club review service is connected.</p></div> : <><div className="verification-list">{paginatedItems.map(item => <button className="verification-row" key={item.caddieId} onClick={() => setSelectedId(item.caddieId)}><span className="verification-avatar" aria-hidden="true">{item.displayName.split(" ").map(part => part[0]).join("").slice(0, 2)}</span><span className="verification-person"><b>{item.displayName}</b><small>{item.tier} · submitted {formatSubmittedAt(item.submittedAt)}</small></span><StatusBadge status={item.status} /><span className="verification-open" aria-hidden="true">Review →</span></button>)}</div>{pageCount > 1 && <nav className="verification-pagination" aria-label="Verification queue pagination"><button className="small" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {pageCount}</span><button className="small" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button></nav>}</>}
    </section>
    {selectedId && <VerificationDetail caddieId={selectedId} onClose={() => setSelectedId(null)} onUpdated={() => void load()} />}
  </main>;
}

function VerificationDetail({ caddieId, onClose, onUpdated }: { caddieId: string; onClose: () => void; onUpdated: () => void }) {
  const [detail, setDetail] = useState<CaddieVerificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);

  const loadDetail = async () => {
    setLoading(true);
    setLoadError("");
    try { setDetail(await getCaddieVerificationDetail(caddieId)); } catch (error) { setLoadError(messageFor(error)); } finally { setLoading(false); }
  };

  useEffect(() => { void loadDetail(); }, [caddieId]);
  useEffect(() => { closeRef.current?.focus(); const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose(); addEventListener("keydown", onKeyDown); return () => removeEventListener("keydown", onKeyDown); }, [onClose]);

  return <div className="modal-backdrop" onMouseDown={onClose}>
    <section className="modal verification-modal" role="dialog" aria-modal="true" aria-labelledby="verification-detail-title" onMouseDown={event => event.stopPropagation()}>
      <button ref={closeRef} className="close" aria-label="Close caddie verification review" onClick={onClose}>×</button>
      {loading ? <div className="verification-state" role="status">Loading verification detail…</div> : loadError ? <div className="verification-state verification-error" role="alert"><p>{loadError}</p><button className="outline-button" onClick={() => void loadDetail()}>Retry detail</button></div> : detail && <VerificationReview detail={detail} onUpdated={(updated) => { setDetail(updated); onUpdated(); }} />}
    </section>
  </div>;
}

function VerificationReview({ detail, onUpdated }: { detail: CaddieVerificationDetail; onUpdated: (updated: CaddieVerificationDetail) => void }) {
  const [action, setAction] = useState<ReviewAction | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const actionLabel = action === "approve" ? "Approve verification" : action === "reject" ? "Reject verification" : "Request more information";
  const requiresText = action === "reject" || action === "more_info";
  const canConfirm = !submitting && (!requiresText || Boolean(note.trim()));

  const submit = async () => {
    if (!action || !canConfirm) return;
    setSubmitting(true);
    setError("");
    try {
      const updated = action === "approve" ? await approveCaddieVerification(detail.caddieId, note) : action === "reject" ? await rejectCaddieVerification(detail.caddieId, note) : await requestMoreInfo(detail.caddieId, note);
      onUpdated(updated);
      setSuccess(`${actionLabel} complete. The queue has been updated.`);
      setAction(null);
      setNote("");
    } catch (submitError) {
      setError(messageFor(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return <>
    <div className="verification-detail-head"><div className="verification-avatar large" aria-hidden="true">{detail.displayName.split(" ").map(part => part[0]).join("").slice(0, 2)}</div><div><p className="eyebrow">Verification submission</p><h2 id="verification-detail-title">{detail.displayName}</h2><p>{detail.tier} · {detail.yearsExperience} years experience · {detail.clubName}</p></div><StatusBadge status={detail.status} /></div>
    {success && <p className="verification-success" role="status">{success}</p>}
    <section className="verification-section"><h3>Submitted materials</h3><div className="verification-documents">{detail.documents.map(document => <article key={document.id}><b>{document.label}</b><span>{document.fileName}</span><small>Reference: {document.reference}</small></article>)}</div></section>
    <section className="verification-section"><h3>Profile</h3><p>Languages: {detail.languages.join(", ")}</p><p>Submitted {formatSubmittedAt(detail.submittedAt)}</p></section>
    <section className="verification-section"><h3>Review history</h3><ol className="verification-history">{detail.history.slice().reverse().map(entry => <li key={entry.id}><StatusBadge status={entry.status} /><span>{formatSubmittedAt(entry.occurredAt)}{entry.reviewerNote ? ` — ${entry.reviewerNote}` : ""}</span></li>)}</ol></section>
    <section className="verification-actions" aria-label="Verification actions"><h3>Record a decision</h3><div className="verification-action-buttons"><button className="primary" aria-pressed={action === "approve"} onClick={() => { setAction("approve"); setError(""); }}>Approve</button><button className="outline-button" aria-pressed={action === "more_info"} onClick={() => { setAction("more_info"); setError(""); }}>Request more info</button><button className="danger" aria-pressed={action === "reject"} onClick={() => { setAction("reject"); setError(""); }}>Reject</button></div>
      {action && <div className="verification-confirm"><h4>Confirm: {actionLabel}</h4><p>{action === "approve" ? "Optionally leave a reviewer note before confirming." : action === "reject" ? "A reason is required and this decision will mark the submission as rejected." : "Tell the caddie exactly what is missing."}</p><label>{action === "approve" ? "Reviewer note (optional)" : action === "reject" ? "Rejection reason" : "Message"}<textarea value={note} onChange={event => setNote(event.target.value)} placeholder={action === "reject" ? "Explain why this submission cannot be approved…" : "Write a clear reviewer message…"} /></label>{error && <p className="error" role="alert">{error}</p>}<div><button className="small" disabled={submitting} onClick={() => { setAction(null); setError(""); }}>Cancel</button><button className={action === "reject" ? "danger filled" : "primary"} disabled={!canConfirm} onClick={() => void submit()}>{submitting ? "Submitting…" : `Confirm ${actionLabel}`}</button></div></div>}
    </section>
  </>;
}
