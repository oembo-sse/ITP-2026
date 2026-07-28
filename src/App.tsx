import { LayoutGroup, motion } from "framer-motion";
import { buildSlides, makeSlide, useSlidesBase } from "./hooks";
import { appear, SlidesContext, useSlide } from "./slides";
import { sIntro } from "./slides/sIntro";
import { s01 } from "./slides/s01";
import { s04 } from "./slides/s04";
import { s00 } from "./slides/s00";
import { s90 } from "./slides/s90";
import { s10 } from "./slides/s10";
import { sA } from "./slides/sA";
import { sC, sequenceA, sequenceB } from "./slides/sC";
import { sRels } from "./slides/sRels";
import { sLean } from "./slides/sLean";
import { Callout, H } from "./common";
import { tex } from "./Katex";
import { s02 } from "./slides/s02";
import { s09, sExp, sExp2, sZoo, sZooSoundness } from "./slides/s09";
import { sMdp } from "./slides/sMdp";
import { sOMdp } from "./slides/sOMdp";
import React from "react";
import { sMarkovChains } from "./slides/sMarkovChains";
import { Code, InlineLeanCode, LeanCode } from "./CodeEditor";

const Domain = ({
  id,
  className,
  from,
  children,
}: {
  id?: string;
  className?: string;
  from: number;
  children?: React.ReactNode;
}) => (
  <appear.div id={id} from={from} className={`text-3xl ${className}`}>
    {children}
  </appear.div>
);
const Description = ({
  className,
  from,
  children,
}: {
  className?: string;
  from: number;
  children: React.ReactNode;
}) => (
  <div className={`text-xl ${className}`}>
    <appear.div from={from}>{children}</appear.div>
  </div>
);
const Arrows = ({
  className,
  from,
  children,
}: {
  className?: string;
  from: number;
  children: React.ReactNode;
}) => (
  <appear.div from={from} className={`text-xl mx-4 ${className}`}>
    <appear.div>{children}</appear.div>
  </appear.div>
);

const sConnection = (
  start: number,
  end: number,
  word: React.ReactNode = "will cover",
) =>
  makeSlide(end - start, () => {
    const n = {
      pGCL_op: 3 - start,
      pGCL_wp: 3 - start,
      HeyVL: 4 - start,
      MDP: 2 - start,
      MC: 1 - start,
    };

    return (
      <div className="flex justify-center flex-col items-center">
        <appear.div className="text-6xl mb-10">
          <H>What we {word}</H>
        </appear.div>
        <div className="grid gap-2 text-center grid-cols-[repeat(9,auto)] items-center">
          <div>
            <Domain from={n.MC}>Markov Chains</Domain>
            <Description from={n.MC}>
              Underlying <br /> probability model
            </Description>
          </div>

          <Arrows
            from={Math.max(n.MC, n.MDP)}
          >{tex`\\overset{${Math.max(n.MC, n.MDP) - 1 + start}}{\\Longleftarrow}`}</Arrows>

          <div>
            <Domain from={n.MDP}>MDP</Domain>
            <Description from={n.MDP}>
              Operational <br /> model
            </Description>
          </div>

          <Arrows
            from={Math.max(n.MDP, n.pGCL_op)}
          >{tex`\\overset{${Math.max(n.MDP, n.pGCL_op) - 1 + start}}\\Longleftarrow`}</Arrows>

          <appear.div>
            <Domain id="pGCL" from={Math.min(n.pGCL_op, n.pGCL_wp)}>
              pGCL
            </Domain>
            <div className="flex gap-2">
              <Description from={n.pGCL_op}>
                <span className="whitespace-nowrap">Small step</span> <br />{" "}
                semantics
              </Description>
              <Arrows
                from={Math.max(n.pGCL_wp)}
              >{tex`\\overset{${Math.max(n.pGCL_wp) - 1 + start}}\\Longleftrightarrow`}</Arrows>
              <Description from={n.pGCL_wp}>
                Denotational <br /> semantics
              </Description>
            </div>
          </appear.div>

          <Arrows
            from={Math.max(n.HeyVL, n.pGCL_wp)}
          >{tex`\\overset{${Math.max(n.HeyVL, n.pGCL_wp) - 1 + start}}\\Longrightarrow`}</Arrows>

          <div>
            <Domain from={n.HeyVL}>HeyVL</Domain>
            <Description from={n.HeyVL}>
              Verification <br /> language
            </Description>
          </div>
        </div>
        <appear.div from={Math.max(...Object.values(n)) + 1}>
          <h1>Contributions:</h1>
          <ol>
            <li>
              {tex`\\overset{${n.pGCL_wp}}{\\Longleftrightarrow}`}: Existing
              work by Batz
            </li>
            <li>
              {tex`\\overset{${n.MDP}}{\\Longleftarrow}`}: Existing work by
              Höltzl
            </li>
            <li>
              {tex`\\overset{${n.MC}-1}{\\Longleftarrow}`}: New contribution
            </li>
            <li>
              {tex`\\overset{${n.HeyVL}}{\\Longrightarrow}`}: New contribution
            </li>
          </ol>
        </appear.div>
      </div>
    );
  });

