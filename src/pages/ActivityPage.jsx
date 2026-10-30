import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import moment from 'moment'
import PageHeader from '../components/PageHeader'
import { TableSkeleton } from '../components/Skeleton'
import ActivityFeed from './activity/ActivityFeed'
import { EVENT_TYPES } from './activity/eventTypes'
import { formatNumber } from '../utils/format'

const SEARCH_DELAY_MS = 250

export default function ActivityPage() {
  const { api, account } = useOutletContext()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [type, setType] = useState('all')
  const [density, setDensity] = useState('comfortable')

  useEffect(() => {
    console.log('Overview effect running')
    let cancelled = false
    setLoading(true)
    api.get('/api/activity').then((data) => {
      if (cancelled) return
      setEvents(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [account])

  // Apply the search a beat after the last keystroke rather than on every one.
  useEffect(() => {
    const timer = setTimeout(() => setAppliedQuery(query), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [query])

  const needle = appliedQuery.trim().toLowerCase()
  const filtered = events.filter((event) => {
    if (type !== 'all' && event.type !== type) return false
    if (!needle) return true
    return (
      event.message.toLowerCase().includes(needle) ||
      event.actor.toLowerCase().includes(needle) ||
      event.target.toLowerCase().includes(needle)
    )
  })

  const countsByType = {}
  for (const event of events) {
    countsByType[event.type] = (countsByType[event.type] || 0) + 1
  }

  return (
    <div className="page">
      <PageHeader
        title="Activity"
        subtitle={loading ? 'Loading…' : `${formatNumber(events.length)} events in the last 90 days`}
        actions={
          <div className="segmented">
            <button
              type="button"
              className={`segmented__option ${density === 'comfortable' ? 'is-active' : ''}`}
              onClick={() => setDensity('comfortable')}
            >
              Comfortable
            </button>
            <button
              type="button"
              className={`segmented__option ${density === 'compact' ? 'is-active' : ''}`}
              onClick={() => setDensity('compact')}
            >
              Compact
            </button>
          </div>
        }
      />

      <div className="strip">
        {EVENT_TYPES.map((entry) => (
          <div className="strip__item" key={entry.type}>
            <span className={`strip__dot strip__dot--${entry.type}`} aria-hidden="true" />
            <span className="strip__label">{entry.label}</span>
            <span className="strip__value">{formatNumber(countsByType[entry.type] || 0)}</span>
          </div>
        ))}
      </div>

      <div className="filters">
        <input
          type="search"
          className="input input--search"
          placeholder="Search by person, customer or message"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search activity"
        />
        <div className="chips">
          <button type="button" className={`chip ${type === 'all' ? 'is-active' : ''}`} onClick={() => setType('all')}>
            All
          </button>
          {EVENT_TYPES.map((entry) => (
            <button
              type="button"
              key={entry.type}
              className={`chip ${type === entry.type ? 'is-active' : ''}`}
              onClick={() => setType(entry.type)}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <TableSkeleton rows={12} columns={3} />
        ) : (
          <ActivityFeed events={filtered} compact={density === 'compact'} total={events.length} />
        )}
      </div>
    </div>
  )
}
