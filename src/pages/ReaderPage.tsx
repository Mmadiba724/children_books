import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Loader2 /* , Maximize2 */ } from "lucide-react";
import libraryService, { type ReaderSession } from "../services/libraryService";
import { API_BASE_URL } from "../config/api";
import StatePanel from "../components/ui/StatePanel";
import PdfViewer from "../components/PdfViewer";

type BookInfo = { title: string; author: string } | null;

const formatClock = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

/**
 * In-app reader. Digital books are drawn page by page (pdf.js) from a
 * short-lived session and are never offered as downloads.
 */
export default function ReaderPage() {
  const { bookId } = useParams();
  const [session, setSession] = useState<ReaderSession | null>(null);
  const [book, setBook] = useState<BookInfo>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  // Bumped on every new session so the iframe remounts with the fresh URL
  const [sessionKey, setSessionKey] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const handleViewerError = useCallback(() => setFailed(true), []);

  const startSession = useCallback(async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      setFailed(false);
      const next = await libraryService.getReadSession(bookId);
      setSession(next);
      setSecondsLeft(next.expiresInSeconds);
      setSessionKey((k) => k + 1);
    } catch (error) {
      console.error("Failed to start reader session:", error);
      setSession(null);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    startSession();
  }, [startSession]);

  // Title / author for the toolbar (best effort; the reader works without it)
  useEffect(() => {
    if (!bookId) return;
    let cancelled = false;
    libraryService.getLibraryBook(Number(bookId)).then((b) => {
      if (!cancelled && b) setBook({ title: b.bookTitle, author: b.bookAuthor });
    });
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  // Count down the session token's lifetime
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const t = setTimeout(
      () => setSecondsLeft((s) => (s === null ? s : s - 1)),
      1000,
    );
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const expired = secondsLeft !== null && secondsLeft <= 0;
  const title = book?.title ?? "Book reader";
  const canEmbed =
    session && session.displayMode === "iframe" && session.format === "DIGITAL";

  const toolbar = (
    <div className="border-b border-line bg-white">
      <div className="kb-container flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-left">
        <Link to="/library" className="kb-btn kb-btn-secondary kb-btn-sm">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Library
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-bold text-ink capitalize">
            {title}
          </h1>
          {book?.author && (
            <p className="truncate text-sm text-ink-soft">by {book.author}</p>
          )}
        </div>
        {canEmbed && secondsLeft !== null && !expired && (
          <span
            className="hidden items-center gap-1.5 text-sm font-semibold text-muted sm:inline-flex"
            title="You can keep reading; we'll ask you to continue when the session ends"
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            Session {formatClock(secondsLeft)}
          </span>
        )}
        {/* {canEmbed && !expired && (
          <button
            type="button"
            onClick={() => frameRef.current?.requestFullscreen?.()}
            className="kb-btn kb-btn-secondary kb-btn-sm"
            aria-label="Read in full screen"
          >
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Full screen</span>
          </button>
        )} */}
      </div>
    </div>
  );

  let body;
  if (loading && !session) {
    body = (
      <div
        role="status"
        aria-label="Opening your book"
        className="kb-container py-8"
      >
        <div className="kb-skeleton h-[70vh] w-full rounded-2xl" />
      </div>
    );
  } else if (failed) {
    body = (
      <StatePanel
        variant="error"
        title="We couldn't open this book"
        message="It may not be in your library yet, or the connection dropped. Please try again."
        action={
          <>
            <button
              type="button"
              onClick={startSession}
              className="kb-btn kb-btn-primary"
            >
              Try again
            </button>
            <Link to="/library" className="kb-btn kb-btn-secondary">
              Back to library
            </Link>
          </>
        }
      />
    );
  } else if (session && !canEmbed) {
    body = (
      <StatePanel
        variant="empty"
        title="This book can't be read online"
        message="It isn't available in the online reader."
        action={
          <Link to="/library" className="kb-btn kb-btn-primary">
            Back to library
          </Link>
        }
      />
    );
  } else if (session) {
    body = (
      <div ref={frameRef} className="relative bg-cream-deep">
        <PdfViewer
          key={sessionKey}
          title={`Book reader: ${title}`}
          url={`${API_BASE_URL}${session.iframeEmbedUrl}`}
          onError={handleViewerError}
        />
        {expired && (
          <div
            role="alertdialog"
            aria-labelledby="reader-expired-title"
            className="absolute inset-0 flex items-center justify-center bg-ink/60 p-4"
          >
            <div className="max-w-sm rounded-2xl bg-white p-6 text-center shadow-(--shadow-lift)">
              <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sun-light text-warning">
                <Clock className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2
                id="reader-expired-title"
                className="font-display text-xl font-bold"
              >
                Your reading session timed out
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Continue reading to pick up where you left off.
              </p>
              <button
                type="button"
                onClick={startSession}
                disabled={loading}
                className="kb-btn kb-btn-primary mt-5 w-full"
              >
                {loading && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Continue reading
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {toolbar}
      {body}
    </div>
  );
}
