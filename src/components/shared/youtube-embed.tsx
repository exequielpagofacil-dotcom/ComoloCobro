import { getYouTubeEmbedUrl } from "@/lib/utils";

type YouTubeEmbedProps = {
  url: string;
};

export function YouTubeEmbed({ url }: YouTubeEmbedProps) {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) {
    return null;
  }

  return (
    <div className="surface-card overflow-hidden rounded-[32px] p-4">
      <div className="aspect-video overflow-hidden rounded-[24px] bg-foreground/5">
        <iframe
          src={embedUrl}
          title="Video explicativo"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
