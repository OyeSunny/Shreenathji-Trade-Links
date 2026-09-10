import Image from 'next/image';

export function CompanyLogo({ className }: { className?: string }) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={className}
      height={1301}
      src="/media/shreenathji-trade-links-logo.png"
      width={1209}
    />
  );
}
