import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Неподдерживаемый формат. Разрешены: PNG, JPG, JPEG, WEBP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Файл слишком большой. Максимум 10 МБ" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, fileName), buffer);

    const url = `/uploads/${fileName}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка при загрузке файла" },
      { status: 500 }
    );
  }
}
