import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import type { PaginationMeta } from "../../types";

interface Props {
  meta: PaginationMeta;
  onChange: (page: number) => void;
}

export function Pagination({ meta, onChange }: Props) {
  const { page, totalPages, total, limit } = meta;
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);

  const pages = buildPageRange(page, totalPages);

  return (
    <div className="flex items-center justify-between py-3 px-1">
      <p className="text-sm text-gray-500">
        Mostrando <span className="font-medium">{from}–{to}</span> de{" "}
        <span className="font-medium">{total}</span> registros
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft size={14} />
        </Button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-gray-400">…</span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(p as number)}
              className="h-8 w-8 p-0 text-xs"
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

function buildPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4)  return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];

  return [1, "...", current - 1, current, current + 1, "...", total];
}
