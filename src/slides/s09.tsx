import { AnimatePresence, motion } from "framer-motion";
import { tex } from "../Katex";
import { makeSlide } from "../hooks";
import { appear, useSlide } from "../slides";
import { Callout, H } from "../common";
import React from "react";
import { identities, weakestPre } from "../semantics";
import { InlineLeanCode, LeanCode } from "../CodeEditor";
import { s } from "../nodes";
import { Network, rewardNode } from "../Network";
import type { Edge } from "vis-network/esnext";

const wpDef = `def wp (O : Optimization) : pGCL Γ → 𝔼[Γ, ENNReal] →o 𝔼[Γ, ENNReal]
  | pgcl {skip} => ⟨fun X ↦ X, fun ⦃_ _⦄ h ↦ h⟩
  | pgcl {@x := @A} => ⟨fun X ↦ X[x ↦ A], fun ⦃_ _⦄ h j ↦ h _⟩
  | pgcl {@C₁; @C₂} =>
    ⟨fun X ↦ C₁.wp O (C₂.wp O X), fun ⦃_ _⦄ h ↦ (C₁.wp _).mono ((C₂.wp _).mono h)⟩
  | pgcl {{@C₁} [@p] {@C₂}} =>
    ⟨fun X ↦ p * C₁.wp O X + (1 - p) * C₂.wp O X, fun ⦃_ _⦄ _ ↦ by simp only; gcongr⟩
  | pgcl {{@C₁} [] {@C₂}} =>
    ⟨O.opt (C₁.wp O) (C₂.wp O), fun ⦃_ _⦄ _ ↦ by simp; gcongr⟩
  | pgcl {while @b {@C'}} => ⟨fun X ↦ lfp (Ψ[wp O C'] b X), fun ⦃_ _⦄ _ ↦ by simp; gcongr⟩
  | pgcl {tick(@e)} => ⟨(e + ·), fun ⦃_ _⦄ _ ↦ by simp; gcongr⟩
  | pgcl {observe(@b)} => ⟨(i[b] * ·), fun ⦃_ _⦄ _ ↦ by simp; gcongr⟩`;
const wpDefNoMono = `def wp (O : Optimization) : pGCL Γ → 𝔼[Γ, ENNReal] →o 𝔼[Γ, ENNReal]
  | pgcl {skip}          => ⟨fun X ↦ X, ⋯⟩
  | pgcl {x := A}        => ⟨fun X ↦ X[x ↦ A], ⋯⟩
  | pgcl {C₁; C₂}        => OrderHom.comp (C₁.wp O) (C₂.wp O)
  | pgcl {{C₁} [p] {C₂}} => ⟨fun X ↦ p * C₁.wp O X + (1 - p) * C₂.wp O X, ⋯⟩
  | pgcl {{C₁} [] {C₂}}  => ⟨O.opt (C₁.wp O) (C₂.wp O), ⋯⟩
  | pgcl {while b {C'}}  => ⟨fun X ↦ lfp (Ψ[wp O C'] b X), ⋯⟩
  | pgcl {tick(e)}       => ⟨(e + ·), ⋯⟩
  | pgcl {observe(b)}    => ⟨(i[b] * ·), ⋯⟩
  `;

const wpShortDef = `def wp : pGCL Γ → 𝔼[Γ, ENNReal] →o 𝔼[Γ, ENNReal]
  wp[O]⟦while b {C}⟧ f := lfp (Ψ[wp[O]⟦C⟧] b f)
  wp[O]⟦observe(b)⟧  f := i[b] * f
  `;
const wfpPrimeDef = `def wfp : pGCL Γ → ProbExp Γ →o ProbExp Γ
  wfp[O]⟦while b {C}⟧ f := lfp (pΨ[wfp[O]⟦C⟧] b f)
  wfp[O]⟦observe(b)⟧  f := p[b] * f + (1 - p[b])
  `;
