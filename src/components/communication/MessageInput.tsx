'use client'

import { useState } from 'react'

const QUICK_REPLIES = ['Yes, perfect.', 'Let me check.', 'Confirmed.', 'No problem!']

interface Props {
  onSend: (content: string) => void
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')

  const send = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <div className="p-5 bg-surface-container-lowest/50 backdrop-blur-md border-t border-outline-variant/10 flex-shrink-0">
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {QUICK_REPLIES.map(r => (
          <button
            key={r}
            onClick={() => setValue(r)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full border border-outline-variant text-xs font-semibold hover:bg-primary hover:text-on-primary hover:border-primary transition-all"
          >
            {r}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-3 bg-surface-container-low p-2 rounded-[2rem] shadow-inner">
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:text-primary transition-colors">
          <span className="material-symbols-outlined">add_circle</span>
        </button>
        <textarea
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 resize-none placeholder:text-outline/70 text-on-surface outline-none"
          placeholder="Type your message..."
          rows={1}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          disabled={disabled}
        />
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:text-primary transition-colors">
          <span className="material-symbols-outlined">mood</span>
        </button>
        <button
          onClick={send}
          disabled={!value.trim() || disabled}
          className="w-10 h-10 flex items-center justify-center rounded-full primary-gradient text-white shadow-lg active:scale-90 transition-transform disabled:opacity-50"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  )
}
