import { useEffect, useRef, useState, useCallback } from 'react'
import './App.css'

interface VideoEntry {
  filename: string
  weight: number
}

interface Column {
  videos: VideoEntry[]
  totalWeight: number
}

const WEIGHTS = [1, 1, 1.3, 1.5, 1.7, 2.0]
const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|avi|mkv)$/i

function getColumnCount(count: number): number {
  if (count <= 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  if (count <= 10) return 4
  return 5
}

function distributeToColumns(filenames: string[], numCols: number): VideoEntry[][] {
  const videos: VideoEntry[] = filenames.map(filename => ({
    filename,
    weight: WEIGHTS[Math.floor(Math.random() * WEIGHTS.length)],
  }))

  const columns: Column[] = Array.from({ length: numCols }, () => ({
    videos: [],
    totalWeight: 0,
  }))

  for (const video of videos) {
    const shortest = columns.reduce((min, col) =>
      col.totalWeight < min.totalWeight ? col : min
    )
    shortest.videos.push(video)
    shortest.totalWeight += video.weight
  }

  return columns.map(c => c.videos)
}

function VideoCell({ filename }: { filename: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const src = `./assets/videos/${filename}`

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.play().catch(() => {})
  }, [])

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      loop
      playsInline
    />
  )
}

export default function App() {
  const [columns, setColumns] = useState<VideoEntry[][]>([])
  const [loading, setLoading] = useState(true)

  const loadVideos = useCallback(async () => {
    let filenames: string[] = []

    if (window.electronAPI) {
      filenames = await window.electronAPI.getVideos()
    }

    filenames = filenames.filter(f => VIDEO_EXTENSIONS.test(f))

    if (filenames.length > 0) {
      const numCols = getColumnCount(filenames.length)
      setColumns(distributeToColumns(filenames, numCols))
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadVideos()
  }, [loadVideos])

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <span className="text-white/40 text-sm tracking-widest uppercase">Loading</span>
      </div>
    )
  }

  if (columns.length === 0) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <span className="text-white/30 text-sm tracking-widest uppercase">
          No videos found — add files to public/assets/videos
        </span>
      </div>
    )
  }

  return (
    <div className="flex w-screen h-screen bg-black gap-0.5 overflow-hidden">
      {columns.map((col, colIdx) => (
        <div
          key={colIdx}
          className="flex flex-col flex-1 gap-0.5 min-w-0 overflow-hidden"
        >
          {col.map((video) => (
            <div
              key={video.filename}
              className="video-cell"
              style={{ flex: video.weight }}
            >
              <VideoCell filename={video.filename} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
