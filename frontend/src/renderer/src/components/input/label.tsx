export default function Label({ label, error }: { label?: string; error?: boolean }) {
  return label ? (
    <div
      className={`mb-1 text-sm transition-colors ${error ? 'text-error' : 'text-base-content/50'}`}
    >
      {label}
    </div>
  ) : null;
}
