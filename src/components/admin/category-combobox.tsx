"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { ChevronDown, PlusCircle, Search } from "lucide-react";
import type { Categoria } from "@/lib/types";

type CategoryComboboxProps = {
  categories: Categoria[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onCreateCategory: () => void;
};

function normalizeQuery(value: string): string {
  return value.trim().toLocaleLowerCase("es-AR");
}

export function CategoryCombobox({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreateCategory,
}: CategoryComboboxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null;
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [draftValue, setDraftValue] = useState(selectedCategory?.nombre ?? "");

  const filteredCategories = useMemo(() => {
    const normalizedQuery = normalizeQuery(draftValue);

    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter((category) =>
      normalizeQuery(category.nombre).includes(normalizedQuery),
    );
  }, [categories, draftValue]);

  const safeActiveIndex = Math.min(activeIndex, Math.max(filteredCategories.length - 1, 0));
  const activeCategory = filteredCategories[safeActiveIndex];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setActiveIndex(0);
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function openCombobox() {
    if (!isOpen) {
      setDraftValue("");
      setActiveIndex(Math.max(categories.findIndex((category) => category.id === selectedCategoryId), 0));
    }

    setIsOpen(true);
  }

  function selectCategory(category: Categoria) {
    onSelectCategory(category.id);
    setDraftValue(category.nombre);
    setActiveIndex(0);
    setIsOpen(false);
  }

  function handleCreateCategory() {
    setActiveIndex(0);
    setIsOpen(false);
    onCreateCategory();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!isOpen) {
        openCombobox();
        return;
      }

      setActiveIndex((currentIndex) =>
        Math.min(currentIndex + 1, Math.max(filteredCategories.length - 1, 0)),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!isOpen) {
        openCombobox();
        return;
      }

      setActiveIndex((currentIndex) => Math.max(currentIndex - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (!isOpen) {
        openCombobox();
        return;
      }

      if (!activeCategory) {
        return;
      }

      event.preventDefault();
      selectCategory(activeCategory);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setActiveIndex(0);
      setIsOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-foreground/45" />
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={isOpen && activeCategory ? `${listboxId}-${activeCategory.id}` : undefined}
          aria-autocomplete="list"
          value={isOpen ? draftValue : selectedCategory?.nombre ?? ""}
          onFocus={openCombobox}
          onChange={(event) => {
            setDraftValue(event.target.value);
            setActiveIndex(0);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="h-12 w-full rounded-2xl border border-admin/15 bg-white pr-11 pl-11"
          placeholder={
            categories.length === 0 ? "Primero crea una categoria" : "Escribi para filtrar"
          }
        />
        <ChevronDown
          className={`pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-foreground/45 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-[24px] border border-admin/15 bg-white shadow-[0_18px_40px_rgba(58,163,227,0.16)]">
          <div
            id={listboxId}
            role="listbox"
            className="max-h-64 overflow-y-auto p-2"
            aria-label="Categorias"
          >
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => {
                const isActive = index === safeActiveIndex;
                const isSelected = category.id === selectedCategoryId;

                return (
                  <button
                    key={category.id}
                    id={`${listboxId}-${category.id}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectCategory(category)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
                      isActive
                        ? "bg-admin-soft text-admin"
                        : "text-foreground/75 hover:bg-admin-soft/60 hover:text-admin"
                    }`}
                  >
                    <span className="font-medium">{category.nombre}</span>
                    {isSelected ? (
                      <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                        actual
                      </span>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl px-4 py-3 text-sm text-foreground/55">
                No hay coincidencias para lo que escribiste.
              </div>
            )}

            <button
              type="button"
              onClick={handleCreateCategory}
              className="mt-2 flex w-full items-center gap-2 rounded-2xl border border-dashed border-admin/25 px-4 py-3 text-left text-sm font-semibold text-admin transition hover:border-admin/45 hover:bg-admin-soft/60"
            >
              <PlusCircle className="h-4 w-4" />
              Crear categoria nueva
            </button>
          </div>
        </div>
      ) : null}

      <p className="mt-2 text-xs text-foreground/45">
        Escribi para filtrar y presiona Enter para usar la primera coincidencia.
      </p>
    </div>
  );
}
