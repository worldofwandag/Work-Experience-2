import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import StatCard from '../components/StatCard'
import { CardSkeleton } from '../components/Skeleton'
import { formatMoney, formatNumber } from '../utils/format'

// Panels register themselves by living in ./overview/panels. Each module
// exports a component as default and a `meta` object with a title and order.
const panelModules = import.meta.glob('./overview/panels/*.jsx', { eager: true })

const panels = Object.values(panelModules)
  .map((mod) => ({ Component: mod.default, ...mod.meta }))
  .sort((a, b) => a.order - b.order)

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export default function OverviewPage() {
  const { api, account } = useOutletContext()
  const [customers, setCustomers] = useState(null)
  const [activity, setActivity] = useState(null)

  useEffect(() => {
    console.log('Overview effect running')
    let cancelled = false
    setCustomers(null)
    setActivity(null)
    Promise.all([api.get('/api/customers'), api.get('/api/activity')]).then(([c, a]) => {
      if (cancelled) return
      setCustomers(c)
      setActivity(a)
    })
    return () => {
      cancelled = true
    }
  }, [account])

  const loading = !customers || !activity

  let stats = null
  if (!loading) {
    const active = customers.filter((c) => c.status === 'active')
    const trialing = customers.filter((c) => c.status === 'trialing')
    const mrr = customers.reduce((sum, c) => sum + c.mrr, 0)
    const weekAgo = Date.now() - WEEK_MS
    const eventsThisWeek = activity.filter((e) => new Date(e.timestamp).getTime() >= weekAgo)
    stats = { active: active.length, trialing: trialing.length, mrr, eventsThisWeek: eventsThisWeek.length }
  }

  return (
    <div className="page">
      <div className="stat-grid">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Active customers" value={formatNumber(stats.active)} hint={`${customers.length} total`} />
            <StatCard label="Trials in progress" value={formatNumber(stats.trialing)} />
            <StatCard label="Monthly recurring revenue" value={formatMoney(stats.mrr)} trend={3.2} />
            <StatCard label="Events this week" value={formatNumber(stats.eventsThisWeek)} hint="across the account" />
          </>
        )}
      </div>

      <div className="panel-grid">
        {panels.map(({ Component, title, key, span }) => (
          <section className={`panel ${span === 2 ? 'panel--wide' : ''}`} key={key}>
            <h3 className="panel__title">{title}</h3>
            {loading ? <CardSkeleton lines={4} /> : <Component customers={customers} activity={activity} account={account} />}
          </section>
        ))}
      </div>
    </div>
  )
}