type IdlePart =
  | "park"
  | "idle desc"
  | "idle example A"
  | "idle example B"
  | "idle def"
  | "idle comment"
  | "k ind"
  | "co";
const idleSteps: IdlePart[][] = [
  //
  ["park"],
  ["park", "idle example A"],
  ["park", "idle example A", "idle desc"],
  ["park", "idle desc", "idle example B"],
  ["park", "idle desc", "idle example B", "idle def"],
  ["park", "idle desc", "idle def"],
  ["park", "idle desc", "idle def", "idle comment"],
  ["park", "idle desc", "idle def"],
  ["park", "idle desc", "idle def", "k ind"],
  ["park", "idle desc", "idle def", "k ind", "co"],
];

const sIdle = makeSlide(idleSteps.length, (step) => {
  const t = (p: IdlePart): boolean => (idleSteps[step] ?? []).includes(p);

  const co = t("co") ? 1 : 0;
  const CO = <appear.span show={t("co")}>co</appear.span>;

  return (
    <div className="flex justify-center flex-col items-center">
      <appear.div className="text-6xl mb-10">
        Invariant based reasoning for loops
        {/* <H>Idle</H> k-(co)induction */}
      </appear.div>

      <appear.div className="flex flex-col gap-4 w-[115ch]">
        <appear.div show={t("park")} className="text-4xl">
          <H>Park</H> {CO}induciton
        </appear.div>
        <appear.div>
          <LeanCode
            src={
              [
                `
theorem ParkInduction {I : 𝔼[Γ, ENNReal]}
  -- \`I\` is a Park-invariant
  (h : Ψ[wp[O]⟦C⟧] b φ I ≤ I) :
    wp[O]⟦while b { C }⟧ φ ≤ I := ⋯
            `,
                `
theorem ParkCoinduction {I : ProbExp[Γ]}
  -- \`I\` is a Park-coinvariant
  (h : I ≤ Ψ[wlp[O]⟦C⟧] b φ I) :
    I ≤ wlp[O]⟦while b { C }⟧ φ := ⋯
            `,
              ][co]
            }
          />
        </appear.div>

        <appear.div show={t("idle desc")} className="text-4xl">
          <H>Idle</H> {CO}
          <appear.span>induction</appear.span>
        </appear.div>
        <appear.p show={t("idle desc")} className="text-2xl">
          <H>Idle</H> {CO}induction is <H>Park</H> {CO}induction where states
          that vary only over the modified <br /> variables with respect to an
          initial state {tex`\sigma_0`} need to be considered for the inductive
          invariant.
        </appear.p>
        <appear.div
          show={t("idle example A") || t("idle example B")}
          className="flex place-content-center gap-6 mb-4"
        >
          <appear.div className="rounded-xl shadow-xl bg-bg-50 p-4 w-[40ch]">
            <p className="text-2xl mb-2">
              Using <H>Park</H>-induction
            </p>
            <LeanCode
              src={`
assert P(x) ;
while ⋯
  -- \`I\` has to assert P(x)
  inv(I ∧ P(x))
{ ⋯ no assignments to x ⋯ } ;
assert P(x)
`}
            />
          </appear.div>
          <appear.div
            className="rounded-xl shadow-xl bg-bg-50 p-4 w-[60ch]"
            show={t("idle example B")}
          >
            <p className="text-2xl mb-2">
              Using <H>Idle</H>-induction
            </p>
            <LeanCode
              src={`
assert P(x) ;
while ⋯
  -- \`I\` can assume P(x) using Idle-induction
  idle-inv(I)
{ ⋯ no assignments to x ⋯ } ;
assert P(x)
`}
            />
          </appear.div>
        </appear.div>
        <appear.div show={t("idle def")}>
          <LeanCode
            src={
              [
                `
theorem IdleInduction {σ₀ : State Γ} {I : 𝔼[Γ, ENNReal]}
  -- \`I\` is an Idle-invariant
  (h : ∀ σ ∈ σ₀.EQ C.modsᶜ, Ψ[wp[O]⟦@C⟧] b φ I σ ≤ I σ) :
    wp[O]⟦while @b { @C }⟧ φ σ₀ ≤ I σ₀ := ⋯
`,
                `
theorem IdleCoinduction {σ₀ : State Γ} {I : ProbExp[Γ]}
  -- \`I\` is an Idle-coinvariant
  (h : ∀ σ ∈ σ₀.EQ C.modsᶜ, I σ ≤ Ψ[wlp[O]⟦@C⟧] b φ I σ) :
    I σ₀ ≤ wlp[O]⟦while @b { @C }⟧ φ σ₀ := ⋯
`,
              ][co]
            }
          />
        </appear.div>
        <appear.div show={t("idle comment")} className="flex justify-center">
          <div className="w-[80ch]">
            <Callout title="This required new proof methods!">
              <p className="text-xl mb-4">
                Similar proof rules as <H>Idle</H>-induction exists for
                classical PV but proofs use strongest postcondition transformers
                where{" "}
                <em>postexpectation transformers does not exist for PPs</em>{" "}
                <Cite>[Jones 1990]</Cite>.
              </p>
              <p className="text-xl">
                To the best of our knowledge this is the first proof of such a
                claim using <H>backwards reasoning</H> weakest preexpectation.
              </p>
            </Callout>
          </div>
        </appear.div>

        <appear.div
          show={t("k ind")}
          className="text-4xl flex justify-between items-center"
        >
          <span>
            Idle <H>k</H>-{CO}induciton
          </span>{" "}
          <span className="text-2xl">
            <Cite>Idle version of [Batz et al., CAV 2021]</Cite>
          </span>
        </appear.div>
        <appear.div show={t("k ind")}>
          <LeanCode
            src={
              [
                `
theorem IdleKInduction {σ₀ : State Γ} {I : 𝔼[Γ, ENNReal]} (k : ℕ)
  -- \`I\` is an Idle k-invariant
  (h : ∀ σ ∈ σ₀.EQ C.modsᶜ, Ψ[wp[O]⟦C⟧] b φ ((Ψ[wp[O]⟦C⟧] b φ · ⊓ I)^[k] I) σ ≤ I σ) :
    wp[O]⟦while b { C }⟧ φ σ₀ ≤ I σ₀ := ⋯
    `,
                `
theorem IdleKCoinduction {σ₀ : State Γ} {I : ProbExp[Γ]} (k : ℕ)
  -- \`I\` is an Idle k-coinvariant
  (h : ∀ σ ∈ σ₀.EQ C.modsᶜ, I σ ≤ Ψ[wlp[O]⟦C⟧] b φ ((Ψ[wlp[O]⟦C⟧] b φ · ⊓ I)^[k] I) σ) :
    I σ₀ ≤ wlp[O]⟦while b { C }⟧ φ σ₀ := ⋯
    `,
              ][co]
            }
          />
        </appear.div>
      </appear.div>
    </div>
  );
});

