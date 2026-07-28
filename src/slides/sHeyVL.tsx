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
};

type Part = "setup" | "def" | "prob" | "loop" | "wlp" | "wp" | "rest" | "sound";
const steps: Part[][] = [
  //
  [],
  ["def"],
  ["def", "prob"],
  ["def", "prob", "loop"],
  ["def", "prob", "loop", "wlp"],
  ["def", "prob", "loop", "wlp", "wp"],
  ["def", "prob", "loop", "wlp", "wp", "rest"],
  ["def", "loop", "wlp", "wp", "rest"],
  ["def", "loop", "wlp", "wp", "rest", "sound"],
];

export const sHeyVL = makeSlide(steps.length, (step) => {
  const t = (p: Part): boolean => (steps[step] ?? []).includes(p);

  return (
    <div className="flex justify-center flex-col items-center">
      <appear.div className="text-6xl mb-10">
        <H>Caesar</H>, <H>HeyLo</H> and <H>HeyVL</H>
      </appear.div>

      <appear.div className="w-[120ch] flex flex-col gap-4">
        <appear.div className="text-2xl">
          • {tex`\HeyLo`} (read <em>Heyting Logic</em>) is a deeply embedded
          expression language
        </appear.div>
        <appear.div className="text-2xl">
          • {tex`\HeyVL`} (read <em>Heyting Verification Language</em>) is a
          probabilistic modelling language
        </appear.div>
        <appear.div className="text-2xl">
          • We introduce {tex`\spGCL`} as a <em>syntatic deep embedding</em> of{" "}
          {tex`\pGCL`} with {tex`\HeyLo`} expressions
        </appear.div>
        <appear.div className="text-2xl">
          • {tex`\spGCL`} naturally embeds into {tex`\pGCL`} by giving
          interpretation to {tex`\HeyLo`} expressions
        </appear.div>

        <appear.div show={t("def")}>
          <span className="text-2xl">
            • {tex`\spGCL`} embeds into {tex`\HeyLo`} by <H>encoding</H>
          </span>
          <appear.div show={t("def")} className="mx-10">
            <appear.div show={t("def")}>
              <LeanCode src={samples.def} />
            </appear.div>
            <appear.div className="mt-4" show={t("prob")}>
              <LeanCode src={samples.prob} noTrim />
            </appear.div>
            <appear.div className="mt-4" show={t("loop")}>
              <LeanCode src={samples.loop} noTrim />
            </appear.div>
            <appear.div show={t("wlp")}>
              <LeanCode src={samples.wlp} noTrim />
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
      </appear.div>
    </div>
  );
});
