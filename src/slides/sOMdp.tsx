import { makeSlide } from "../hooks";
import { appear, useSlide } from "../slides";
import { H } from "../common";
import { LeanCode } from "../CodeEditor";
import { identities } from "../semantics";

type Part =
  | "mdp def"
  | "ec"
  | "small step class"
  | "def op"
  | "def ξ"
  | "op eq lfp ξ";
const steps: Part[][] = [
  //
  ["mdp def"],
  ["mdp def", "ec"],
  ["mdp def", "ec", "small step class"],
  ["mdp def", "ec", "small step class", "def op"],
  ["mdp def", "ec", "small step class", "def op", "def ξ"],
  ["mdp def", "ec", "small step class", "def op", "def ξ", "op eq lfp ξ"],
];

export const sOMdp = makeSlide(steps.length, (step) => {
  const t = (p: Part): boolean => (steps[step] ?? []).includes(p);

  return (
    <div className="flex justify-center flex-col items-center">
      <appear.div className="text-6xl mb-10">
        <H>Operational MDP</H>
      </appear.div>
      <appear.div className="flex flex-col gap-4">
        <appear.div show={t("mdp def")} className="text-4xl">
          Markov Decision Processes
        </appear.div>
        <appear.div show={t("mdp def")}>
          <LeanCode
            src={`
structure MDP (State Act : Type*) where
  P : State → Act → Option (PMF State)
  exists_P_isSome s : ∃ α, (P s α).isSome
`}
          />
        </appear.div>
        <appear.div show={t("ec")}>
          <LeanCode src={identities.EC_def} />
        </appear.div>
        <appear.div show={t("small step class")} className="text-4xl">
          Generic small step semantics
        </appear.div>
        <appear.div show={t("small step class")}>
          <LeanCode
            src={`
inductive Conf (P S T : Type*) where
  | term (t : T) (σ : S)
  | prog (P : P) (σ : S)
  | bot
`}
          />
        </appear.div>
        <appear.div show={t("small step class")}>
          <LeanCode
            src={`
class SmallStepSemantics (P S T A : Type*) [Nonempty A] where
  r : P × S → A → ENNReal → (P ⊕ T) × S → Prop
  relation_p_pos : ∀ {c α p c'}, r c α p c' → ¬p = 0
  succs_sum_to_one : ∀ {c α p₀ c'}, r c α p₀ c' → ∑' (p : { p | r c α p b }), p.val = 1
  progress : ∀ s, ∃ p a x, r s a p x

  cost_p : P × S → ENNReal
  cost_t : 𝔼[S] →o T × S → ENNReal
`}
          />
        </appear.div>
        <appear.div show={t("def op")} className="text-4xl">
          Expectation transformer
        </appear.div>
        <appear.div show={t("def op")}>
          <LeanCode
            src={`
/-- Total expected cost phrased as an expectation transformer. -/
${identities.op_def}`}
          />
        </appear.div>
        <appear.div show={t("def ξ")}>
          <LeanCode
            src={`
/-- The higher-order Bellman operator. -/
${identities.ξ_def}`}
          />
        </appear.div>
        <appear.div show={t("op eq lfp ξ")}>
          <LeanCode
            src={`
theorem op_eq_lfp_ξ : op[O] = lfp ξ[O] :=
  le_antisymm (le_lfp _ op_isLeast) (lfp_le _ ξ_op_le_op)
            `}
          />
        </appear.div>
      </appear.div>
    </div>
  );
});
