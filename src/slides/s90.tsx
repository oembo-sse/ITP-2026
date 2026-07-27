import { AnimatePresence } from "framer-motion";
import { makeSlide } from "../hooks";
import { appear, useSlide } from "../slides";

import DTU from "../assets/DTU2.png";
import OLDENBURG from "../assets/oldenburg.svg";
import { H } from "../common";
import { Sponsors } from "./sIntro";

export const s90 = makeSlide(1, () => {
  const { step } = useSlide();
  return (
    <div className="flex justify-center flex-col items-center">
      <AnimatePresence>
        <appear.div>
          <H className="text-8xl mt-48">The end</H>
        </appear.div>
        {/* <ul className="text-3xl list-disc list-inside w-96">
          <AnimatePresence>
            {points.map((point, idx) => (
              <appear.li key={idx} from={idx + 1}>
                {point}
              </appear.li>
            ))}
          </AnimatePresence>
        </ul> */}
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
      </AnimatePresence>
    </div>
  );
});
