import type { AdminNotice } from "@/backend";
import { EmptyState } from "@/components/shared/EmptyState";
import { ReliefCard, SectionTitle } from "@/components/shared/ReliefCard";
import { formatDateTime } from "@/lib/format";
import { Megaphone } from "lucide-react";

/** Administrator notices addressed to this client. */
export function NoticesList({ notices }: { notices: AdminNotice[] }) {
  return (
    <section data-ocid="client_home.notices_section">
      <SectionTitle title="Avisos del administrador" />
      {notices.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Sin avisos por ahora"
          description="Cuando el administrador publique un aviso para tu cuenta, aparecerá aquí."
        />
      ) : (
        <div className="space-y-3">
          {notices.map((notice, index) => (
            <ReliefCard
              key={notice.id.toString()}
              data-ocid={`client_home.notice.${index + 1}`}
              className="p-4"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
                  <Megaphone className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold leading-snug text-foreground">
                    {notice.title}
                  </p>
                  <p className="mt-1 whitespace-pre-line break-words text-[13px] leading-relaxed text-muted-foreground">
                    {notice.body}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-muted-foreground/80">
                    {formatDateTime(notice.createdAt)}
                  </p>
                </div>
              </div>
            </ReliefCard>
          ))}
        </div>
      )}
    </section>
  );
}
