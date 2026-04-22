'use client'

import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

export function ConfirmModal({
  open,
  onClose,
  title,
  body,
  confirmLabel = 'Confirm',
  onConfirm,
  loading = false,
  destructive = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  body?: string
  confirmLabel?: string
  onConfirm: () => void
  loading?: boolean
  destructive?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      {body && <p className="text-sm text-on-surface-variant mb-6">{body}</p>}
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
          Cancel
        </Button>
        <Button
          type="button"
          variant={destructive ? 'destructive' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Please wait...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
