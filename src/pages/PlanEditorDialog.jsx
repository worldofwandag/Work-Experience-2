import React, { useState } from 'react'
import Dialog from '../components/Dialog'
import { PLAN_ORDER } from '../utils/format'

const SEAT_LIMITS = {
  Starter: 3,
  Growth: 25,
  Enterprise: 500,
}

export default function PlanEditorDialog({ customer, api, onClose, onSaved }) {
  const [plan, setPlan] = useState(customer.plan)
  const [seats, setSeats] = useState(customer.seats)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const limit = SEAT_LIMITS[plan]
  const seatsNumber = Number(seats)
  const valid = Number.isInteger(seatsNumber) && seatsNumber >= 1 && seatsNumber <= limit

  async function save(event) {
    event.preventDefault()
    if (!valid || saving) return
    setSaving(true)
    setError(null)
    try {
      // The PATCH response is the updated customer. Hand it back to the page via
      // onSaved so the list can show it straight away. Before, this result was
      // thrown away and we only called onClose(), so the page never found out
      // that a customer had changed and kept showing the old plan and seats.
      const updated = await api.patch(`/api/customers/${customer.id}`, { plan, seats: seatsNumber })
      onSaved(updated)
      onClose()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Dialog
      title={`Edit plan for ${customer.company}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="plan-editor" className="btn btn--primary" disabled={!valid || saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </>
      }
    >
      <form id="plan-editor" onSubmit={save} className="form">
        <label className="field">
          <span className="field__label">Plan</span>
          <select className="input" value={plan} onChange={(e) => setPlan(e.target.value)}>
            {PLAN_ORDER.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Seats</span>
          <input
            className="input"
            type="number"
            min="1"
            max={limit}
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
          />
          <span className="field__help">
            {plan} allows up to {limit} seats.
          </span>
        </label>

        {error && <div className="alert alert--error">{error}</div>}
      </form>
    </Dialog>
  )
}
