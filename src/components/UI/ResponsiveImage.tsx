interface ResponsiveImageProps {
  avifSrc: string
  webpSrc: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export const ResponsiveImage = ({
  avifSrc,
  webpSrc,
  alt,
  width = 60,
  height = 60,
  className = '',
}: ResponsiveImageProps) => {
  return (
    <picture>
      <source srcSet={avifSrc} type="image/avif" />
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={webpSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{ display: 'block' }}
      />
    </picture>
  )
}