const sHeyVL = makeSlide(1, () => {
  return (
    <div className="flex justify-center flex-col items-center">
      <appear.div className="text-6xl mb-10">
        <H>Caesar</H> and <H>HeyVL</H>
      </appear.div>
    </div>
  );
});

const Cite = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) => {
  return <span className="flex-nowrap">{children}</span>;
};

const sMotivation = makeSlide(1, () => {
  return (
    <appear.div className="w-[120ch] gap-4 flex flex-col">
      <h1 className="text-5xl flex justify-between items-center">
        <H>Verification techniques for PPs</H>{" "}
        <H className="text-3xl">(highly incomplete)</H>
      </h1>
      <div>
        <h2 className="text-3xl mb-1">• Expectation-based proof calculi</h2>
        <p className="text-2xl flex flex-wrap gap-x-2 ml-10 relative">
          {/* <div className="absolute top-0 -left-4">•</div> */}
          <Cite>[Kozen 1983]</Cite>
          <Cite>[McIver & Morgan 2005]</Cite>
          <Cite>[Kaminski et al., 2018]</Cite>
          <Cite>[Batz et al., 2020-2025]</Cite>
          <Cite>[Enea et al. 2026]</Cite>
        </p>
      </div>
      <div>
        <h2 className="text-3xl mb-1">• Martingale-based proof rules</h2>
        <p className="text-2xl flex flex-wrap gap-x-2 ml-10 relative">
          <Cite>[Chakarov, Sankaranarayanan 2013]</Cite>
          <Cite>[McIver et al. 2017]</Cite>
          <Cite>[Chatterjee et al. 2025]</Cite>
          <Cite>[Takisaka et al. 2021]</Cite>
          <Cite>[Abate, Giacobbe, Roy 2025]</Cite>
        </p>
      </div>
      <div>
        <h2 className="text-3xl mb-1">• Probabilistic Program Logics</h2>
        <p className="text-2xl flex flex-wrap gap-x-2 ml-10 relative">
          <Cite>[den Hartog & de Vink 2002]</Cite>
          <Cite>[Barthe et al. 2016, 2018]</Cite>
          <Cite>[Aguirre et al. 2024]</Cite>
          <Cite>[Haselwarter et al. 2024]</Cite>
          <Cite>[Avanzini et al. 2025]</Cite>
          <Cite>[Bao et al. 2025]</Cite>
          <Cite>[Li et al. 2025]</Cite>
        </p>
      </div>
    </appear.div>
  );
});

