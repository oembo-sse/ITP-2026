import { makeSlide } from "../hooks";
import { appear, useSlide } from "../slides";
import { H } from "../common";
import { LeanCode } from "../CodeEditor";
import { identities } from "../semantics";

export const sOMdp = makeSlide(1, () => {
  const { step } = useSlide();

  return (
    <div className="flex justify-center flex-col items-center">
      <appear.div className="text-6xl mb-10">
        <H>Induced Operational MDP</H>
      </appear.div>

      <LeanCode src={identities.op_def} />
      <LeanCode src={identities.ξ_def} />
    </div>
  );
});
