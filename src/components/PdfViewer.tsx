import { useEffect, useRef, useState } from "react";
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
} from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerUrl;

type PdfViewerProps = {
  readonly url: string;
  readonly title: string;
  readonly onError: () => void;
};

/**
 * Canvas-based PDF reader. Pages are drawn to canvases, so the browser's
 * built-in viewer (and its download/print buttons) is never involved.
 */
export default function PdfViewer({ url, title, onError }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [width, setWidth] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load the document
  useEffect(() => {
    const task = getDocument({ url, withCredentials: true });
    let cancelled = false;
    setLoading(true);
    task.promise
      .then((doc) => {
        if (cancelled) return;
        setPdf(doc);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load PDF:", err);
        onError();
      });
    return () => {
      cancelled = true;
      task.destroy();
    };
  }, [url, onError]);

  // Track container width so pages fit it
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width)),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const block = (e: { preventDefault: () => void }) => e.preventDefault();

  return (
    <div
      ref={containerRef}
      role="document"
      aria-label={title}
      tabIndex={0}
      onContextMenu={block}
      onDragStart={block}
      onKeyDown={(e) => {
        // Save / print shortcuts
        if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }}
      className="h-[80vh] min-h-[28rem] w-full select-none overflow-y-auto bg-cream-deep p-2 sm:p-4 print:hidden"
    >
      {loading && (
        <div role="status" aria-label="Loading pages" className="kb-skeleton h-full w-full rounded-2xl" />
      )}
      {pdf &&
        width > 0 &&
        Array.from({ length: pdf.numPages }, (_, i) => (
          <PdfPage key={i} pdf={pdf} pageNumber={i + 1} maxWidth={width} />
        ))}
    </div>
  );
}

type PdfPageProps = {
  readonly pdf: PDFDocumentProxy;
  readonly pageNumber: number;
  readonly maxWidth: number;
};

// A page is only rendered once it nears the viewport, so long books stay light.
function PdfPage({ pdf, pageNumber, maxWidth }: PdfPageProps) {
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(pageNumber <= 2);
  const [ratio, setRatio] = useState(1.4); // placeholder height until measured

  useEffect(() => {
    const el = holderRef.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let task: { cancel: () => void; promise: Promise<unknown> } | null = null;
    pdf.getPage(pageNumber).then((page) => {
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;
      const base = page.getViewport({ scale: 1 });
      const cssWidth = Math.min(maxWidth - 8, 900);
      const scale = cssWidth / base.width;
      const dpr = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale * dpr });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${viewport.height / dpr}px`;
      setRatio(base.height / base.width);
      task = page.render({ canvas, viewport });
      task.promise.catch(() => {
        /* cancelled renders reject; nothing to do */
      });
    });
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [pdf, pageNumber, maxWidth, visible]);

  const cssWidth = Math.min(maxWidth - 8, 900);
  return (
    <div
      ref={holderRef}
      className="mx-auto mb-4 bg-white shadow-sm"
      style={{ width: cssWidth, minHeight: visible ? undefined : cssWidth * ratio }}
    >
      {visible && <canvas ref={canvasRef} className="block" aria-label={`Page ${pageNumber}`} />}
    </div>
  );
}
