export function LoadingIndicator() {
  return (
    <div className="loading-indicator" role="status" aria-live="polite">
      <progress aria-label="Loading…" />
      <p>Generating your report…</p>
    </div>
  );
}
