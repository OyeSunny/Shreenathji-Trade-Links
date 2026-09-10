import Image from 'next/image';

type ManagedImageProps = {
  alt: string;
  className?: string;
  priority?: boolean;
  sizes: string;
  src: string;
};

const isLocalMediaPath = (src: string) => src.startsWith('/media/');

export function ManagedImage({
  alt,
  className,
  priority = false,
  sizes,
  src,
}: ManagedImageProps) {
  if (!isLocalMediaPath(src)) {
    return (
      // Approved external records pre-date local image optimization. Keep them
      // non-blocking until they are replaced through the owner workspace.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        className={className}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : 'lazy'}
        src={src}
      />
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      height={1000}
      priority={priority}
      sizes={sizes}
      src={src}
      width={1600}
    />
  );
}
