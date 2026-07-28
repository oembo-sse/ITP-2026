import { tex } from "./Katex";

export const grammar = [
  tex`\\begin{array}{rclll}
    C &::=& % \\skip && \\textit{effectless statement} \\\\
      % &|&
      \\assign{x}{A} && \\textit{variable update} \\\\
      &|& \\seq{C_1}{C_2} && \\textit{sequential composition} \\\\
      &|& \\prob{C_1}{p}{C_2} && \\textit{probabilistic choice} \\\\
      &|& \\nondet{C_1}{C_2} && \\textit{non-deterministic choice} \\\\
      &|& \\loop{B}{C} && \\textit{unbounded conditional loop} \\\\
      &|& \\tick{A} && \\textit{incur a cost} \\\\
      &|& \\observe{B} && \\textit{observe a condition}
  \\end{array}`,
];

export const operationalSemantics = [
  tex`\\dfrac{}{\\operation{\\state{\\skip}{\\sigma}}{N,1}{\\state{\\sink}{\\sigma}}}`,
  tex`\\dfrac{}{\\operation{\\state{\\assign{x}{A}}{\\sigma}}{N,1}{\\state{\\sink}{\\sigma[x \\mapsto A(\\sigma)]}}}`,
  [
    tex`\\dfrac{\\operation{\\state{C_1}{\\sigma}}{\\alpha,p}{\\state{\\sink}{\\sigma'}}}{\\operation{\\state{\\seq{C_1}{C_2}}{\\sigma}}{\\alpha,p}{\\state{C_2}{\\sigma'}}}`,
    tex`\\dfrac{\\operation{\\state{C_1}{\\sigma}}{\\alpha,p}{\\state{C_1'}{\\sigma'}}}{\\operation{\\state{\\seq{C_1}{C_2}}{\\sigma}}{\\alpha,p}{\\state{\\seq{C_1'}{C_2}}{\\sigma'}}}`,
    tex`\\dfrac{\\operation{\\state{C_1}{\\sigma}}{\\alpha,p}{\\state{\\fault}{\\sigma'}}}{\\operation{\\state{\\seq{C_1}{C_2}}{\\sigma}}{\\alpha,p}{\\state{\\fault}{\\sigma'}}}`,
    // tex`\\dfrac{\\operation{\\state{C_1'}{\\sigma}}{\\alpha,p}{\\state{\\sink}{\\sigma'}}}{\\operation{\\state{\\seq{C_1}{C_2}}{\\sigma}}{\\alpha,p}{\\state{\\seq{C_1'}{C_2}}{\\sigma'}}}`,
  ],
  [
    tex`\\dfrac{C_1 \\ne C_2}{\\operation{\\state{\\prob{C_1}{p}{C_2}}{\\sigma}}{N,p(\\sigma)}{\\state{C_1}{\\sigma}}}`,
    tex`\\dfrac{C_1 \\ne C_2}{\\operation{\\state{\\prob{C_1}{p}{C_2}}{\\sigma}}{N,1-p(\\sigma)}{\\state{C_2}{\\sigma}}}`,
    tex`\\dfrac{}{\\operation{\\state{\\prob{C}{p}{C}}{\\sigma}}{N,1}{\\state{C}{\\sigma}}}`,
  ],
  [
    tex`\\dfrac{}{\\operation{\\state{\\nondet{C_1}{C_2}}{\\sigma}}{L,1}{\\state{C_1}{\\sigma}}}`,
    tex`\\dfrac{}{\\operation{\\state{\\nondet{C_1}{C_2}}{\\sigma}}{R,1}{\\state{C_2}{\\sigma}}}`,
  ],
  // [
  //   tex`\\dfrac{\\sigma \\models B}{\\operation{\\state{\\ite{B}{C_1}{C_2}}{\\sigma}}{N,1}{\\state{C_1}{\\sigma}}}`,
  //   tex`\\dfrac{\\sigma \\models ¬B}{\\operation{\\state{\\ite{B}{C_1}{C_2}}{\\sigma}}{N,1}{\\state{C_2}{\\sigma}}}`,
  // ],
  [
    tex`\\dfrac{\\sigma \\models B}{\\operation{\\state{\\loop{B}{C}}{\\sigma}}{N,1}{\\state{\\seq{C}{\\loop{B}{C}}}{\\sigma}}}`,
    tex`\\dfrac{\\sigma \\models ¬B}{\\operation{\\state{\\loop{B}{C}}{\\sigma}}{N,1}{\\state{\\sink}{\\sigma}}}`,
  ],
  tex`\\dfrac{}{\\operation{\\state{\\tick{A}}{\\sigma}}{N,1}{\\state{\\sink}{\\sigma}}}`,
  [
    tex`\\dfrac{\\sigma \\models B}{\\operation{\\state{\\observe{B}}{\\sigma}}{N,1}{\\state{\\sink}{\\sigma}}}`,
    tex`\\dfrac{\\sigma \\models ¬B}{\\operation{\\state{\\observe{B}}{\\sigma}}{N,1}{\\state{\\fault}{\\sigma}}}`,
  ],
  [
    tex`\\dfrac{}{\\operation{\\state{\\sink}{\\sigma}}{N,1}{\\bot}}`,
    tex`\\dfrac{}{\\operation{\\bot}{N,1}{\\bot}}`,
  ],
];

