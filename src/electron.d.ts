interface Window {
  electronAPI: {
    getVideos: () => Promise<string[]>
  }
}