const wfpDef = `def wfp : pGCL Γ → 𝔼[Γ, ENNReal] →o 𝔼[Γ, ENNReal]
  | pgcl {while b {C'}} => ⟨fun X ↦ lfp (Ψ[wfp O C'] b X), ⋯⟩
  | pgcl {observe(b)}   => ⟨(i[b] * · + (1 - i[b])), ⋯⟩
  -- ... elided for brevity
  `;
const wlpPrimeDef = `def wlp : pGCL Γ → ProbExp Γ →o ProbExp Γ
  wlp[O]⟦while b {C}⟧ f := gfp (pΨ[wlp[O]⟦C⟧] b f)
  wlp[O]⟦observe(b)⟧  f := p[b] * f
  `;
const wlpDef = `def wlp : pGCL Γ → 𝔼[Γ, ENNReal] →o 𝔼[Γ, ENNReal] :=
  fun C ↦ ⟨fun X ↦ wlp'[O]⟦C⟧ (X ⊓ 1), ⋯⟩`;
const cwpDef = `
def cwp : pGCL Γ → 𝔼[Γ, ENNReal] →o 𝔼[Γ, ENNReal]
  cwp[O]⟦C⟧ f := wp[O]⟦C⟧ f / wlp[O]⟦C⟧ 1
`;

const ExptDesc = (props: {
  name: React.ReactNode;
  fp: React.ReactNode;
  fault: React.ReactNode;
  lattice: React.ReactNode;
  tick: React.ReactNode;
}) => {
  return (
    <>
      <appear.div className="flex-1 text-xl">{props.name}</appear.div>
      <appear.div className="text-xl">uses {props.fp}</appear.div>
      <appear.div className="text-xl">fault goes to {props.fault}</appear.div>
      <appear.div className="text-xl">{props.lattice}</appear.div>
      {/* <appear.div className="text-xl">{props.tick}</appear.div> */}
    </>
  );
};

const ExpFig = ({ fault }: { fault: string }) => {
  return (
    <Network
      highlighted={[]}
      nodes={[
        {
          x: 0,
          y: 0,
          id: s(1),
          label: "σ",
          size: 4,
          color: "white",
          font: { size: 20 },
        },
        {
          x: 0,
          y: 70,
          id: s(2),
          // label: s(2),
          shape: "dot",
          size: 2,
        },
        {
          x: -150,
          y: 140,
          id: s(3),
          shape: "dot",
          size: 2,
          label: "f(τ₁)",
          font: { size: 20 },
          widthConstraint: { minimum: 20 },
          // label: s(3),
        },
        {
          x: -50,
          y: 140,
          id: s(4),
          shape: "dot",
          size: 2,
          label: "f(τ₂)",
          font: { size: 20 },
          widthConstraint: { minimum: 20 },
          // label: s(4),
        },
        {
          x: 80,
          y: 140,
          id: s(5),
          shape: "dot",
          size: 2,
          label: "f(τ₃)",
          font: { size: 20 },
          widthConstraint: { minimum: 20 },
          // label: s(5),
        },
        {
          x: 150,
          y: 140,
          id: s(6),
          shape: "dot",
          size: 2,
          color: "white",
          label: fault,
          font: {
            size: fault == "⋯" ? 24 : 24,
          },
        },
        {
          x: -210,
          y: 162,
          label: "Exp[",
          shape: "box",
          font: { face: "'KaTeX_Main'", size: 30 },
          color: "white",
          widthConstraint: { minimum: 20 },
        },
        {
          x: 180,
          y: 162,
          label: "]",
          shape: "box",
          font: { face: "'KaTeX_Main'", size: 30 },
          color: "white",
          widthConstraint: { minimum: 20 },
        },
      ]}
      edges={(
        [
          [1, 3, {}],
          [1, 2, {}],
          [2, 4, {}],
          [2, 5, { label: "C", font: { size: 30 } }],
          [
            1,
            6,
            // { arrows: "", color: fault == "⋯" ? void 0 : "rgba(0,0,0,0.05)" },
            { arrows: "", color: fault == "⋯" ? void 0 : rewardNode.color },
          ],
        ] as [number, number, Edge][]
      ).map(([from, to, opts]) => ({
        from: s(from),
        to: s(to),
        arrows: "to",
        dashes: true,
        width: 2,
        ...opts,
      }))}
    />
  );
};

