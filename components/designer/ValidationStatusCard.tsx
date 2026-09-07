'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { useEVStore } from '@/hooks/useEVStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { validatePowertrainConfiguration, ValidationItem } from '@/lib/validation/powertrainValidator';

export function ValidationStatusCard() {
  const { currentVehicle } = useEVStore();
  const validation = validatePowertrainConfiguration(currentVehicle);

  const statusBadge = {
    optimal: (
      <Badge variant="optimal">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Powertrain Balanced</span>
      </Badge>
    ),
    good: (
      <Badge variant="good">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Architecture Sound</span>
      </Badge>
    ),
    attention: (
      <Badge variant="attention">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Advisories Detected</span>
      </Badge>
    ),
    critical: (
      <Badge variant="critical">
        <AlertOctagon className="w-3.5 h-3.5" />
        <span>Bottlenecks Detected</span>
      </Badge>
    ),
  }[validation.overallStatus];

  return (
    <Card elevated className="space-y-4">
      <CardHeader className="mb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-electric-400" />
          <CardTitle>Powertrain Validation & Compatibility</CardTitle>
        </div>
        {statusBadge}
      </CardHeader>

      <CardDescription>
        Automated engineering sanity check evaluating electrical discharge matching, launch traction adhesion, redline speed margins, and thermal duty limits.
      </CardDescription>

      <div className="space-y-3 pt-2">
        {validation.items.map((item: ValidationItem) => {
          const isCritical = item.status === 'critical';
          const isAttention = item.status === 'attention';
          const isOptimal = item.status === 'optimal';

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all duration-150 flex items-start gap-3 ${
                isCritical
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : isAttention
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : isOptimal
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-surface-200 border-border/80'
              }`}
            >
              {isCritical ? (
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : isAttention ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground">{item.title}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-surface-300/80 text-slate-400">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item.summary}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.details}</p>
                {item.recommendation && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-300 font-medium pt-1">
                    💡 Recommendation: {item.recommendation}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
