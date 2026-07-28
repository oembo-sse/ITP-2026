import { AnimatePresence, motion } from "framer-motion";
import { makeSlide } from "../hooks";
import { appear, useSlide } from "../slides";
import { grammar, operationalSemantics } from "../semantics";
import { tex, text } from "../Katex";
import React from "react";
import { H } from "../common";
import { LeanCode } from "../CodeEditor";

const smallStepCode = `
/-- Probabilistic small step operational semantics for \`pGCL\` -/
@[aesop safe [constructors, cases], grind]
inductive Step : Conf₀ Γ → Act → ENNReal → Conf₁ Γ → Prop where
  | skip     : Step conf₀[skip, σ] N 1 conf₁[⇓, σ]
  | assign   : Step conf₀[x := e, σ] N 1 conf₁[⇓, σ[x ↦ e σ]]
  | prob     : Step conf₀[{C} [p] {C}, σ] N 1 conf₁[C, σ]
  | probL    : ¬C₁ = C₂ → 0 < p σ → Step conf₀[{C₁} [p] {C₂}, σ] N (p σ) conf₁[C₁, σ]
  | probR    : ¬C₁ = C₂ → p σ < 1 → Step conf₀[{C₁} [p] {C₂}, σ] N (1 - p σ) conf₁[C₂, σ]
  | nonDetL  : Step conf₀[{C₁} [] {C₂}, σ] L 1 conf₁[C₁, σ]
  | nonDetR  : Step conf₀[{C₁} [] {C₂}, σ] R 1 conf₁[C₂, σ]
  | tick     : Step conf₀[tick(r), σ] N 1 conf₁[⇓, σ]
  | observe₁ :  b σ → Step conf₀[observe(b), σ] N 1 conf₁[⇓, σ]
  | observe₂ : ¬b σ → Step conf₀[observe(b), σ] N 1 conf₁[↯, σ]
  | seqL : Step conf₀[C₁, σ] α p conf₁[⇓, τ]  → Step conf₀[C₁; C₂, σ] α p conf₁[C₂, τ]
  | seqR : Step conf₀[C₁, σ] α p conf₁[C', τ] → Step conf₀[C₁; C₂, σ] α p conf₁[C'; C₂, τ]
  | seqF : Step conf₀[C₁, σ] N 1 conf₁[↯, σ]  → Step conf₀[C₁; C₂, σ] N 1 conf₁[↯, σ]
  | loop  : ¬b σ → Step conf₀[while b {C}, σ] N 1 conf₁[⇓, σ]
  | loop' :  b σ → Step conf₀[while b {C}, σ] N 1 conf₁[C; while b {C}, σ]
`;

const steps = [
  <div className="text-3xl">
    An <H>operational semantics</H> defines how a program is executed.
  </div>,
  <div className="text-3xl">
    A configuration {tex`\\Conf : \\pGCL \\times \\Mem`} is the combination{" "}
    <br />
    of a program and a memory, denoted by {tex`\\state{C}{\\sigma}`}.
  </div>,
  // ...operationalSemantics.map(
  //   (op) => (delta: number) =>
  //     delta == 0 && (
  //       <div
  //         className={
  //           "flex flex-col items-center transition gap-20 " +
  //           (delta == 0 ? "text-4xl" : "text-xl")
  //         }
  //       >
  //         {op}
  //       </div>
  //     ),
  // ),
  (delta: number) =>
    delta == 0 && (
      <div className="flex flex-col gap-6 text-xl">
        {operationalSemantics.map((op) => (
          <div className="flex justify-center items-center gap-10">{op}</div>
        ))}
      </div>
    ),
  <LeanCode src={smallStepCode} />,
  <LeanCode
    src={`
inductive Termination where
  /-- Faulted termination due to observation failure, denoted by ↯. -/
  | fault
  /-- Partial termination, denoted by ⇓. -/
  | term
instance : SmallStepSemantics (pGCL Γ) (State Γ) Termination Act := 𝕊 cost_t cost_p
    `}
  />,
];

export const s02 = makeSlide(steps.length + 1, () => {
  const { step } = useSlide();
  return (
    <div className="flex justify-center flex-col items-center gap-10">
      <AnimatePresence>
        <appear.div>
          <div className="text-7xl">
            <H>Operational semantics</H>
          </div>
        </appear.div>
        {steps.slice(0, step).map((s, idx) => {
          const delta = step - (idx + 1);
          const sf = typeof s == "function" ? s(delta) : s;
          return (
            <React.Fragment key={idx}>
              {sf && (
                <appear.div
                  key={idx}
                  from={idx + 1}
                  className={idx + 1 == step ? "mt-10 mb-32" : ""}
                >
                  {sf}
                </appear.div>
              )}
            </React.Fragment>
          );
        })}
      </AnimatePresence>
    </div>
  );
});
