import { AnimatePresence } from "framer-motion";
import { makeSlide } from "../hooks";
import { appear } from "../slides";

import { H } from "../common";
import { Sponsors } from "./sIntro";

const points = [
  <span>Support infinite branching</span>,
  <span>Extend to weighted programming</span>,
];

export const s90 = makeSlide(points.length + 2, () => {
  return (
    <div className="flex justify-center flex-col items-center">
      <AnimatePresence>
        <appear.div>
          <H className="text-8xl mt-48">Future work</H>
        </appear.div>
        <ul className="text-3xl list-disc mt-4 list-inside w-[40ch]">
          {points.map((point, idx) => (
            <appear.li key={idx} from={idx + 1}>
              {point}
            </appear.li>
          ))}
        </ul>
        <appear.div
          from={points.length + 1}
          exit
          className="text-4xl mt-32 flex gap-8"
        >
          <span>
            Oliver Emil Bøving<sup>1</sup>
          </span>
          <span>
            Christoph Matheja<sup>2,1</sup>
          </span>
        </appear.div>
        <appear.div from={points.length + 1} exit className="text-3xl mt-16">
          <div>
            <sup>1</sup>: Technical University of Denmark, Lyngby, Denmark
          </div>
          <div>
            <sup>2</sup>: University of Oldenburg, Germany
          </div>
        </appear.div>
        <appear.div
          from={points.length + 1}
          className="text-3xl mt-10 text-center"
        >
          Funded by DFF project AuRoRA
        </appear.div>
        <appear.div from={points.length + 1}>
          <Sponsors />
        </appear.div>
      </AnimatePresence>
    </div>
  );
});
