'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(objectUrl)
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        'image/jpeg',
        quality
      )
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')) }
    img.src = objectUrl
  })
}

type Props = {
  value: string[]
  onChange: (urls: string[]) => void
  bucket: string
  path: string
  max?: number
  className?: string
}

export function ImageUploadMultiple({ value, onChange, bucket, path, max = 5, className }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFiles(files: FileList) {
    const remaining = max - value.length
    if (remaining <= 0) return
    const toProcess = Array.from(files).slice(0, remaining).filter(f => f.type.startsWith('image/'))
    if (toProcess.length === 0) return

    setError('')
    setUploading(true)

    const newUrls: string[] = []
    for (const file of toProcess) {
      if (MOCK_MODE) {
        newUrls.push(URL.createObjectURL(file))
        continue
      }
      try {
        const compressed = await compressImage(file)
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
        const storagePath = `${path}/${filename}`
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(storagePath, compressed, { contentType: 'image/jpeg', upsert: true })
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(storagePath)
        newUrls.push(publicUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      }
    }

    onChange([...value, ...newUrls])
    setUploading(false)
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = '' }}
      />

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface-container-high group">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-20 border-2 border-dashed border-outline-variant rounded-xl flex items-center justify-center gap-2 text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-outlined">add_photo_alternate</span>
              <span className="text-sm font-medium">
                {value.length === 0 ? 'Tap to add photos' : 'Add more'} ({value.length}/{max})
              </span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
