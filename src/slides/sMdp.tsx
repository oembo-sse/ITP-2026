import { makeSlide } from "../hooks";
import { appear, useSlide } from "../slides";
import { H } from "../common";
import { LeanCode } from "../CodeEditor";
import { identities } from "../semantics";

export const sMdp = makeSlide(1, () => {
  const { step } = useSlide();

  return (
    <div className="flex justify-center flex-col items-center">
      <appear.div className="text-6xl mb-10">
        <H>MDPs in Lean</H>
      </appear.div>
      <LeanCode
        src={`structure MDP (State Act : Type*) where
  P : State → Act → Option (PMF State)
  exists_P_isSome s : ∃ α, (P s α).isSome
`}
      />

      <LeanCode src={identities.opt_def} />
      <LeanCode src={identities.expectation_def} />
      <LeanCode src={identities.EC_def} />
      <LeanCode src={identities.OEC_ang_def} />
      <LeanCode src={identities.OEC_dem_def} />
      <LeanCode src={identities.Φ_ang_def} />
      <LeanCode src={identities.Φ_dem_def} />
      <LeanCode src={identities.lfp_Φ_dem} />

      <LeanCode src={identities.lfp_Φ_dem} />
    </div>
  );
});
