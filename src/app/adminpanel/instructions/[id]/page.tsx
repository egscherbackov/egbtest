"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Save, ArrowLeft, Plus, Trash2, GripVertical,
  Upload, X, Eye, EyeOff, Pencil
} from "lucide-react";
import { LoaderOne } from "@/components/ui/loader";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Step {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string | null;
  stepOrder: number;
}

interface Category {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  steps: Step[];
}

const inputCls = "w-full px-3 py-2 text-sm outline-none";
const inputStyle = {
  background: "var(--color-ash-gray)",
  border: "1px solid var(--color-steel-gray)",
  borderRadius: "8px",
  color: "var(--color-dark-charcoal)",
};
const cardStyle = {
  background: "var(--color-canvas-white)",
  boxShadow: "var(--shadow-subtle-2)",
  border: "1px solid var(--color-steel-gray)",
};

export default function AdminInstructionEditPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cat, setCat] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const [steps, setSteps] = useState<Step[]>([]);
  const [addingStep, setAddingStep] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepDesc, setNewStepDesc] = useState("");
  const [creatingStep, setCreatingStep] = useState(false);

  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editStepTitle, setEditStepTitle] = useState("");
  const [editStepDesc, setEditStepDesc] = useState("");
  const [editStepImageAlt, setEditStepImageAlt] = useState("");
  const [savingStep, setSavingStep] = useState(false);
  const [uploadingStepId, setUploadingStepId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = steps.findIndex(s => s.id === active.id);
    const newIndex = steps.findIndex(s => s.id === over.id);
    const reordered = arrayMove(steps, oldIndex, newIndex);

    // Optimistic update
    setSteps(reordered.map((s, i) => ({ ...s, stepOrder: i + 1 })));

    // Persist all changed positions
    await Promise.all(
      reordered.map((s, i) =>
        fetch(`/api/admin/instructions/${id}/steps/${s.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stepOrder: i + 1 }),
        })
      )
    );
  }

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/instructions/${id}`);
    if (!res.ok) { router.push("/adminpanel/instructions"); return; }
    const d = await res.json();
    setCat(d.category);
    setTitle(d.category.title);
    setSlug(d.category.slug);
    setDescription(d.category.description || "");
    setIsActive(d.category.isActive);
    setSteps(d.category.steps);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function saveCategory() {
    setSaving(true);
    const res = await fetch(`/api/admin/instructions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, description, isActive }),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error || "Ошибка"); }
    else load();
    setSaving(false);
  }

  async function addStep(e: React.FormEvent) {
    e.preventDefault();
    setCreatingStep(true);
    const res = await fetch(`/api/admin/instructions/${id}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newStepTitle, description: newStepDesc }),
    });
    if (res.ok) {
      setNewStepTitle(""); setNewStepDesc(""); setAddingStep(false);
      load();
    } else { const d = await res.json(); alert(d.error || "Ошибка"); }
    setCreatingStep(false);
  }

  function startEditStep(s: Step) {
    setEditingStepId(s.id);
    setEditStepTitle(s.title);
    setEditStepDesc(s.description);
    setEditStepImageAlt(s.imageAlt || "");
  }

  async function saveStep(stepId: string) {
    setSavingStep(true);
    await fetch(`/api/admin/instructions/${id}/steps/${stepId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editStepTitle, description: editStepDesc, imageAlt: editStepImageAlt }),
    });
    setEditingStepId(null);
    setSavingStep(false);
    load();
  }

  async function deleteStep(stepId: string) {
    if (!confirm("Удалить этот шаг?")) return;
    await fetch(`/api/admin/instructions/${id}/steps/${stepId}`, { method: "DELETE" });
    load();
  }

  async function moveStep(stepId: string, dir: "up" | "down") {
    const idx = steps.findIndex(s => s.id === stepId);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === steps.length - 1) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    const a = steps[idx];
    const b = steps[swapIdx];
    await Promise.all([
      fetch(`/api/admin/instructions/${id}/steps/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepOrder: b.stepOrder }),
      }),
      fetch(`/api/admin/instructions/${id}/steps/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepOrder: a.stepOrder }),
      }),
    ]);
    load();
  }

  async function uploadImage(stepId: string, file: File) {
    setUploadingStepId(stepId);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (res.ok) {
      const d = await res.json();
      await fetch(`/api/admin/instructions/${id}/steps/${stepId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: d.url }),
      });
      load();
    } else {
      const d = await res.json();
      alert(d.error || "Ошибка загрузки");
    }
    setUploadingStepId(null);
  }

  async function removeImage(stepId: string) {
    if (!confirm("Удалить иллюстрацию?")) return;
    await fetch(`/api/admin/instructions/${id}/steps/${stepId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: "" }),
    });
    load();
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-ash-gray)" }}>
      <LoaderOne size="lg" style={{ color: "var(--color-cofounder-blue)" }} />
    </div>
  );

  if (!cat) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-ash-gray)" }}>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link href="/adminpanel/instructions" className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-medium-gray)" }}>
            <ArrowLeft size={16} />
            Инструкции
          </Link>
        </div>

        {/* Category info */}
        <div className="rounded-2xl p-6 mb-5" style={cardStyle}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h1 className="font-bold text-xl" style={{ color: "var(--color-dark-charcoal)" }}>
              {cat.title}
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsActive(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg hover:opacity-80"
                style={{ background: isActive ? "rgba(65,161,207,0.12)" : "rgba(239,68,68,0.1)", color: isActive ? "var(--color-cofounder-blue)" : "#ef4444" }}>
                {isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                {isActive ? "Активна" : "Скрыта"}
              </button>
              <button onClick={saveCategory} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--color-cofounder-blue)", color: "white", borderRadius: "8px" }}>
                {saving ? <LoaderOne size="sm" /> : <Save size={14} />}
                Сохранить
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-medium-gray)" }}>Название</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-medium-gray)" }}>Slug (URL)</label>
              <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className={`${inputCls} font-mono`} style={inputStyle} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-medium-gray)" }}>Описание</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                className={`${inputCls} resize-none`} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="rounded-2xl overflow-hidden mb-5" style={cardStyle}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--color-cool-gray)" }}>
            <h2 className="font-bold text-base" style={{ color: "var(--color-dark-charcoal)" }}>
              Шаги ({steps.length})
            </h2>
            <button onClick={() => setAddingStep(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold hover:opacity-90"
              style={{ background: "var(--color-night-sky)", color: "white", borderRadius: "8px" }}>
              <Plus size={15} />
              Добавить шаг
            </button>
          </div>

          {addingStep && (
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-cool-gray)", background: "var(--color-ash-gray)" }}>
              <form onSubmit={addStep} className="flex flex-col gap-3">
                <input value={newStepTitle} onChange={e => setNewStepTitle(e.target.value)}
                  placeholder="Заголовок шага *" required className={inputCls} style={{ ...inputStyle, background: "white" }} />
                <textarea value={newStepDesc} onChange={e => setNewStepDesc(e.target.value)}
                  placeholder="Описание шага" rows={3} className={`${inputCls} resize-none`} style={{ ...inputStyle, background: "white" }} />
                <div className="flex gap-2">
                  <button type="submit" disabled={creatingStep} className="px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--color-cofounder-blue)", color: "white", borderRadius: "8px" }}>
                    {creatingStep ? "Добавление..." : "Добавить"}
                  </button>
                  <button type="button" onClick={() => setAddingStep(false)} className="px-4 py-2 text-sm font-semibold hover:bg-gray-100"
                    style={{ border: "1px solid var(--color-steel-gray)", borderRadius: "8px", color: "var(--color-slate-gray)" }}>
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          )}

          {steps.length === 0 && !addingStep && (
            <div className="px-5 py-10 text-center" style={{ color: "var(--color-medium-gray)" }}>
              Шагов нет. Нажмите «Добавить шаг».
            </div>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {steps.map((step, idx) => (
                <SortableStepItem
                  key={step.id}
                  step={step}
                  isEditing={editingStepId === step.id}
                  isLast={idx === steps.length - 1}
                  uploadingStepId={uploadingStepId}
                  savingStep={savingStep}
                  editStepTitle={editStepTitle}
                  editStepDesc={editStepDesc}
                  editStepImageAlt={editStepImageAlt}
                  onStartEdit={startEditStep}
                  onSaveEdit={() => saveStep(step.id)}
                  onCancelEdit={() => setEditingStepId(null)}
                  onDelete={() => deleteStep(step.id)}
                  onUpload={(file) => uploadImage(step.id, file)}
                  onRemoveImage={() => removeImage(step.id)}
                  setEditStepTitle={setEditStepTitle}
                  setEditStepDesc={setEditStepDesc}
                  setEditStepImageAlt={setEditStepImageAlt}
                  inputCls={inputCls}
                  inputStyle={inputStyle}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <input ref={fileInputRef} type="file" className="hidden" accept=".png,.jpg,.jpeg,.webp" />
      </main>
    </div>
  );
}

interface SortableStepItemProps {
  step: Step;
  isEditing: boolean;
  isLast: boolean;
  uploadingStepId: string | null;
  savingStep: boolean;
  editStepTitle: string;
  editStepDesc: string;
  editStepImageAlt: string;
  onStartEdit: (s: Step) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onUpload: (f: File) => void;
  onRemoveImage: () => void;
  setEditStepTitle: (v: string) => void;
  setEditStepDesc: (v: string) => void;
  setEditStepImageAlt: (v: string) => void;
  inputCls: string;
  inputStyle: React.CSSProperties;
}

function SortableStepItem({
  step, isEditing, isLast, uploadingStepId, savingStep,
  editStepTitle, editStepDesc, editStepImageAlt,
  onStartEdit, onSaveEdit, onCancelEdit, onDelete, onUpload, onRemoveImage,
  setEditStepTitle, setEditStepDesc, setEditStepImageAlt,
  inputCls, inputStyle,
}: SortableStepItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderBottom: isLast ? "none" : "1px solid var(--color-cool-gray)",
    background: isDragging ? "var(--color-ash-gray)" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {isEditing ? (
        <div className="px-5 py-4 flex flex-col gap-3" style={{ background: "var(--color-ash-gray)" }}>
          <input value={editStepTitle} onChange={e => setEditStepTitle(e.target.value)}
            placeholder="Заголовок *" className={inputCls} style={{ ...inputStyle, background: "white" }} />
          <textarea value={editStepDesc} onChange={e => setEditStepDesc(e.target.value)}
            rows={4} className={`${inputCls} resize-none`} style={{ ...inputStyle, background: "white" }} />
          <input value={editStepImageAlt} onChange={e => setEditStepImageAlt(e.target.value)}
            placeholder="Alt-текст для изображения" className={inputCls} style={{ ...inputStyle, background: "white" }} />
          <div className="flex gap-2">
            <button onClick={onSaveEdit} disabled={savingStep}
              className="px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--color-cofounder-blue)", color: "white", borderRadius: "8px" }}>
              {savingStep ? "Сохранение..." : "Сохранить"}
            </button>
            <button onClick={onCancelEdit} className="px-4 py-2 text-sm font-semibold hover:bg-white"
              style={{ border: "1px solid var(--color-steel-gray)", borderRadius: "8px", color: "var(--color-slate-gray)" }}>
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 py-4">
          <div className="flex gap-3">
            {/* Drag handle */}
            <button
              {...attributes}
              {...listeners}
              className="flex items-center self-stretch px-1 cursor-grab active:cursor-grabbing touch-none rounded hover:bg-gray-100 transition-colors"
              style={{ color: "var(--color-light-gray)" }}
              title="Перетащить"
            >
              <GripVertical size={18} />
            </button>

            <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-0">
              {/* Image */}
              <div className="shrink-0">
                {step.imageUrl ? (
                  <div className="relative w-full sm:w-28 h-20 rounded-xl overflow-hidden group"
                    style={{ border: "1px solid var(--color-steel-gray)" }}>
                    <Image src={step.imageUrl} alt={step.imageAlt || step.title} fill className="object-cover" sizes="112px" />
                    <button onClick={onRemoveImage}
                      className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(239,68,68,0.9)", color: "white" }}>
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full sm:w-28 h-20 rounded-xl cursor-pointer hover:opacity-80 transition-all"
                    style={{ border: "2px dashed var(--color-steel-gray)", color: "var(--color-light-gray)" }}>
                    {uploadingStepId === step.id
                      ? <LoaderOne size="sm" />
                      : <><Upload size={16} className="mb-0.5" /><span className="text-xs font-semibold">Фото</span></>
                    }
                    <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
                  </label>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold mr-2" style={{ color: "var(--color-cofounder-blue)" }}>
                      {step.stepOrder}
                    </span>
                    <span className="text-sm font-bold" style={{ color: "var(--color-dark-charcoal)" }}>{step.title}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onStartEdit(step)} title="Редактировать"
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-all"
                      style={{ color: "var(--color-cofounder-blue)" }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={onDelete} title="Удалить"
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-all"
                      style={{ color: "#ef4444" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {step.description && (
                  <p className="mt-1 text-sm leading-relaxed line-clamp-2" style={{ color: "var(--color-slate-gray)" }}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
