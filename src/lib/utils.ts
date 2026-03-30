import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function truncateText(value: string, length = 180): string {
  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length).trimEnd()}...`;
}

export function normalizeNullableString(value?: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function normalizeTags(tags: string[]): string[] {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => tag.toLowerCase()),
    ),
  );
}

export function normalizeLabelList(values: string[]): string[] {
  const seen = new Set<string>();

  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

export function extractYouTubeId(value: string): string | null {
  try {
    const url = new URL(value);

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "") || null;
    }

    if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v");
    }
  } catch {
    if (/^[\w-]{11}$/.test(value)) {
      return value;
    }
  }

  return null;
}

export function getYouTubeEmbedUrl(value: string): string | null {
  const videoId = extractYouTubeId(value);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[[^\]]*]\([^)]*\)/g, "")
    .replace(/[*_`>#-]/g, "")
    .replace(/\n+/g, " ")
    .trim();
}
