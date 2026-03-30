"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImageOff } from "lucide-react";
import type { Paso } from "@/lib/types";

type StepCarouselProps = {
  pasos: Paso[];
};

export function StepCarousel({ pasos }: StepCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (pasos.length === 0) {
    return null;
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === pasos.length - 1;

  return (
    <div className="surface-card overflow-hidden rounded-[36px] p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Paso a paso</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            Proceso visual para completar el cobro
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground/70">
            Paso {currentIndex + 1} de {pasos.length}
          </span>
          <button
            type="button"
            onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
            disabled={isFirst}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-foreground transition enabled:hover:border-brand/25 enabled:hover:text-brand disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((value) => Math.min(pasos.length - 1, value + 1))}
            disabled={isLast}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-foreground transition enabled:hover:border-brand/25 enabled:hover:text-brand disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {pasos.map((paso) => (
            <article key={paso.id} className="w-full shrink-0">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="relative min-h-[340px] overflow-hidden rounded-[28px] bg-muted lg:min-h-[480px]">
                  {paso.imagen_url ? (
                    <Image
                      src={paso.imagen_url}
                      alt={paso.titulo}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 65vw"
                    />
                  ) : (
                    <div className="flex h-full min-h-[340px] items-center justify-center text-foreground/35">
                      <ImageOff className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center rounded-[28px] bg-muted/75 p-6 lg:p-8">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-brand">
                    Paso {paso.orden}
                  </p>
                  <h4 className="text-3xl font-bold tracking-tight text-foreground">{paso.titulo}</h4>
                  {paso.descripcion ? (
                    <p className="mt-5 text-base leading-7 text-foreground/75">{paso.descripcion}</p>
                  ) : (
                    <p className="mt-5 text-base leading-7 text-foreground/45">
                      Sin descripción adicional para este paso.
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
