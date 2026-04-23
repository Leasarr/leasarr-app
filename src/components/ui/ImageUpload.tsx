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
  value?: string | null
  onChange: (url: string | null) => void
  bucket: string
  path: string
  shape?: 'square' | 'circle'
  height?: string
  className?: string
}

export function ImageUpload({ value, onChange, bucket, path, shape = 'square', height = 'h-32', className }: Props) {
  const [uploading, setUploading] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const preview = localPreview ?? value ?? null
  const radiusClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl'

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10 MB'); return }
    setError('')

    const previewUrl = URL.createObjectURL(file)
    setLocalPreview(previewUrl)

    if (MOCK_MODE) {
      onChange(previewUrl)
      return
    }

    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(`${path}/${filename}`, compressed, { contentType: 'image/jpeg', upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(`${path}/${filename}`)
      URL.revokeObjectURL(previewUrl)
      setLocalPreview(null)
      onChange(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setLocalPreview(null)
    } finally {
      setUploading(false)
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onInputChange}
      />

      {preview ? (
        <div className={cn('relative overflow-hidden bg-surface-container-high', radiusClass, shape === 'circle' ? 'aspect-square' : height)}>
          <img src={preview} alt="" className="w-full h-full object-cover" />
          {uploading ? (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-2xl animate-spin">progress_activity</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 w-full h-full flex items-end justify-center pb-2"
            >
              <span className="bg-black/60 text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">edit</span>
                Change
              </span>
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
          disabled={uploading}
          className={cn(
            'w-full border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-2',
            'text-on-surface-variant hover:border-primary hover:text-primary transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            radiusClass,
            shape === 'circle' ? 'aspect-square' : height
          )}
        >
          {uploading ? (
            <span className="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
              <span className="text-xs font-medium">Tap to add photo</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-error mt-1.5">{error}</p>}
    </div>
  )
}
