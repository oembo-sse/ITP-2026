import React from "react";
import { Callout, H } from "../common";
import { makeSlide } from "../hooks";
import { appear } from "../slides";
import { LeanCode } from "../CodeEditor";
import { tex } from "../Katex";

const samples = {
  def: `
def spGCL.enc (C : spGCL) (O : Optimization) (E : Encoding) :
    Globals → Globals × HeyVL := fun G ↦
  match C with`,
  loop: `
  -- encode using Idle-induction
  | spgcl {while b inv(I) {C}} =>
    let (G, C) := C.enc O E G
    match E with`,
  wlp: `    | .wlp => (G, heyvl {
      assert(I) ; havocs(C.mods) ; validate ; assume(I) ;
      if (b) { C ; assert(I) ; assume(0) } })`,
  wlp1: `enc⟦while b inv(I) {C}⟧ :=`,
  wlp2: `
  (G, heyvl {
              assert(I) ;
              -- havoc only modified variables using Idle-induction
              -- improves original encoding from [Schröer et al. 2023]
              havocs(C.mods) ;
              validate ;
              assume(I) ;
              if (b) {
                C ;
                assert(I) ;
                assume(0)
              }
  })`,
  wp: `    | .wp => (G, heyvl {
      coassert(I) ; cohavocs(C.mods) ; covalidate ; coassume(I) ;
      if (b) { C ; coassert(I) ; coassume(⊤) } })`,
  prob: `
  -- encode using sampling from binomial distribution
  | spgcl {{C₁} [p] {C₂}} =>
    let (G, C₁) := C₁.enc O E G ; let (G, C₂) := C₂.enc O E G
    let_fresh choice : .Bool ← G
    (G, heyvl { choice :≈ flip(p); if (choice) {C₁} else {C₂} })
`,
  rest: `  -- rest elided for brevity ...`,

  wp_le_vp: `
theorem wp_le_vp (C : spGCL) (φ : HeyLo) :
    wp[O]⟦C.pGCL⟧ φ.sem ≤ ((C.enc O .wp (C.fv ∪ φ.fv)).2.vp φ).sem := ⋯
`,
  wlp_le_vp: `
theorem vp_le_wlp (C : spGCL) (φ : HeyLo)
  (hφ : φ.sem ≤ 1) (hI : ∀ I ∈ C.invs, I.sem ≤ 1) :
    ((C.enc O .wlp (C.fv ∪ φ.fv)).2.vp φ).sem ≤ wlp[O]⟦@C.pGCL⟧ φ.sem := ⋯
`,
  NatLog: `
def NatLog := vc[𝒟, wp]
  { [0 < y] * ↑(y + nlog2(y)) }
    while 0 < y inv([0 < y] * ↑(y + nlog2(y))) {
      {
        y := y / 2
      } [1/2] {
        y := y - 1
      } ;
      tick(1)
    }
  { 0 }
`,
  NatLogProof: `
theorem NatLog.soundess : NatLog.sound := by
  vc_simp
  rintro (_ | y) <;> simp
  grw [(by omega : 1 ≤ y ↔ 0 < y), (by omega : (y + 1) / 2 ≤ y + 1)]
  grw [(by gcongr; omega : y.log2 ≤ (y + 1).log2)]
  simp [← ENNReal.toReal_le_toReal, ENNReal.mul_eq_top, ENNReal.toReal_add]
  if h : y = 0 then subst_eqs; ring_nf; simp
  else
    rw [ENNReal.toReal_sub_of_le]
    · simp [Nat.zero_lt_of_ne_zero h]; grind
    · simp; apply (Nat.le_log2 ?_).mpr <;> grind
    · grind [ENNReal.natCast_ne_top]
`,
};

type Part =
  | "setup"
  | "setup 2"
  | "def"
  | "prob"
  | "loop"
  | "wlp"
  | "wp"
  | "rest"
  | "sound"
  | "natlog"
  | "natlog proof";
const steps: Part[][] = [
  //
  ["setup"],
  ["setup", "setup 2"],
  ["setup", "setup 2", "def"],
  ["def"],
  ["def", "prob"],
  ["def", "prob", "loop", "wlp", "wp"],
  ["wlp"],
  ["def", "loop", "wlp", "wp", "rest"],
  ["def", "loop", "wlp", "wp", "rest", "sound"],
  ["natlog"],
  ["natlog", "natlog proof"],
];

export const sHeyVL = makeSlide(steps.length, (step) => {
  const t = (p: Part): boolean => (steps[step] ?? []).includes(p);

  return (
    <div className="flex justify-center flex-col items-center">
      <appear.div className="text-6xl mb-1">
        <H>Caesar</H>, <H>HeyLo</H> and <H>HeyVL</H>
      </appear.div>
      <appear.p className="text-4xl mb-10">
        Verification Infrastructure for PPs
      </appear.p>

      <appear.div className="w-[120ch] flex flex-col gap-4">
        <appear.div show={t("setup")} className="text-2xl">
          • {tex`\HeyLo`} (read <em>Heyting Logic</em>) is a deeply embedded
          expression language
        </appear.div>
        <appear.div show={t("setup")} className="text-2xl">
          {/* (read <em>Heyting Verification Language</em>) */}• {tex`\HeyVL`}{" "}
          is a <em>loop-free</em> quantitative intermediate verification
          language
        </appear.div>
        <appear.div show={t("setup 2")} className="text-2xl">
          • We introduce {tex`\spGCL`} as a <em>syntatic deep embedding</em> of{" "}
          {tex`\pGCL`} with {tex`\HeyLo`} expressions
        </appear.div>
        <appear.div show={t("setup 2")} className="text-2xl">
          • {tex`\spGCL`} naturally embeds into {tex`\pGCL`} by giving
          interpretation to {tex`\HeyLo`} expressions
        </appear.div>

        <appear.div show={t("def") || t("loop") || t("wlp") || t("wp")}>
          <appear.span show={t("setup")} className="text-2xl">
            • {tex`\spGCL`} embeds into {tex`\HeyVL`} by <H>encoding</H>
          </appear.span>
          <appear.div className="mx-10">
            <appear.div show={t("def")}>
              <LeanCode src={samples.def} />
            </appear.div>
            <appear.div className="mt-4" show={t("prob")}>
              <LeanCode src={samples.prob} noTrim />
            </appear.div>
            <appear.div className="mt-4" show={t("loop")}>
              <LeanCode src={samples.loop} noTrim />
            </appear.div>
            <appear.div show={t("wlp") && !t("loop")}>
              <LeanCode src={samples.wlp1} noTrim />
            </appear.div>
            <appear.div show={t("wlp")}>
              <LeanCode src={t("loop") ? samples.wlp : samples.wlp2} noTrim />
            </appear.div>
            <appear.div show={t("wp")}>
              <LeanCode src={samples.wp} noTrim />
            </appear.div>
            <appear.div className="mt-4" show={t("rest")}>
              <LeanCode src={samples.rest} noTrim />
            </appear.div>
          </appear.div>
        </appear.div>

        <appear.div show={t("sound")} className="flex justify-center">
          <Callout title="Soundess of encoding">
            <div className="mx-2 gap-4 flex flex-col">
              <LeanCode src={samples.wp_le_vp} />
              <LeanCode src={samples.wlp_le_vp} />
            </div>
          </Callout>
        </appear.div>

        <appear.div show={t("natlog")}>
          <LeanCode src={samples.NatLog} />
        </appear.div>
        <appear.div show={t("natlog proof")}>
          <LeanCode src={samples.NatLogProof} />
        </appear.div>
      </appear.div>
    </div>
  );
});
