import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscá una empresa o servicio",
  className,
}: SearchInputProps) {
  return (
    <label className={cn("group relative block", className)}>
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/35 transition group-focus-within:text-brand" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-[22px] border border-black/8 bg-white pl-12 pr-5 text-base shadow-[0_18px_40px_rgba(26,26,46,0.07)] transition placeholder:text-foreground/35 focus:border-brand/35"
      />
    </label>
  );
}
