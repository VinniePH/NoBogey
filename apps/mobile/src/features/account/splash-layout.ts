interface SplashViewport {
  height: number;
  width: number;
}

export interface SplashLayoutMetrics {
  compact: boolean;
  contentGap: number;
  contentPadding: number;
  copyGap: number;
  logoSize: number;
  logoTopSpacing: number;
  paddingBottom: number;
  titleFontSize: number;
  titleLineHeight: number;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function getSplashLayoutMetrics({ height, width }: SplashViewport): SplashLayoutMetrics {
  const compact = height < 680 || width < 360;
  const shortestSide = Math.min(height, width);
  const titleFontSize = clamp(width * 0.095, compact ? 30 : 32, compact ? 34 : 40);

  return {
    compact,
    contentGap: clamp(height * 0.035, 20, 30),
    contentPadding: clamp(width * 0.07, 16, 32),
    copyGap: clamp(height * 0.016, 8, 12),
    logoSize: clamp(shortestSide * 0.38, compact ? 104 : 112, compact ? 144 : 180),
    logoTopSpacing: clamp(height * 0.08, 24, 80),
    paddingBottom: clamp(height * 0.05, 24, 42),
    titleFontSize,
    titleLineHeight: Math.round(titleFontSize * 1.13)
  };
}
