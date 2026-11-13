"use client";

import { Hash, AtSign, Search, RotateCcw, Users2, Layers, ToggleLeft } from "lucide-react";
import { useGiveawayStore } from "@/lib/giveaway/store";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export function RulesStep() {
  const rules = useGiveawayStore((s) => s.rules);
  const setRules = useGiveawayStore((s) => s.setRules);
  const resetRules = useGiveawayStore((s) => s.resetRules);
  const qualifiedCount = useGiveawayStore((s) => s.qualified.length);
  const entriesCount = useGiveawayStore((s) => s.entries.length);

  const totalToPick = rules.winnerCount + rules.backupCount;
  const enough = qualifiedCount >= totalToPick;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Winners */}
        <SectionCard
          icon={<TrophyIcon />}
          title="Winners"
          subtitle="How many people to pick."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <CounterSlider
              label="Primary winners"
              value={rules.winnerCount}
              min={1}
              max={10}
              onChange={(v) => setRules({ winnerCount: v })}
            />
            <CounterSlider
              label="Backup winners"
              value={rules.backupCount}
              min={0}
              max={10}
              onChange={(v) => setRules({ backupCount: v })}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Total to draw: <span className="font-medium text-foreground">{totalToPick}</span> from{" "}
            <span className="font-medium text-foreground">{qualifiedCount}</span> qualified entries.
          </p>
        </SectionCard>

        {/* Filters */}
        <SectionCard
          icon={<Search className="h-4 w-4" />}
          title="Filters"
          subtitle="Only entries matching these conditions will enter the draw."
        >
          <div className="space-y-4">
            <FilterRow
              icon={<Hash className="h-4 w-4 text-fuchsia-500" />}
              label="Must contain hashtag(s)"
              placeholder="#giveaway, #win"
              value={rules.hashtags.join(", ")}
              onChange={(v) => setRules({ hashtags: splitList(v) })}
              hint="Comma-separated. Leave empty to skip."
            />
            <FilterRow
              icon={<AtSign className="h-4 w-4 text-fuchsia-500" />}
              label="Must mention user(s)"
              placeholder="@friend_one, @friend_two"
              value={rules.mentions.join(", ")}
              onChange={(v) => setRules({ mentions: splitList(v) })}
              hint="Comma-separated @handles."
            />
            <FilterRow
              icon={<Search className="h-4 w-4 text-fuchsia-500" />}
              label="Must contain keyword(s)"
              placeholder="love, excited"
              value={rules.keywords.join(", ")}
              onChange={(v) => setRules({ keywords: splitList(v) })}
              hint="Plain words (case-insensitive)."
            />

            <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
              <Label className="text-sm font-medium">Match mode</Label>
              <ToggleGroup
                type="single"
                value={rules.matchMode}
                onValueChange={(v) => v && setRules({ matchMode: v as "all" | "any" })}
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem value="any" aria-label="Match any">ANY</ToggleGroupItem>
                <ToggleGroupItem value="all" aria-label="Match all">ALL</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <p className="text-xs text-muted-foreground">
              When multiple terms of a kind are set: <span className="font-medium">ANY</span> = at least one must match,{" "}
              <span className="font-medium">ALL</span> = every term must match.
            </p>
          </div>
        </SectionCard>

        {/* Dedupe */}
        <SectionCard
          icon={<Layers className="h-4 w-4" />}
          title="Deduplication"
          subtitle="Avoid letting the same person win twice."
        >
          <SwitchRow
            icon={<Users2 className="h-4 w-4" />}
            label="Unique participants"
            description="Keep only the first entry per username."
            checked={rules.uniqueParticipants}
            onChange={(v) => setRules({ uniqueParticipants: v })}
          />
          <SwitchRow
            icon={<ToggleLeft className="h-4 w-4" />}
            label="Unique entries"
            description="Skip exact duplicate comment lines."
            checked={rules.uniqueEntries}
            onChange={(v) => setRules({ uniqueEntries: v })}
          />
        </SectionCard>
      </div>

      {/* Side summary */}
      <div className="space-y-4">
        <div className="sticky top-4 space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold">Summary</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Parsed entries" value={entriesCount} />
              <Row label="Qualified" value={qualifiedCount} />
              <Row label="Winners" value={rules.winnerCount} />
              <Row label="Backups" value={rules.backupCount} />
            </dl>
            <div className="mt-4">
              {qualifiedCount === 0 ? (
                <Badge variant="secondary" className="bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                  No qualified entries
                </Badge>
              ) : enough ? (
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">Ready to draw</Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                  Not enough entries
                </Badge>
              )}
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={resetRules}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset rules
          </Button>
        </div>
      </div>
    </div>
  );
}

function splitList(v: string): string[] {
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500/10 to-amber-500/10 text-fuchsia-600">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function CounterSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-muted px-2 text-sm font-semibold tabular-nums">
          {value}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(arr) => arr[0] !== undefined && onChange(arr[0])}
      />
    </div>
  );
}

function FilterRow({
  icon,
  label,
  placeholder,
  value,
  onChange,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-1.5 text-sm">
        {icon}
        {label}
      </Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SwitchRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 text-muted-foreground">{icon}</span>
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M6 4h12v3a6 6 0 0 1-12 0V4Z" strokeLinejoin="round" />
      <path d="M6 6H4v1a3 3 0 0 0 3 3M18 6h2v1a3 3 0 0 1-3 3M9 16h6M12 13v3M8 20h8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
