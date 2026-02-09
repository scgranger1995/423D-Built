import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// ============================================
// File Upload Handler
// ============================================

// Allowed file extensions and their MIME types
const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  // 3D printing files
  ".stl": ["application/sla", "application/vnd.ms-pki.stl", "model/stl", "application/octet-stream"],
  ".obj": ["application/object", "model/obj", "application/octet-stream"],
  ".3mf": ["application/vnd.ms-package.3dmanufacturing-3dmodel+xml", "application/octet-stream"],

  // Vector / design files
  ".svg": ["image/svg+xml"],
  ".dxf": ["application/dxf", "image/vnd.dxf", "application/octet-stream"],
  ".ai": ["application/postscript", "application/illustrator", "application/octet-stream"],

  // Document files
  ".pdf": ["application/pdf"],

  // Image files
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
};

// TODO: Add rate limiting in production (e.g., upstash/ratelimit or similar)
// to prevent abuse of this unauthenticated endpoint.
// The upload endpoint is intentionally accessible without authentication
// because the public quote/inquiry form allows anonymous file uploads.
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (reduced from 50MB for security)
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Get the file extension from a filename, normalized to lowercase.
 */
function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Validate that the file extension is allowed.
 */
function isAllowedExtension(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext in ALLOWED_EXTENSIONS;
}

/**
 * Generate a safe, unique filename with the original extension.
 */
function generateSafeFilename(originalFilename: string): string {
  const ext = getFileExtension(originalFilename);
  const uuid = uuidv4();
  const timestamp = Date.now();
  return `${timestamp}-${uuid}${ext}`;
}

/**
 * POST /api/upload
 * Handle file upload via multipart form data.
 * Saves file to public/uploads/ with a UUID-based filename.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided. Please attach a file to upload.",
        },
        { status: 400 }
      );
    }

    // Validate file name
    const originalFilename = file.name;
    if (!originalFilename) {
      return NextResponse.json(
        { success: false, error: "File must have a name" },
        { status: 400 }
      );
    }

    // Validate file extension
    if (!isAllowedExtension(originalFilename)) {
      const allowedExts = Object.keys(ALLOWED_EXTENSIONS).join(", ");
      return NextResponse.json(
        {
          success: false,
          error: `File type not allowed. Accepted formats: ${allowedExts}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${maxSizeMB}MB. Your file is ${(
            file.size /
            (1024 * 1024)
          ).toFixed(1)}MB.`,
        },
        { status: 400 }
      );
    }

    // Validate file is not empty
    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "File is empty" },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate safe filename and write file
    const safeFilename = generateSafeFilename(originalFilename);
    const filePath = path.join(UPLOAD_DIR, safeFilename);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await writeFile(filePath, buffer);

    // Build public URL
    const fileUrl = `/uploads/${safeFilename}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          url: fileUrl,
          filename: safeFilename,
          originalFilename,
          size: file.size,
          extension: getFileExtension(originalFilename),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("File upload failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "File upload failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
