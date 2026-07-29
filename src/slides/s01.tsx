import { AnimatePresence, motion } from "framer-motion";
import { makeSlide } from "../hooks";
import { appear, useSlide } from "../slides";
import { grammar } from "../semantics";
import { tex, text } from "../Katex";
import React from "react";

const steps = [
  <>
    <div className="flex justify-center flex-col items-center gap-4">
      <div className="text-3xl">{grammar[0]}</div>
    </div>
    <div className="flex justify-center flex-col items-center gap-4">
      <div className="text-3xl text-center">
        {tex`A`} is an arbitrary {tex`\\Expr`}, <br /> {tex`p`} is an{" "}
        {tex`\\Expr`} bounded by 0 and 1, <br />
        {tex`B`} is a Boolean predicate.
      </div>
    </div>
  </>,
];

export const s01 = makeSlide(steps.length + 2, () => {
  const { step } = useSlide();
  return (
    <div className="flex justify-center flex-col items-center gap-10">
      <AnimatePresence>
        <appear.div>
          <div className="text-7xl inline-flex whitespace-pre">
            <AnimatePresence>
              <motion.span layout key={1}>
                The{" "}
                <span className={step >= 1 ? "transition text-fg-600" : ""}>
                  p
                </span>
              </motion.span>{" "}
              <appear.span key={2} from={0} to={1} exit scale>
                robabilistic{" "}
              </appear.span>{" "}
              <motion.span key={3} layout>
                <span className={step >= 1 ? "transition text-fg-600" : ""}>
                  GCL
                </span>{" "}
                language
              </motion.span>
            </AnimatePresence>
          </div>
        </appear.div>
        {steps.slice(0, step).map((s, idx) => {
          const delta = step - (idx + 2);
          const sf = typeof s == "function" ? s(delta) : s;
          return (
            <React.Fragment key={idx}>
              {sf && (
                <appear.div
                  key={idx}
                  from={idx + 2}
                  className={idx + 2 == step ? "mt-10 mb-32" : ""}
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
