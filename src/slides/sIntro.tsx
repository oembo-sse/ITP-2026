import colors from "tailwindcss/colors";
import { color, motion } from "framer-motion";
import { tex } from "../Katex";
import { makeSlide } from "../hooks";
import { appear, useSlide } from "../slides";
import { H } from "../common";

import DTU from "../assets/DTU2.png";
import OLDENBURG from "../assets/oldenburg.svg";
import DFF from "../assets/dff-logo.png";
import React from "react";
import { Network, rewardNode } from "../Network";
import { s, s1, s2 } from "../nodes";

const variants = {
  InfSSup: tex`\iInf_{\McS \mem \MfS} ~ \iSup_{n \mem \Nat} ~ \EC{n}{\McS}`,
  SupInfS: tex`\iSup_{n \mem \Nat} ~ \iInf_{\McS \mem \MfS} ~ \EC{n}{\McS}`,
  InfLSup: tex`\iInf_{\McL \mem \MfL} ~ \iSup_{n \mem \Nat} ~ \EC{n}{\McL}`,
  SupInfL: tex`\iSup_{n \mem \Nat} ~ \iInf_{\McL \mem \MfL} ~ \EC{n}{\McL}`,
  SupSSup: tex`\iSup_{\McS \mem \MfS} ~ \iSup_{n \mem \Nat} ~ \EC{n}{\McS}`,
  SupSupS: tex`\iSup_{n \mem \Nat} ~ \iSup_{\McS \mem \MfS} ~ \EC{n}{\McS}`,
};

const lexicon = [
  { symbol: `\\McS`, description: "Deterministic scheduler with memory" },
  { symbol: `\\McL`, description: "Deterministic memoryless scheduler" },
];

const eqFin = tex`=^{\tiny f}`;

export const Sponsors = () => (
  <appear.div className="flex gap-10 items-center">
    <appear.img src={DTU} className="w-12 mt-10" />
    <appear.img src={OLDENBURG} className="w-32 mt-10" />
    <appear.img src={DFF} className="w-32 mt-10" />
  </appear.div>
);

export const sIntro = makeSlide(1, () => {
  const { step } = useSlide();

  return (
    <div className="flex justify-center flex-col items-center">
      <appear.div to={1} exit className="text-8xl mb-12 text-center">
        <H>
          Securing the Foundations of an Intermediate Language for Probabilistic
          Program Verification
        </H>
      </appear.div>
      {/* <appear.div from={2} className="text-4xl ml-10 mb-10 place-self-start">
        The main <H>theorem</H> says that the <H>expected reward</H> is equal to
        the <H>weakest pre-expectation</H>.
      </appear.div> */}
      {/* <motion.div layout className={step == 0 ? "text-5xl" : "text-6xl"}>
        {tex`\iInf_{\McS \mem \MfS} \iSup_{n \mem \N} \EC{n}{\McS}(\state{C}{\sigma}) = \wp{C}{X}(\sigma)`}
      </motion.div> */}
      <appear.div from={2} className="text-5xl mt-10 italic">
        The <H className="not-italic">expected reward</H> is equal to the{" "}
        <H className="not-italic">weakest pre-expectation</H>.
      </appear.div>
      <appear.div to={1} exit className="text-5xl mt-32 flex gap-8">
        <span>
          Oliver Emil Bøving<sup>1</sup>
        </span>
        <span>
          Christoph Matheja<sup>2,1</sup>
        </span>
      </appear.div>
      <appear.div to={1} exit className="text-4xl mt-32">
        <div>
          <sup>1</sup>: Technical University of Denmark, Lyngby, Denmark
        </div>
        <div>
          <sup>2</sup>: University of Oldenburg, Germany
        </div>
      </appear.div>
      <appear.div to={1} exit className="text-3xl mt-10 text-center">
        Funded by DFF project AuRoRA
      </appear.div>
      <Sponsors />
    </div>
  );
});