const sRelatedWork = makeSlide(1, () => {
  return (
    <appear.div className="w-[120ch] gap-4 flex flex-col">
      <h1 className="text-5xl flex justify-between">
        <H>Related Work</H>
      </h1>
      <div>
        <h2 className="text-3xl mb-1">Related formalizations</h2>
        <p className="text-2xl flex flex-col gap-x-2 ml-6">
          <p>
            • MDPs: <Cite>[Hölzl 2017]</Cite>
          </p>
          <p>
            • Fixed point characterizations for MDPs:{" "}
            <Cite>[Schäffeler & Abdulaziz 2023]</Cite>
          </p>
          <p>
            • wp-calculi for pGCL: <Cite>[Hurd, McIver, Morgan 2005]</Cite>{" "}
            <Cite>[Cock 2012]</Cite> <Cite>[Rand & Zdancewic 2015]</Cite>
          </p>
          <p>
            • Soundness of ert-calculus wrt. MDP semantics:{" "}
            <Cite>[Hölzl 2016]</Cite>
          </p>
        </p>
      </div>
      <div>
        <h2 className="text-3xl mb-1">This work</h2>
        <p className="text-2xl flex flex-wrap gap-x-2 ml-6 relative">
          <p>
            • A deep embedding of Caesar’s intermediate verification language
            HeyVL
          </p>
          <p>
            • Soundness proofs for existing HeyVL encodings by{" "}
            <Cite>[Schröer et al. 2023]</Cite>
          </p>
          <p>
            • Improved HeyVL encoding of a proof rule for loops by{" "}
            <Cite>[Batz et al. 2021]</Cite>
          </p>
          <p>
            • Foundational weakest preexpectation calculi for pGCL with
            conditioning
          </p>
        </p>
      </div>
    </appear.div>
  );
});

