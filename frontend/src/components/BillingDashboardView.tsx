import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  FileText,
  Download,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Building,
  TrendingUp,
  Lock,
  Loader2
} from 'lucide-react';
import { SubscriptionDetails, PricingPlan, InvoiceItem } from '../types';

interface BillingDashboardViewProps {
  subscription: SubscriptionDetails;
  plans: PricingPlan[];
  invoices: InvoiceItem[];
  onUpgradePlan: (planId: 'pro' | 'enterprise', cycle: 'monthly' | 'annual') => Promise<void>;
  onCancelSubscription: () => Promise<void>;
  documentCount: number;
}

export const BillingDashboardView: React.FC<BillingDashboardViewProps> = ({
  subscription,
  plans,
  invoices,
  onUpgradePlan,
  onCancelSubscription,
  documentCount
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [stripeSimulatedModal, setStripeSimulatedModal] = useState<{ open: boolean; plan?: PricingPlan }>({ open: false });

  const currentPdfCount = documentCount ?? subscription.current_pdf_count ?? 3;
  const isFreePlan = subscription.plan_id === 'free';
  const pdfLimit = subscription.pdf_limit === -1 ? Infinity : subscription.pdf_limit;
  const isNearLimit = isFreePlan && currentPdfCount >= 4;
  const isAtLimit = isFreePlan && currentPdfCount >= 5;

  const handleUpgrade = async (plan: PricingPlan) => {
    if (plan.id === subscription.plan_id) return;
    setLoadingPlan(plan.id);
    setStripeSimulatedModal({ open: true, plan });

    try {
      // Simulate Stripe API checkout redirect/processing delay
      await new Promise((res) => setTimeout(res, 1200));
      await onUpgradePlan(plan.id as 'pro' | 'enterprise', billingCycle);
      setStripeSimulatedModal({ open: false });
      setSuccessMsg(`🎉 Success! Upgraded to ${plan.name}. Unlimited PDF uploads unlocked.`);
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCancel = async () => {
    setLoadingPlan('cancel');
    try {
      await onCancelSubscription();
      setShowCancelConfirm(false);
      setSuccessMsg('Subscription downgraded to Free Plan.');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">

      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-navy-950 to-indigo-950 p-8 border border-slate-800 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              SaaS Billing & Quota Telemetry
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Billing & SaaS Subscription</h1>
            <p className="text-slate-400 mt-1 max-w-xl text-sm leading-relaxed">
              Manage your Legal AI indexing quotas, upgrade via Stripe integration, and view organization billing receipts.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur border border-slate-700/80 p-3.5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Active Plan</div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                {subscription.plan_name}
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${isFreePlan ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                  {subscription.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs text-emerald-500 underline hover:text-emerald-400">
            Dismiss
          </button>
        </div>
      )}

      {/* Limit / Quota Usage Progress Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: PDF Upload Quota Meter */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PDF Document Quota
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>

          <div className="my-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {currentPdfCount}
                <span className="text-lg font-normal text-slate-500 dark:text-slate-400">
                  {pdfLimit === Infinity ? ' / Unlimited' : ` / ${pdfLimit} PDFs`}
                </span>
              </span>
              {isFreePlan && (
                <span className={`text-xs font-bold ${isAtLimit ? 'text-rose-500' : isNearLimit ? 'text-amber-500' : 'text-slate-500'}`}>
                  {Math.round((currentPdfCount / 5) * 100)}% Used
                </span>
              )}
            </div>

            {/* Progress bar */}
            {isFreePlan ? (
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isAtLimit ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-brand-500'
                    }`}
                  style={{ width: `${Math.min(100, (currentPdfCount / 5) * 100)}%` }}
                ></div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                Unlimited PDF Indexing Active
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {isFreePlan
              ? 'Free plan is capped at 5 PDFs. Upgrade to Pro for unlimited contract storage.'
              : 'Pro tier enjoys unlimited legal document storage with priority vector indexing.'}
          </p>
        </div>

        {/* Card 2: Payment Security & Stripe Status */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Payment Gateway
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <div className="my-4 space-y-1">
            <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Stripe 256-bit SSL
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customer ID: <code className="font-mono text-brand-600">{subscription.stripe_customer_id || 'cus_demo'}</code>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>PCI-DSS Compliant Payment Processing</span>
          </div>
        </div>

        {/* Card 3: Billing Cycle & Renewal */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Renews On
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="my-4">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {subscription.renews_at}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Billing cycle: <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{subscription.billing_cycle}</span>
            </div>
          </div>

          {!isFreePlan ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold self-start hover:underline"
            >
              Cancel or Downgrade Subscription
            </button>
          ) : (
            <div className="text-xs text-slate-400">
              No automatic charge on Free tier.
            </div>
          )}
        </div>

      </div>

      {/* Plan Selection Section */}
      <div className="space-y-6">

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Select Your SaaS Tier</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Scale legal document intelligence across your team with transparent pricing.
            </p>
          </div>

          {/* Billing Cycle Toggle (Monthly vs Annual) */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-300/50 dark:border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${billingCycle === 'monthly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${billingCycle === 'annual'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Annual Billing
              <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrent = subscription.plan_id === plan.id;
            const price = billingCycle === 'annual' ? Math.round(plan.price_annual / 12) : plan.price_monthly;
            const isPopular = plan.id === 'pro';

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between p-8 rounded-3xl transition-all duration-300 ${isPopular
                  ? 'bg-white dark:bg-slate-900 border-2 border-brand-500 shadow-xl shadow-brand-500/10 scale-105 z-10'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-md">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
                    {isCurrent && (
                      <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-500/20">
                        Current Plan
                      </span>
                    )}
                  </div>

                  {/* Price Header */}
                  <div className="mt-4 mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        ${price}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        / month
                      </span>
                    </div>
                    {billingCycle === 'annual' && plan.price_annual > 0 && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        Billed annually (${plan.price_annual}/yr)
                      </div>
                    )}
                  </div>

                  {/* PDF Limit Highlighting */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 mb-6">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-500" />
                      Document Capacity:
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                      {plan.pdf_limit === -1 ? '⚡ Unlimited PDFs & DOCX Files' : '📄 5 PDFs Limit (Free Tier)'}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Included Features
                    </div>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upgrade Button */}
                <button
                  disabled={isCurrent || loadingPlan === plan.id}
                  onClick={() => handleUpgrade(plan)}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-sm transition-all ${isCurrent
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default border border-slate-200 dark:border-slate-700'
                    : isPopular
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/25 active:scale-98'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-98'
                    }`}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-current" />
                  ) : isCurrent ? (
                    'Active Plan'
                  ) : (
                    <>
                      <span>Upgrade with Stripe</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice & Receipt History */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Invoices & Receipts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Download past payment invoices generated via Stripe.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
            {invoices.length} Invoices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Invoice ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right rounded-r-xl">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-200">
                    {inv.id}
                  </td>
                  <td className="px-4 py-3.5">{inv.date}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-300">{inv.plan}</td>
                  <td className="px-4 py-3.5 font-extrabold text-slate-900 dark:text-white">{inv.amount}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => alert(`Downloading Stripe PDF Receipt for ${inv.id}`)}
                      className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stripe Modal Simulation Indicator */}
      {stripeSimulatedModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Connecting to Stripe Checkout</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Securing checkout session for <span className="font-bold text-brand-600">{stripeSimulatedModal.plan?.name}</span>...
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-left text-xs text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{stripeSimulatedModal.plan?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Billing:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{billingCycle.toUpperCase()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total Due:</span>
                <span>${billingCycle === 'annual' ? stripeSimulatedModal.plan?.price_annual : stripeSimulatedModal.plan?.price_monthly}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-black">Cancel Subscription?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to cancel your <span className="font-semibold">{subscription.plan_name}</span>? You will be downgraded to the Free tier with a 5 PDF quota cap.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Keep My Plan
              </button>
              <button
                onClick={handleCancel}
                disabled={loadingPlan === 'cancel'}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20"
              >
                {loadingPlan === 'cancel' ? 'Processing...' : 'Confirm Downgrade'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
