export const calculateFitScale = (
  containerWidth: number,
  contentWidth: number,
  maxScale = 1,
  safeInset = 0,
) => {
  if (contentWidth <= 0) return maxScale
  const availableWidth = Math.max(0, containerWidth - safeInset)
  return Math.min(maxScale, availableWidth / contentWidth)
}

export const calculateContainScale = (
  containerWidth: number,
  containerHeight: number,
  contentWidth: number,
  contentHeight: number,
  maxScale = 1,
  safeInset = 0,
) => {
  if (contentWidth <= 0 || contentHeight <= 0) return maxScale
  const availableWidth = Math.max(0, containerWidth - safeInset)
  const availableHeight = Math.max(0, containerHeight - safeInset)
  return Math.min(
    maxScale,
    availableWidth / contentWidth,
    availableHeight / contentHeight,
  )
}