export const sExp = makeSlide(5, (step) => {
  return (
    <div className="flex justify-center flex-col items-center gap-10">
      <div className="text-7xl flex whitespace-pre">
        <AnimatePresence>
          <motion.span layout="position" className="text-center">
            <H>Total expectation</H>
          </motion.span>
        </AnimatePresence>
      </div>
      <appear.div className="flex justify-center flex-col items-center gap-2">
        <div className="text-3xl flex flex-col gap-4">
          <p>
            <H>
              <b>Given:</b>
            </H>{" "}
            a probabilistic program {tex`C : \pGCL`} and a post expectation{" "}
            {tex`f : \Mem \to \ENNReal`}.
          </p>
          <p>
            <H>
              <b>Running</b>
            </H>{" "}
            {tex`C`} on initial state {tex`\sigma : \Mem`} yields a
            (sub-)distribution over final states.
          </p>
          <p>
            <H>
              <b>Question:</b>
            </H>{" "}
            What is the <H>expected value</H> of {tex`f`} after termination of{" "}
            {tex`C`}?
          </p>
        </div>
      </appear.div>

      <appear.div className="flex relative w-[100ch]">
        <ExpFig fault={step <= 4 ? "⋯" : "↯"} />
      </appear.div>

      <appear.div show={0 < step}>
        <appear.div className="grid grid-cols-[auto_80ch] text-2xl gap-x-4 gap-y-3">
          <InlineLeanCode src="Exp[⋯] " />
          {[
            "= fun σ ↦ ⨆ n : ℕ, ⨅ 𝒮 : Scheduler, EC (cost f) 𝒮 n conf[C, σ]",
            "-- by definition \n= op[𝒟]⟦C⟧ f",
            "-- by Lemma 27\n= (lfp ξ[𝒟])⟦C⟧ f",
            "-- by Theorem 30\n= wp[𝒟]⟦C⟧ f",
          ]
            .slice(0, step)
            .map((s, i) => (
              <appear.div key={i} className="col-start-2">
                <InlineLeanCode src={s} />
              </appear.div>
            ))}
        </appear.div>
      </appear.div>
    </div>
  );
});

export const sExp2 = makeSlide(4, (step) => {
  return (
    <div className="flex justify-center flex-col items-center gap-10">
      <div className="text-7xl flex whitespace-pre">
        <AnimatePresence>
          <motion.span layout="position" className="text-center">
            <H>Total expectation (revisited)</H>
          </motion.span>
        </AnimatePresence>
      </div>
      <appear.div className="flex justify-center flex-col items-center gap-2">
        <div className="text-3xl flex flex-col gap-4">
          <p>
            How should we handle <H>non-termination</H>?
          </p>
        </div>
      </appear.div>
      {/* <appear.div className="flex justify-center flex-col items-center gap-2">
        <div className="text-3xl flex flex-col gap-4">
          <p>
            <H>
              <b>Given:</b>
            </H>{" "}
            a probabilistic program {tex`C : \pGCL`} and a post expectation{" "}
            {tex`f : \Mem \to \ENNReal`}.
          </p>
          <p>
            <H>
              <b>Running</b>
            </H>{" "}
            {tex`C`} on initial state {tex`\sigma : \Mem`} yields a
            (sub-)distribution over final states.
          </p>
          <p>
            <H>
              <b>Question:</b>
            </H>{" "}
            What is the <H>expected value</H> of {tex`f`} after termination of{" "}
            {tex`C`}?
          </p>
        </div>
      </appear.div> */}

      <appear.div className="flex relative w-[100ch]">
        <ExpFig fault={step < 1 ? "⋯" : "?"} />
      </appear.div>

      <appear.div show={1 < step}>
        <appear.div className="grid grid-cols-[auto_80ch] text-2xl gap-x-4 gap-y-3">
          <InlineLeanCode src="Exp[⋯] " />
          {[
            "= fun σ ↦ ⨆ n : ℕ, ⨅ 𝒮 : Scheduler, EC (cost f) 𝒮 n conf[C, σ] TODO",
            // "-- by definition \n= op[𝒟]⟦C⟧ f",
            // "-- by Lemma 27\n= (lfp ξ[𝒟])⟦C⟧ f",
            "= wlp[𝒟]⟦C⟧ f",
          ]
            .slice(0, step - 1)
            .map((s, i) => (
              <appear.div key={i} className="col-start-2">
                <InlineLeanCode src={s} />
              </appear.div>
            ))}
        </appear.div>
      </appear.div>
    </div>
  );
});

