const config = {
  pending:   { label: 'PENDING',   className: 'bg-pending/15 text-pending border-pending/30' },
  hit:       { label: 'HIT',       className: 'bg-hit/15 text-hit border-hit/30' },
  confirmed: { label: 'CONFIRMED', className: 'bg-confirmed/15 text-confirmed border-confirmed/30' },
  denied:    { label: 'DENIED',    className: 'bg-denied/15 text-denied border-denied/30' },
}

export default function StatusBadge({ status }) {
  const c = config[status] || config.pending
  return (
    <span className={`inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${c.className}`}>
      {c.label}
    </span>
  )
}
