export const Readiness={
  evidence(){return window.ASCENDReadinessEvidence||null},
  async refresh(){return window.ASCENDReadinessEvidence?.refresh?.()},
  rule:'Timer completion alone never advances curriculum state.'
};