const steps = [
  <LeanCode src={wpDefNoMono} />,
  <LeanCode
    src={`
/-- The characteristic function, parametric over exp transformer g and condition b. -/
def Ψ (g : 𝔼[Γ, ENNReal] →o 𝔼[Γ, ENNReal]) (φ : BExpr Γ) :
    𝔼[Γ, ENNReal] →o 𝔼[Γ, ENNReal] →o 𝔼[Γ, ENNReal] :=
  ⟨fun f ↦ ⟨fun X ↦ i[φ] * g X + i[φᶜ] * f, ⋯⟩, ⋯⟩
  `}
  />,
  <appear.div className="flex justify-center mt-4">
    <Callout title={<>Soundness of {tex`\wp{C}`}</>}>
      <div className="flex flex-col gap-2">
        <p className="text-xl">Since loops are computed using {tex`\lfp`}</p>
        <div className="px-8">
          <InlineLeanCode
            src={`wp[O]⟦while b {C}⟧ f = lfp (Ψ[wp[O]⟦C⟧] b f)`}
          />
        </div>
        <p className="text-xl">we relate directly to {tex`ξ`}</p>
        <div className="px-8">
          <InlineLeanCode src={`wp[O]⟦C⟧ = (lfp ξ[O])⟦C⟧ = op[O]⟦C⟧`} />
        </div>
      </div>
    </Callout>
  </appear.div>,
  // ...weakestPre.map(
  //   (wp, idx) => (delta: number) =>
  //     delta - weakestPre.length + idx < 1 && (
  //       <div className="text-3xl flex gap-10">{wp}</div>
  //     ),
  // ),
  // null,
  // <div className="text-3xl flex gap-10">{tex`\\wp{\\nondet{C_1}{C_2}}{X} = \\wp{C_1}{X} \\sqcap \\wp{C_2}{X}`}</div>,
  // <div className="text-3xl flex gap-10">{tex`\\wp{\\loop{B}{C}}{X} = \\text{lfp} \\: \\lambda Y.\\: B \\cdot \\wp{C}{Y} + \\neg B \\cdot X`}</div>,
  // <Callout title="Reminder:">
  //   <div className="flex justify-center flex-col items-center gap-4">
  //     <div className="text-3xl">{tex`\\begin{aligned}
  //       \\lambda \\state{C}{\\sigma}.\\: &\\MinER(r, \\state{C}{\\sigma}) \\\\
  //           &= \\text{lfp}\\: \\lambda v.\\: \\lambda \\state{C}{\\sigma}.\\: r(\\state{C}{\\sigma}) + \\displaystyle \\inf_{\\alpha \\:\\in\\: \\Act} \\sum_{\\state{C'}{\\sigma'} \\:\\in\\: \\succs_\\alpha(\\state{C}{\\sigma})} \\cdots % \\P(\\state{C}{\\sigma}, \\alpha)(\\state{C'}{\\sigma'}) \\cdot v(\\state{C'}{\\sigma'})
  //       \\end{aligned}`}</div>
  //   </div>
  // </Callout>,
  // null,
];

