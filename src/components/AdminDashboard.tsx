import React from 'react';
import { ShieldAlert, Lock } from 'lucide-react';

interface AdminDashboardProps {
  adminEmail: string;
}

export default function AdminDashboard({ adminEmail }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border border-amber-500/30 bg-slate-900 p-8 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
              <ShieldAlert className="h-8 w-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-amber-300">
                Admin Dashboard Temporarily Disabled
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Signed in as <span className="text-cyan-300 font-medium">{adminEmail}</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-300 leading-relaxed">
                Client-side administrative access has been disabled as part of a security hardening pass.
                Administrative actions must be moved to authenticated server-side endpoints before this panel
                can be safely re-enabled.
              </p>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Public and standard user features remain available according to the active access rules. The admin
              workflow is intentionally paused until the secure backend replacement is completed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