const sCaesarOverview = makeSlide(6, (step) => {
  const n = {
    rules: 1,
    heyvl: 0,
    smt: 2,
    storm: 3,
    lean: 4,
    encodingLean: 5,
  };

  return (
    <div>
      <div className="fixed left-10 bottom-4 text-3xl">
        <sup>1</sup>
        <Cite>[Schröer et al. 2022]</Cite>
        <br />
        <sup>2</sup>
        <Cite>[Schröer et al. 2026]</Cite> (previous session at CAV)
      </div>
      <appear.div className="mb-10">
        <H className="text-5xl">
          Caesar<sup>1 2</sup>: A Verification Infrastructure for PPs
        </H>
      </appear.div>

      <div className="text-3xl grid grid-cols-3 gap-x-4 gap-y-2 text-center [&>*]:p-4 w-[80ch]">
        <appear.div
          from={n.rules}
          className="grid grid-rows-3 grid-flow-col gap-2 border col-span-full rounded-xl shadow-xl bg-bg-50"
        >
          <div>supermartingales</div> <div>k-induction</div> <div>...</div>
          <div>(P)AST rules</div> <div>sensitivity analysis</div> <div>...</div>
          <div>Opt. Stop. Time rules</div> <div>[Enea et al. 2026]</div>{" "}
          <div>...</div>
        </appear.div>

        <appear.div from={n.rules} className="col-start-2">
          {tex`\Downarrow`}
          <span className="absolute ml-4 text-nowrap">
            Encoding{" "}
            <appear.span
              from={n.encodingLean}
              className="bg-fg-600 text-white p-2 rounded-xl"
            >
              (formalized in Lean)
            </appear.span>
          </span>
        </appear.div>

        <appear.div
          from={n.heyvl}
          className="grid border col-span-full rounded-xl shadow-xl bg-bg-50"
        >
          Quantitative Intermediate Verification Language <br /> (HeyVL)
        </appear.div>

        <appear.div from={n.smt}>{tex`\Downarrow`}</appear.div>
        <appear.div from={n.storm}>{tex`\Downarrow`}</appear.div>
        <appear.div from={n.lean}>{tex`\Downarrow`}</appear.div>

        <appear.div
          from={n.smt}
          className="border row-start-5 rounded-xl shadow-xl bg-bg-50"
        >
          Verif. Cond. Generator <br /> (SMT)
        </appear.div>
        <appear.div
          from={n.storm}
          className="border row-start-5 rounded-xl shadow-xl bg-bg-50"
        >
          Prob. Model Checking <br /> (Storm)
        </appear.div>
        <appear.div
          from={n.lean}
          className="border row-start-5 rounded-xl shadow-xl bg-bg-50 relative flex justify-center overflow-hidden"
        >
          <div
            className={`z-0 absolute inset-0 transition ${n.encodingLean <= step ? "bg-fg-600" : ""}`}
          ></div>
          <div className={`z-10 ${n.encodingLean <= step ? "text-white" : ""}`}>
            Interactive Proofs <br /> (Lean)
          </div>
        </appear.div>
      </div>
    </div>
  );
});