export const s09 = makeSlide(steps.length + 1, () => {
  const { step } = useSlide();
  return (
    <div className="flex justify-center flex-col items-center gap-2">
      <div className="text-7xl flex whitespace-pre">
        <AnimatePresence>
          <motion.span layout="position" className="text-center">
            <H>Weakest preexpectation</H>
          </motion.span>
        </AnimatePresence>
      </div>
      <appear.div className="flex justify-center flex-col items-center gap-4">
        <div className="text-3xl">
          <div className="text-3xl">
            The <H>weakest preexpectation</H> transforms an expression to the{" "}
            <i>expectation</i> <br />
            of that expression after executing the given program.
          </div>
        </div>
      </appear.div>

      <div className="grid gap-2">
        {steps.slice(0, step).map((s) => {
          return s;
        })}
      </div>
    </div>
  );
});

const zooSteps: (React.ReactNode | ((delta: number) => React.ReactNode))[] = [
  <>
    <ExptDesc
      name={
        <>
          <i>Weakest preexpectation</i>
        </>
      }
      fp={<>{tex`\\lfp`}</>}
      fault={<>0</>}
      lattice={<>{tex`\\ENNReal`}</>}
      tick={<>tick adds</>}
    />
    <div className="col-span-full mb-4">
      <LeanCode src={wpShortDef} />
    </div>
  </>,
  <>
    <ExptDesc
      name={
        <>
          Weakest <i>liberal</i> preexpectation (over {tex`\\PReal`})
        </>
      }
      fp={<>{tex`\\gfp`}</>}
      fault={<>0</>}
      lattice={<>{tex`\\PReal`}</>}
      tick={<>tick ignored</>}
    />
    <div className="col-span-full mb-4">
      <LeanCode src={wlpPrimeDef} />
    </div>
  </>,
  // <>
  //   <ExptDesc
  //     name={
  //       <>
  //         Weakest <i>liberal</i> preexpectation
  //       </>
  //     }
  //     fp={<>{tex`\\gfp`}</>}
  //     fault={<>0</>}
  //     lattice={<>{tex`\\ENNReal`}</>}
  //     tick={<>tick ignored</>}
  //   />
  //   <div className="col-span-full mb-4">
  //     <LeanCode src={wlpDef} />
  //   </div>
  // </>,
  (delta: number) =>
    delta < 3 && (
      <appear.div className="col-span-full flex justify-center my-6">
        <Callout title="Problem!">
          <p className="text-2xl">
            How do we relate {tex`\wlp{C}`} (which uses uses {tex`\gfp`}) to{" "}
            {tex`\lfp ξ`}?
          </p>
        </Callout>
      </appear.div>
    ),
  <>
    <ExptDesc
      name={
        <>
          Weakest <i>fault-tolerant</i> preexpectation (over {tex`\\PReal`})
        </>
      }
      fp={<>{tex`\\lfp`}</>}
      fault={<>1</>}
      lattice={<>{tex`\\PReal`}</>}
      tick={<>tick ignored</>}
    />
    <div className="col-span-full mb-4">
      <LeanCode src={wfpPrimeDef} />
    </div>
  </>,
  (delta: number) =>
    delta < 2 && (
      <appear.div className="col-span-full flex justify-center my-6">
        <Callout
          title={
            <>
              Soundness of {tex`\wlp{C}`} by way of {tex`\wfp{C}`}{" "}
            </>
          }
        >
          <div className="flex flex-col gap-2">
            <p className="text-xl">
              Since {tex`\wfp{C}`} loops are computed using {tex`\lfp`}
            </p>
            <div className="px-8">
              <InlineLeanCode
                src={`wfp[O]⟦while b {C}⟧ f = lfp (pΨ[wp[O]⟦C⟧] b f)`}
              />
            </div>
            <p className="text-xl">
              we relate directly to {tex`ξ`} using a new <em>cost function</em>
            </p>
            <div className="px-8">
              <InlineLeanCode src={`wfp[O]⟦C⟧ = (lfp ξ[O])⟦C⟧ = op[O]⟦C⟧`} />
            </div>
            <p className="text-xl">
              with identity connecting {tex`\gfp`} and {tex`\lfp`}
            </p>
            <div className="px-8">
              <InlineLeanCode src={identities.gfp_eq_lfp} />
            </div>
            <p className="text-xl">
              now connect {tex`\wfp{C}`} and {tex`\wlp{C}`} using
            </p>
            <div className="px-8">
              <InlineLeanCode src={identities.wlp_eq_wfp} />
            </div>
          </div>
        </Callout>
      </appear.div>
    ),
  null,
  null,
  // <>
  //   <ExptDesc
  //     name={
  //       <>
  //         Weakest <i>fault-tolerant</i> preexpectation
  //       </>
  //     }
  //     fp={<>{tex`\\lfp`}</>}
  //     fault={<>1</>}
  //     lattice={<>{tex`\\ENNReal`}</>}
  //     tick={<>tick ignored</>}
  //   />
  //   <div className="col-span-full mb-4">
  //     <LeanCode src={wfpDef} />
  //   </div>
  // </>,
  <>
    <ExptDesc
      name={
        <>
          <i>Conditional</i> weakest preexpectation
        </>
      }
      fp={<>{tex`\\lfp \\text{ and } \\gfp`}</>}
      fault={<>0</>}
      lattice={<>{tex`\\ENNReal`}</>}
      tick={<>tick added</>}
    />
    <div className="col-span-full mb-4">
      <LeanCode src={cwpDef} />
    </div>
  </>,
];