// noncomputable def pGCL.dwp (C : pGCL ϖ) (X : Expr ϖ) : Expr ϖ := match C with
//   | .skip => X
//   -- NOTE: non-standard
//   | .sink => X
//   | .assign x A => X.subst x A
//   | .seq C₁ C₂ => C₁.dwp (C₂.dwp X)
//   | .prob C₁ p C₂ => p.val * C₁.dwp X + (1 - p.val) * C₂.dwp X
//   | .nonDet C₁ C₂ => C₁.dwp X ⊓ C₂.dwp X
//   | .ite B C₁ C₂ => B.probOf * C₁.dwp X + B.not.probOf * C₂.dwp X
//   | .loop B C' => lfp λY => B.probOf * C'.dwp Y + B.not.probOf * X
//   | .tick e => e + X

export const weakestPre = [
  tex`\\dwp{\\assign{x}{A}}{X} = X[x \\setminus A]`,
  tex`\\dwp{\\skip}{X} = X`,
  tex`\\dwp{\\seq{C_1}{C_2}}{X} = \\dwp{C_1}{\\dwp{C_2}{X}}`,
  tex`\\dwp{\\prob{C_1}{p}{C_2}}{X} = p \\cdot \\dwp{C_1}{X} + (1 - p) \\cdot \\dwp{C_2}{X}`,
  tex`\\dwp{\\nondet{C_1}{C_2}}{X} = \\dwp{C_1}{X} \\sqcap \\dwp{C_2}{X}`,
  tex`\\dwp{\\loop{B}{C}}{X} = \\text{lfp} \\: \\lambda Y.\\: B \\cdot \\dwp{C}{Y} + \\neg B \\cdot X`,
  tex`\\dwp{\\tick{A}}{X} = A + X`,
  tex`\\dwp{\\observe{B}}{X} = \\iver{B} \\cdot X`,
];

export const identities = {
  ξ_def: `def ξ[O] : (P → 𝔼[S] →o 𝔼[S]) →o P → 𝔼[S] →o 𝔼[S] :=
  ⟨fun Y C ↦ ⟨fun X σ ↦ Φ[O] (𝕊.cost X) conf[C, σ] (match · with
    | conf[C', σ'] => Y C' X σ' | conf[t, σ'] => 𝕊.cost_t X (t, σ') | ⊥ => 0), ⋯⟩, ⋯⟩`,
  Φ_dem_def: `def Φ[𝒟] c : 𝔼[S] →o 𝔼[S] := ⟨fun X s ↦ c s + ⨅ α, ∑' s', P s α s' * X s', ⋯⟩`,
  Φ_ang_def: `def Φ[𝒜] c : 𝔼[S] →o 𝔼[S] := ⟨fun X s ↦ c s + ⨆ α, ∑' s', P s α s' * X s', ⋯⟩`,
  op_def: `def op[O] : P → 𝔼[S] →o 𝔼[S] :=
  fun C ↦ ⟨fun X σ ↦ ⨆ n, ⨅ 𝒮, EC (𝕊.cost X) 𝒮 n conf[C, σ], ⋯⟩`,
  wp_eq_op: `wp[O]⟦C⟧ X = op[O]⟦C⟧ X`,
  wlp_eq_wfp: `wlp[O]⟦C⟧ f = 1 - wfp[Oᶜ]⟦C⟧ (1 - f)`,
  wfp_eq_op: `wfp[O]⟦C⟧ X = op[O]⟦C⟧ X`,
  gfp_eq_lfp: `gfp f = 1 - lfp ⟨fun x ↦ 1 - f (1 - x), ⋯⟩`,
  opt_def: `inductive Optimization where
  /-- Maximize by way of ⊔ (supremum), written 𝒜. -/
  | Angelic
  /-- Minimize by way of ⊓ (infimum), written 𝒟. -/
  | Demonic`,
  EC_def: `
/-- The expected cost of an MDP with cost function c, scheduler 𝒮, and depth n. -/
def EC c 𝒮 n : 𝔼[S] := fun s ↦ ∑' π : Path[M,s,=n], π.Cost c * π.Prob 𝒮`,
  OEC_dem_def: `⨅ 𝒮 : Scheduler, ⨆ n, EC c 𝒮 n`,
  OEC_ang_def: `⨆ 𝒮 : Scheduler, ⨆ n, EC c 𝒮 n`,
  lfp_Φ_dem: `⨅ 𝒮 : Scheduler, ⨆ n, EC c 𝒮 n = lfp (Φ[𝒟] c)`,
  lfp_Φ_ang: `⨆ 𝒮 : Scheduler, ⨆ n, EC c 𝒮 n = lfp (Φ[𝒜] c)`,
  expectation_def: `notation "𝔼["S"]" => S → ENNReal`,
  MC_def: `
structure MarkovChain (State : Type*) where
  ι : State
  P : State → PMF State
`,
};
