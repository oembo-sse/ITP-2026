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
import { sC } from "./slides/sC";
import { sRels } from "./slides/sRels";
import { sLean } from "./slides/sLean";
import { H } from "./common";
import { tex } from "./Katex";
import { s02 } from "./slides/s02";
import { s09, sZoo, sZooSoundness } from "./slides/s09";
import { sMdp } from "./slides/sMdp";
import { sOMdp } from "./slides/sOMdp";

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
      pGCL_wp: 4 - start,
      HeyVL: 5 - start,
      MDP: 1 - start,
      MC: 2 - start,
    };

    return (
      <div className="flex justify-center flex-col items-center">
        <appear.div className="text-6xl mb-10">
          <H>What we {word}</H>
        </appear.div>
        <div className="grid gap-2 text-center grid-cols-[repeat(9,auto)] items-center">
          <div>
            <Domain from={n.MC}>Markov Chain</Domain>
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

const sIdle = makeSlide(1, () => {
  return (
    <div className="flex justify-center flex-col items-center">
      <appear.div className="text-6xl mb-10">
        <H>Idle</H> k-(co)induction
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

const SLIDES = buildSlides([
  sIntro,
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
  sConnection(0, 6),
  sC,
  sMdp,
  sConnection(2, 5),
  s01,
  s02,
  s00(
    `x := 1 ; stop := 0 ;
    while stop = 0 {
      { stop := 1 } [1/2] { x := x + 1 }
      }`,
    ["x", "stop"],
  ),
  sOMdp,
  s09,
  sZoo,
  sZooSoundness,
  sIdle,
  sConnection(4, 6),
  sHeyVL,
  sConnection(5, 6, <>have covered</>),

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