export const sZoo = makeSlide(zooSteps.length + 1, () => {
  const { step } = useSlide();
  return (
    <div className="flex justify-center flex-col items-center gap-2">
      <div className="text-7xl flex whitespace-pre">
        <AnimatePresence>
          <motion.span layout="position" className="text-center">
            <H>Weakest preexpectation zoo</H>
          </motion.span>
        </AnimatePresence>
      </div>
      {/* <LeanCode src={wpDef} /> */}
      <div className="grid grid-cols-[1fr_18ch_20ch_5ch] gap-x-10 w-[135ch]">
        <appear.div className="text-xl">
          <H>Name</H>
        </appear.div>
        <appear.div className="text-xl">
          <H>Fixed point</H>
        </appear.div>
        <appear.div className="text-xl">
          <H>Observation fault</H>
        </appear.div>
        <appear.div className="text-xl">
          <H>Lattice</H>
        </appear.div>
        {/* <appear.div className="text-xl">
          <H>Tick</H>
        </appear.div> */}

        {zooSteps.slice(0, step).map((s, idx) => {
          const delta = step - (idx + 1);
          return (
            <React.Fragment key={idx}>
              {typeof s == "function" ? s(delta) : s}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
});

export const sZooSoundness = makeSlide(1, () => {
  const { step } = useSlide();
  return (
    <div className="flex justify-center flex-col items-center gap-2">
      <div className="text-7xl flex whitespace-pre">
        <AnimatePresence>
          <motion.span layout="position" className="text-center">
            <H>Weakest preexpectation soundness zoo</H>
          </motion.span>
        </AnimatePresence>
      </div>
      {/* <LeanCode src={wpDef} /> */}
      <div className="grid grid-cols-[1fr_18ch_20ch_5ch_15ch] gap-x-10 w-[135ch]">
        <appear.div className="text-xl">
          <H>Name</H>
        </appear.div>
        <appear.div className="text-xl">
          <H>Fixed point</H>
        </appear.div>
        <appear.div className="text-xl">
          <H>Observation fault</H>
        </appear.div>
        <appear.div className="text-xl">
          <H>Lattice</H>
        </appear.div>
        <appear.div className="text-xl">
          <H>Tick</H>
        </appear.div>

        <appear.div className="col-span-full">
          <LeanCode src={identities.wlp_eq_wfp} />
        </appear.div>
        <appear.div className="col-span-full">
          <LeanCode src={identities.wp_eq_op} />
        </appear.div>
        <appear.div className="col-span-full">
          <LeanCode src={identities.wfp_eq_op} />
        </appear.div>
      </div>
    </div>
  );
});
