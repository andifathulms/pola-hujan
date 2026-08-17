import { MONTH_LABELS_ID } from "@/lib/family";

export interface CycleTableProps {
  monthlyMm: number[];
  caption: string;
}

/**
 * The curve's text equivalent — twelve months with values, always
 * present, not a fallback (DESIGN.md §10). Also what someone would paste
 * into a message.
 */
export function CycleTable({ monthlyMm, caption }: CycleTableProps) {
  return (
    <table className="w-full border-collapse font-mono text-xs">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {MONTH_LABELS_ID.map((label) => (
            <th key={label} scope="col" className="border-b border-rule px-1 py-1 text-left font-normal">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {monthlyMm.map((mm, t) => (
            <td key={t} className="px-1 py-1 tabular-nums">
              {Math.round(mm)}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
