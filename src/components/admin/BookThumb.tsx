import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { getImageUrl } from "../../utils/imageUtils";

type BookThumbProps = {
  readonly title: string;
  readonly coverImageUrl?: string | null;
  readonly className?: string;
};

/** Small cover thumbnail for admin lists, with a quiet icon fallback. */
export default function BookThumb({
  title,
  coverImageUrl,
  className = "h-14 w-10",
}: BookThumbProps) {
  const src = getImageUrl(coverImageUrl);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-cream-deep ${className}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <BookOpen
          className="h-4 w-4 text-muted"
          aria-label={`No cover for ${title}`}
        />
      )}
    </div>
  );
}
