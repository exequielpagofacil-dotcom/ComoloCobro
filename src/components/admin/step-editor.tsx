"use client";

import Image from "next/image";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, Trash2 } from "lucide-react";

export type EditableStep = {
  clientId: string;
  id?: string | undefined;
  titulo: string;
  descripcion: string;
  imagen_url: string | null;
  uploading?: boolean | undefined;
};

type StepEditorProps = {
  steps: EditableStep[];
  onChange: (steps: EditableStep[]) => void;
};

type UploadResponse = {
  data?: {
    url: string;
  };
  error?: string;
};

function createStep(): EditableStep {
  return {
    clientId: crypto.randomUUID(),
    titulo: "",
    descripcion: "",
    imagen_url: null,
    uploading: false,
  };
}

type StepItemProps = {
  step: EditableStep;
  index: number;
  onChange: (clientId: string, patch: Partial<EditableStep>) => void;
  onRemove: (clientId: string) => void;
  onUpload: (clientId: string, file: File) => Promise<void>;
};

function StepItem({ step, index, onChange, onRemove, onUpload }: StepItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.clientId,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`rounded-[28px] border border-admin/10 bg-white p-5 ${
        isDragging ? "shadow-[0_20px_40px_rgba(255,122,0,0.18)]" : ""
      }`}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-admin">Paso {index + 1}</p>
          <p className="mt-1 text-sm text-foreground/55">Reordenable con drag-and-drop</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-admin/15 text-foreground/55"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(step.clientId)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-red-200 text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Título</label>
            <input
              value={step.titulo}
              onChange={(event) => onChange(step.clientId, { titulo: event.target.value })}
              className="h-12 w-full rounded-2xl border border-admin/15 bg-white px-4"
              placeholder="Ej. Seleccionar la empresa"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Descripción</label>
            <textarea
              value={step.descripcion}
              onChange={(event) => onChange(step.clientId, { descripcion: event.target.value })}
              rows={4}
              className="w-full rounded-2xl border border-admin/15 bg-white px-4 py-3"
              placeholder="Detalle opcional para este paso"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-admin-soft">
            {step.imagen_url ? (
              <Image
                src={step.imagen_url}
                alt={step.titulo || `Paso ${index + 1}`}
                fill
                className="object-cover"
                sizes="320px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-medium text-admin/70">
                Sin imagen cargada
              </div>
            )}
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-admin/15 bg-white px-4 py-3 text-sm font-semibold text-foreground/75 transition hover:border-admin/35 hover:text-admin">
            <ImagePlus className="h-4 w-4" />
            {step.uploading ? "Subiendo..." : "Subir imagen"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) {
                  return;
                }

                void onUpload(step.clientId, file);
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export function StepEditor({ steps, onChange }: StepEditorProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const items = steps.map((step) => step.clientId);

  function updateStep(clientId: string, patch: Partial<EditableStep>) {
    onChange(
      steps.map((step) => (step.clientId === clientId ? { ...step, ...patch } : step)),
    );
  }

  function removeStep(clientId: string) {
    onChange(steps.filter((step) => step.clientId !== clientId));
  }

  async function uploadStepImage(clientId: string, file: File) {
    updateStep(clientId, { uploading: true });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "pasos");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as UploadResponse;

    if (!response.ok || !payload.data?.url) {
      updateStep(clientId, { uploading: false });
      window.alert(payload.error ?? "No se pudo subir la imagen");
      return;
    }

    updateStep(clientId, {
      imagen_url: payload.data.url,
      uploading: false,
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = steps.findIndex((step) => step.clientId === active.id);
    const newIndex = steps.findIndex((step) => step.clientId === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    onChange(arrayMove(steps, oldIndex, newIndex));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">Pasos</h3>
          <p className="mt-2 text-sm text-foreground/65">
            Cada paso puede tener título, descripción e imagen. Reordená arrastrando.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...steps, createStep()])}
          className="rounded-2xl border border-admin/15 bg-white px-5 py-3 font-semibold text-foreground/75 transition hover:border-admin/35 hover:text-admin"
        >
          Agregar paso
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-admin/20 px-6 py-10 text-center text-foreground/60">
          Todavía no agregaste pasos.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <StepItem
                  key={step.clientId}
                  step={step}
                  index={index}
                  onChange={updateStep}
                  onRemove={removeStep}
                  onUpload={uploadStepImage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
