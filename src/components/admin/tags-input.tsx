"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

type TagsInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  preserveCase?: boolean;
  suggestions?: string[];
};

export function TagsInput({
  tags,
  onChange,
  placeholder = "Escribi un tag y presiona Enter",
  preserveCase = false,
  suggestions = [],
}: TagsInputProps) {
  const [value, setValue] = useState("");

  function addTag(rawTag: string) {
    const normalizedTag = rawTag.trim();

    if (!normalizedTag) {
      return;
    }

    if (tags.some((tag) => tag.toLowerCase() === normalizedTag.toLowerCase())) {
      setValue("");
      return;
    }

    onChange([...tags, preserveCase ? normalizedTag : normalizedTag.toLowerCase()]);
    setValue("");
  }

  const visibleSuggestions = useMemo(() => {
    const normalizedQuery = value.trim().toLowerCase();

    return suggestions.filter((suggestion) => {
      const alreadySelected = tags.some((tag) => tag.toLowerCase() === suggestion.toLowerCase());

      if (alreadySelected) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return suggestion.toLowerCase().includes(normalizedQuery);
    });
  }, [suggestions, tags, value]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-2 rounded-full bg-admin-soft px-3 py-2 text-sm font-medium text-admin"
          >
            {tag}
            <button type="button" onClick={() => onChange(tags.filter((item) => item !== tag))}>
              <X className="h-4 w-4" />
            </button>
          </span>
        ))}
      </div>

      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag(value);
          }
        }}
        onBlur={() => addTag(value)}
        className="h-12 w-full rounded-2xl border border-admin/15 bg-white px-4"
        placeholder={placeholder}
      />

      {visibleSuggestions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/45">
            Sugerencias
          </p>
          <div className="flex flex-wrap gap-2">
            {visibleSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="rounded-full border border-admin/15 bg-white px-3 py-2 text-sm font-medium text-foreground/75 transition hover:border-admin/35 hover:text-admin"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
