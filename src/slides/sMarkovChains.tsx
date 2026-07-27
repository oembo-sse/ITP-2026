import { makeSlide } from "../hooks";
import { appear } from "../slides";
import { H } from "../common";
import { LeanCode } from "../CodeEditor";

export const sMarkovChains = makeSlide(1, () => {
  return (
    <div className="flex justify-center flex-col items-center">
      <appear.div className="text-6xl mb-10">
        <H>Markov Chain in Lean</H>
      </appear.div>
      <LeanCode
        src={`
structure MarkovChain (State : Type*) where
  ι : State
  P : State → PMF State
`}
      />
      <LeanCode
        src={`
structure Path (M : MarkovChain State) where
  states : List State
  nonempty : states ≠ []
  initial : states[0] = M.ι
  property : ∀ i, (h : i + 1 < states.length) → M.P states[i] states[i + 1] ≠ 0
`}
      />
      <LeanCode
        src={`
structure InfPath (M : MarkovChain State) where
  states : Stream' State
  initial : states 0 = M.ι
  property : ∀ i, M.P (states i) (states (i + 1)) ≠ 0
`}
      />
      <LeanCode
        src={`
/-- All finite prefixes of an infinite path. -/
def InfPath.pref (π' : M.InfPath) : Set M.Path := Set.range π'.take
/-- Cylinder set of π (all infinite paths with prefix π) as per [Baier & Katoen 2008]. -/
def Path.Cyl (π : M.Path) : Set M.InfPath := {π' | π ∈ π'.pref}
`}
      />
      <LeanCode
        src={`
/-- Dependent measure over successors of finite paths. -/
def Path.measure (π : M.Path) : Measure π.succs := π.pmf.toMeasure
`}
      />
      <div className="flex relative rounded justify-center flex-col items-center -mx-2 px-2 border pt-5 pb-2 mt-4 mb-2">
        <div className="absolute -top-3 border left-2 text-lg font-mono bg-white rounded px-2">
          mathlib/Mathlib/Probability/ProductMeasure.lean
        </div>
        <LeanCode
          src={`
/-- Ionescu-Tuclea theorem from mathlib. -/
def infinitePi (μ : (i : ι) → Measure (X i)) : Measure (Π i, X i) := ⋯
`}
        />
        <LeanCode
          src={`
/-- Measure theoredic cylinders from mathlib. -/
def cylinder (s : Finset ι) (S : Set ((i : ↥s) → α i)) : Set ((i : ι) → α i) := ⋯
`}
        />
        <LeanCode
          src={`
/-- Measure of cylinders from mathlib. -/
theorem infinitePi_cylinder : infinitePi μ (cylinder s S) = Measure.pi μ S := ⋯
`}
        />
      </div>

      <LeanCode
        src={`
/-- The probability of a cylinder is the probability of its generating finite prefix. -/
theorem Pr_cyl (π : M.Path) : Pr π.Cyl = ∏ i : Fin (‖π‖ - 1), M.P π[i] π[i + 1] := ⋯
`}
      />
    </div>
  );
});
