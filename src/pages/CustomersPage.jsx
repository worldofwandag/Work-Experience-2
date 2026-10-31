import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { TableSkeleton } from '../components/Skeleton'
import PlanEditorDialog from './PlanEditorDialog'
import { comparePlans, formatDate, formatNumber } from '../utils/format'

const STATUS_FILTERS = ['all', 'active', 'trialing', 'past_due', 'churned']

const SORTERS = {
  name: (a, b) => a.name.localeCompare(b.name),
  company: (a, b) => a.company.localeCompare(b.company),
  plan: (a, b) => comparePlans(a.plan, b.plan) || a.company.localeCompare(b.company),
  seats: (a, b) => b.seats - a.seats,
  createdAt: (a, b) => (a.createdAt < b.createdAt ? 1 : -1),
}

export default function CustomersPage() {
  const { api } = useOutletContext()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('all')
  const [sortKey, setSortKey] = useState('company')
  const [editing, setEditing] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/api/customers')
      setRows(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [api])

  const visible = rows
    .filter((row) => status === 'all' || row.status === status)
    .sort(SORTERS[sortKey])

  return (
    <div className="page">
      <PageHeader
        title="Customers"
        subtitle={loading ? 'Loading…' : `${formatNumber(rows.length)} customers on this account`}
        actions={
          <div className="segmented">
            {STATUS_FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                className={`segmented__option ${status === value ? 'is-active' : ''}`}
                onClick={() => setStatus(value)}
              >
                {value === 'all' ? 'All' : value === 'past_due' ? 'Past due' : value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        }
      />

      {error && <div className="alert alert--error">{error}</div>}

      <div className="card">
        {loading ? (
          <TableSkeleton rows={10} columns={6} />
        ) : visible.length === 0 ? (
          <EmptyState title="No customers match" body="Try a different status filter." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <SortableHeader label="Name" value="name" current={sortKey} onChange={setSortKey} />
                <SortableHeader label="Company" value="company" current={sortKey} onChange={setSortKey} />
                <SortableHeader label="Plan" value="plan" current={sortKey} onChange={setSortKey} />
                <SortableHeader label="Seats" value="seats" current={sortKey} onChange={setSortKey} align="right" />
                <th>Status</th>
                <SortableHeader label="Customer since" value="createdAt" current={sortKey} onChange={setSortKey} />
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="table__primary">{row.name}</div>
                    <div className="table__secondary">{row.email}</div>
                  </td>
                  <td>{row.company}</td>
                  <td>
                    <Badge value={row.plan} />
                  </td>
                  <td className="table__num">{formatNumber(row.seats)}</td>
                  <td>
                    <Badge value={row.status} />
                  </td>
                  <td>{formatDate(row.createdAt)}</td>
                  <td className="table__actions">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(row)}>
                      Edit plan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && <PlanEditorDialog customer={editing} api={api} onClose={() => setEditing(null)} />}
    </div>
  )
}

function SortableHeader({ label, value, current, onChange, align }) {
  const active = current === value
  return (
    <th className={align === 'right' ? 'table__num' : undefined}>
      <button type="button" className={`table__sort ${active ? 'is-active' : ''}`} onClick={() => onChange(value)}>
        {label}
        {active && <span aria-hidden="true"> ↓</span>}
      </button>
    </th>
  )
}
