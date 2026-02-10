"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { BlockSettings } from "./BlockRenderer";

interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
}

interface GalleryContent {
  images?: GalleryImage[];
}

export function GalleryBlock({
  content,
  settings,
}: {
  content: Record<string, unknown>;
  settings: BlockSettings;
}) {
  const c = content as unknown as GalleryContent;
  const images = Array.isArray(c.images) ? c.images : [];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  }, [lightboxIndex, images.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  }, [lightboxIndex, images.length]);

  if (images.length === 0) return null;

  return (
    <div
      className={`py-20 px-6 ${
        settings.fullWidth ? "" : "mx-auto max-w-7xl"
      }`}
      style={{
        backgroundColor: settings.backgroundColor || "transparent",
      }}
    >
      <div className={settings.fullWidth ? "mx-auto max-w-7xl" : ""}>
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square overflow-hidden rounded-xl focus:outline-none"
              style={{ border: "1px solid #2a2a2a" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || `Gallery image ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/30" />
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
                  <p className="text-sm text-white">{img.caption}</p>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
              onClick={closeLightbox}
            >
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goPrev();
                    }}
                    className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goNext();
                    }}
                    className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image */}
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative max-h-[85vh] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[lightboxIndex].url}
                  alt={
                    images[lightboxIndex].alt ||
                    `Gallery image ${lightboxIndex + 1}`
                  }
                  className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
                />
                {images[lightboxIndex].caption && (
                  <p className="mt-3 text-center text-sm text-white/70">
                    {images[lightboxIndex].caption}
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