const sCaesarProofRules = makeSlide(1, () => {
  const things: [string, { name: string; source: string }[]][] = [
    [
      "LPROB",
      [
        { name: "wlp + Park induction", source: "McIver & Morgan, 2005" },
        { name: "wlp + latticed k-induction", source: "Schröer, OOPSLA 2023" },
      ],
    ],

    [
      "UEXP",
      [
        { name: "wp + Park induction", source: "McIver & Morgan, 2005" },
        { name: "wp + latticed k-induction", source: "Batz et al., CAV 2021" },
      ],
    ],

    [
      "LEXP",
      [
        { name: "wp + ω-invariants", source: "Kaminski, 2019" },
        { name: "wp + Optional Stopping Theorem", source: "Hark et al., 2019" },
      ],
    ],

    ["CEXP", [{ name: "wp + conditioning", source: "Olmedo et al., 2018" }]],

    [
      "LERT",
      [
        {
          name: "ert calculus + ω-invariants",
          source: "Kaminski et al., ESOP 2016",
        },
      ],
    ],

    [
      "AST",
      [{ name: "parametric super-martingales", source: "McIver et al., 2018" }],
    ],

    [
      "PAST",
      [
        {
          name: "program analysis with martingales",
          source: "Chakarov & Sankaranarayanan, 2013",
        },
      ],
    ],

    [
      "UEXP",
      [
        {
          name: "new rule for continuous distributions",
          source: "Batz et al., 2025",
        },
      ],
    ],

    [
      "AST",
      [
        {
          name: "new rule for distributed systems",
          source: "Enea et al., 2026",
        },
      ],
    ],
  ];

  return (
    <div>
      <h1 className="text-5xl mb-10">
        <H>Proof rules that have been automated with Caesar</H>
      </h1>
      <div className="grid grid-cols-[auto_auto_auto] gap-x-8 gap-y-1 text-3xl">
        <h2>
          <H>Problem</H>
        </h2>
        <h2>
          <H>Verification Technique</H>
        </h2>
        <h2>
          <H>Source</H>
        </h2>

        {things.map(([problem, thing]) => (
          <React.Fragment>
            <div className="col-span-full mt-1 border-t"></div>
            <div
              className="col-start-1"
              style={{
                gridRow: `span ${thing.length} / span ${thing.length}`,
              }}
            >
              {problem}
            </div>
            {thing.map((t) => (
              <React.Fragment>
                <div>{t.name}</div>
                <div>[{t.source}]</div>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

const SLIDES = buildSlides([
  sIntro,
  // random walk infinite ast but ert = \infty, subtle
  s04,
  s00(
    `x := 5 ;
sum := 0 ;
while x > 0 {
  { x := x - 1 } [1/2] { x := x - 2 } ;
  sum := sum + x
}`,
    ["x", "sum"],
  ),
  s00(
    `x := 1 ; stop := 0 ;
while stop = 0 {
  { stop := 1 } [1/2] { x := x + 1 }
}`,
    ["x", "stop"],
  ),
  // caeser automated verification of ppl, related "motivation", this has been studied very heaviliy

  sMotivation,
  sCaesarOverview,
  sCaesarProofRules,

  sConnection(0, 5),

  sRelatedWork,
  // introduce mc without costs, show cylinder basis with ionesco*, add costs define expected costs, add nondet to give mdps therefor minimize ec
  // bellman, eq oec
  sC(sequenceA),
  // mdps in lean
  sMarkovChains,
  sC(sequenceB),
  // sMdp,
  // show op = lfp \eta generically
  sOMdp,
  sConnection(2, 4),
  // intro pgcl, with two semantics an operational and a denotation, show op instanciates such an mdp, and wp is eq lfp \eta, showing soundness
  // intuition of wp
  // add prob of non-term you get wlp (the lfp becomes a gfp)
  // explain non-term into cwp
  s01,
  s02,
  // park -> idle -> idle k-induct
  s00(
    `x := 1 ; stop := 0 ;
    while stop = 0 {
      { stop := 1 } [1/2] { x := x + 1 }
      }`,
    ["x", "stop"],
  ),
  sExp,
  s09,
  sExp2,
  sZoo,
  sIdle,
  sConnection(3, 5),
  // caeser deep embedding (substitution), showing Theorem 41. and 42.
  sHeyVL,
  sConnection(4, 5, <>have covered</>),
  // related work
  // conclusion

  // sA,
  // sRels,
  // s10,
  // sLean,
  //   s01,
  //   s02,
  //   s03,
  //   s05,
  //   // s00(`x := 5 ; y := x + 2`, ["x", "y"]),
  //   s055,
  //   s06,
  //   s00(`tick := 0 ;
  // fail := 0 ; sent := 0 ;
  // while sent < 4 && fail < 2 {
  //   tick := tick + 1 ;
  //   { fail := 0 ; sent := sent + 1 } [1/2]
  //   { fail := fail + 1 }
  // }`),
  //   s07,
  //   s08,
  //   s09,
  //   s85,
  //   s80,
  //   s00(`tick := 0 ;
  // fail := 0 ; sent := 0 ;
  // while sent < 4 && fail < 2 {
  //   tick := tick + 1 ;
  //   { fail := 0 ; sent := sent + 1 } [1/2]
  //   { fail := fail + 1 }
  // }`),
  s90,
]);

export const App = () => {
  const base = useSlidesBase(SLIDES);

  return (
    <SlidesContext.Provider value={base}>
      <SlideShow />
    </SlidesContext.Provider>
  );
};

const SlideShow = () => {
  const { currentSlideIndex, currentSlide, totalSlides, step } = useSlide();

  const CurrentSlide = currentSlide.render;

  return (
    <>
      <div className="bg-white w-screen h-screen grid place-items-center text-fg-900 font-katex overflow-hidden">
        <div className="grid place-items-center gap-10">
          <LayoutGroup>
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              // exit={{ opacity: 0 }}
              // layout="position"
            >
              <CurrentSlide step={step} />
            </motion.div>
          </LayoutGroup>
          {/* <div className="text-7xl">{text`\\H{Op}erational semantics`}</div> */}
          {/* <div className="text-7xl">
      {text`\\H{M}arkov \\H{D}ecision \\H{P}rocesses`}
    </div> */}
          {/* {operationalSemantics.map((tex) => (
      <div className="text-lg">{tex}</div>
    ))} */}
          {/* <div className="text-3xl">{tex`\\op : \\State \\to \\Set{(\\Act \\times \\State \\times \\ENNReal)}`}</div>
    <div className="text-3xl">{tex`\\P : \\State \\to \\Act \\to \\State \\to \\ENNReal`}</div>
    <div className="text-3xl">{tex`\\P : \\State \\to \\Act \\to \\Dist \\State`}</div>
    <div className="text-3xl">{tex`\\act : \\State \\to \\Set{\\Act}`}</div>
    <div className="text-3xl">{tex`\\succs : \\State \\to \\Act  \\to \\Set{\\State}`}</div>
    <div className="text-3xl">{tex`\\P(s, \\alpha)(s') = \\sum_{(s',\\: p) \\:\\in\\: \\op(s,\\: \\alpha)} p`}</div>
    <div className="text-3xl">{tex`\\act(s) = \\{ \\alpha \\mid \\exists s'. P(s,\\alpha)(s') > 0 \\}`}</div>
    <div className="text-3xl">{tex`\\succs(s, \\alpha) = \\{ s' \\mid P(s, \\alpha)(s') > 0 \\} = \\supp{P(s, \\alpha)}`}</div> */}
        </div>
      </div>
      <div className="fixed bottom-4 right-6 font-katex text-3xl text-fg-700/50">
        {currentSlideIndex + 1}
      </div>
      <div
        className="fixed bottom-0 h-2 bg-fg-300 left-0 transition-all"
        style={{
          width: (step / (currentSlide.steps - 1)) * 100 + "%",
        }}
      ></div>
      <div
        className="fixed bottom-0 h-1 bg-fg-500 left-0 transition-all"
        style={{
          width: (currentSlideIndex / (totalSlides - 1)) * 100 + "%",
          // width: (globalStep / (totalSteps - 1)) * 100 + "%",
        }}
      ></div>
    </>
  );
};
