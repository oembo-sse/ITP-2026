import { makeSlide } from "../hooks";
import { appear } from "../slides";
import { Callout, H } from "../common";
import { LeanCode } from "../CodeEditor";

type Part =
  | "def"
  | "path"
  | "inf path"
  | "pref"
  | "cyl"
  | "path pmf"
  | "path measure"
  | "mathlib"
  | "Pr_cyl"
  | "observation"
  | "embed"
  | "measure cyl"
  | "lifted";
const steps: Part[][] = [
  ["def"],
  ["def", "path", "inf path"],
  ["def", "path", "inf path", "pref", "cyl"],
  ["path pmf"],
  ["path pmf", "path measure"],
  ["path pmf", "path measure", "mathlib"],
  ["path pmf", "path measure", "mathlib", "lifted"],
  ["path pmf", "path measure", "mathlib", "lifted", "embed"],
  ["path pmf", "path measure", "mathlib", "lifted", "embed", "measure cyl"],
  [
    "path pmf",
    "path measure",
    "mathlib",
    "lifted",
    "embed",
    "measure cyl",
    "Pr_cyl",
  ],
  [
    "path pmf",
    "path measure",
    "mathlib",
    "lifted",
    "embed",
    "measure cyl",
    "Pr_cyl",
    "observation",
  ],
];

export const sMarkovChains = makeSlide(steps.length, (step) => {
  const t = (p: Part): boolean => (steps[step] ?? []).includes(p);

  return (
    <div className="flex justify-center flex-col">
      <appear.div className="text-6xl mb-10 text-center">
        <H>Markov Chain in Lean</H>
      </appear.div>
      <appear.div className="flex flex-col gap-4">
        <appear.div show={t("def")} className="text-4xl">
          Core definitions
        </appear.div>
        <appear.div show={t("def")}>
          <LeanCode
            src={`
structure MarkovChain (State : Type*) where
  P : State → PMF State
`}
          />
        </appear.div>
        <appear.div show={t("path")}>
          <LeanCode
            src={`
structure Path (M : MarkovChain State) where
  states : List State
  nonempty : states ≠ []
  property : ∀ i, i + 1 < states.length → M.P states[i] states[i + 1] ≠ 0
`}
          />
        </appear.div>
        <appear.div show={t("inf path")}>
          <LeanCode
            src={`
structure InfPath (M : MarkovChain State) where
  states : Stream' State
  property : ∀ i, M.P (states i) (states (i + 1)) ≠ 0
`}
          />
        </appear.div>
        <appear.div show={t("cyl")} className="text-4xl">
          Path cylinders
        </appear.div>
        <appear.div show={t("cyl")}>
          <LeanCode
            src={`
/-- All finite prefixes of an infinite path. -/
def InfPath.pref (π' : M.InfPath) : Set M.Path := Set.range π'.take
`}
          />
        </appear.div>
        <appear.div show={t("cyl")}>
          <LeanCode
            src={`
/-- Cylinder set of π (all infinite paths with prefix π) as per [Baier & Katoen 2008]. -/
def Path.Cyl (π : M.Path) : Set M.InfPath := {π' | π ∈ π'.pref}
`}
          />
        </appear.div>
        <appear.div show={t("path pmf")} className="text-4xl">
          Measure theoretic connection
        </appear.div>
        <appear.div show={t("path pmf")}>
          <LeanCode
            src={`
/-- Dependent PMF over successors of finite paths. -/
def Path.pmf (π : M.Path) : PMF π.succs := ⋯
`}
          />
        </appear.div>
        <appear.div show={t("path measure")}>
          <LeanCode
            src={`
/-- Dependent measure over successors of finite paths. -/
def Path.measure (π : M.Path) : Measure π.succs := π.pmf.toMeasure
`}
          />
        </appear.div>
        <appear.div
          show={t("mathlib")}
          className="flex relative rounded-xl shadow-xl justify-center flex-col items-center -mx-3 px-3 border pt-5 pb-2 mt-4 mb-2 bg-bg-50"
        >
          <div className="absolute -top-3 border left-1 text-lg font-mono bg-bg-50 rounded px-3">
            Mathlib/Probability/ProductMeasure.lean
          </div>
          <LeanCode
            src={`
/-- Ionescu-Tuclea theorem from mathlib. -/
def infinitePi (μ : (i : ι) → Measure (X i)) : Measure (Π i, X i) := ⋯
`}
          />
          <LeanCode
            src={`
/-- Measure theoretic cylinders from mathlib. -/
def cylinder (s : Finset ι) (S : Set ((i : ↥s) → α i)) : Set ((i : ι) → α i) := ⋯
`}
          />
          <LeanCode
            src={`
/-- Measure of cylinders from mathlib. -/
theorem infinitePi_cylinder : infinitePi μ (cylinder s S) = Measure.pi μ S := ⋯
`}
          />
        </appear.div>
        <appear.div show={t("lifted")}>
          <LeanCode
            src={`
/-- Measure over dependent finite path successors. -/
def Path.lifted : Measure ((π : M.Path) → π.succs) := Measure.infinitePi Path.measure
`}
          />
        </appear.div>
        <appear.div show={t("embed")}>
          <LeanCode
            src={`
/-- Embed dependent finite path successors into infinite pahts. -/
def embed (f : (π : M.Path) → π.succs) : M.InfPath := ⋯
`}
          />
        </appear.div>
        <appear.div show={t("measure cyl")}>
          <LeanCode
            src={`
/-- Measure over infinite paths. -/
def Pr : Measure M.InfPath := Measure.map Path.lifted embed
`}
          />
        </appear.div>
        <appear.div show={t("Pr_cyl")}>
          <LeanCode
            src={`
/-- The probability of a cylinder is the probability of its generating finite prefix. -/
theorem Pr_cyl (π : M.Path) : Pr π.Cyl = π.Pr := ⋯
`}
          />
          {/* <LeanCode
            src={`
/-- The probability of a cylinder is the probability of its generating finite prefix. -/
theorem Pr_cyl (π : M.Path) : Pr π.Cyl = ∏ i : Fin (‖π‖ - 1), M.P π[i] π[i + 1] := ⋯
`}
          /> */}
        </appear.div>
        <appear.div
          show={t("observation")}
          className="flex justify-center mt-10"
        >
          <Callout title="Observation!">
            <p className="text-2xl">
              It is sufficient to consider longer and longer <em>finite</em>{" "}
              prefixes of infinite paths.
            </p>
          </Callout>
        </appear.div>
      </appear.div>
    </div>
  );
});
