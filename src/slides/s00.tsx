import { AnimatePresence, motion } from "framer-motion";
import { makeSlide } from "../hooks";
import * as pgcl from "pgcl";
import { RenderTree, useInterval } from "../Tree";
import { useMemo, useState } from "react";
import { tex } from "../Katex";
import { CodeEditor } from "../CodeEditor";

export const s00 = (
  initialProgram: string,
  initialExprs: [string, string] = ["sent", "tick"],
) =>
  makeSlide(1, () => {
    const [src, setSrc] = useState(
      // "x := 2 ; while x > 0 { { x := x - 1 } [1/2] { skip } }"
      // "x := 2 ; y := 3 ;\nwhile x > 0 && y > 0 {\n  { x := x - 1 } [1/2] { y := y - 1 }\n}"
      //     `x := 5 ; y := 3 ;
      // while x > 0 && y > 0 {
      //   { x := x - 1 } [1/2] { y := y - 1 }
      // }`
      //     `tick := 0 ;
      // fail := 0 ; sent := 0 ;
      // while sent < 4 && fail < 2 {
      //   tick := tick + 1 ;
      //   { fail := 0 ; sent := sent + 1 } [1/2]
      //   { fail := fail + 1 }
      // }`
      initialProgram,
    );

    const [_file, exe] = useMemo((): [
      pgcl.File | null,
      pgcl.Execution | null,
    ] => {
      const file = pgcl.parse(src);
      if (file) {
        return [file, pgcl.Execution.from_file(file)];
      } else {
        return [null, null];
      }
    }, [src]);

    const [smallTree, setSmallTree] = useState(exe?.tree() ?? null);

    useInterval(
      () => {
        console.time("grow");
        exe?.grow_all(50);
        console.timeEnd("grow");
        console.time("tree");
        setSmallTree(exe?.tree() ?? null);
        console.timeEnd("tree");
      },
      100,
      [exe],
    );

    return (
      <div className="grid grid-cols-2 w-full">
        {/* <AnimatePresence> */}
        {/* <div className="border rounded"> */}
        <div className="flex items-center flex-col justify-center">
          <div className="shadow rounded-xl text-xl">
            <CodeEditor src={src} setSrc={setSrc}></CodeEditor>
          </div>
          <div className="grid gap-1 grid-cols-2 w-full">
            <Samples initalExpr={initialExprs[0]} exe={exe} tree={smallTree} />
            <Samples initalExpr={initialExprs[1]} exe={exe} tree={smallTree} />
          </div>
        </div>
        {smallTree && (
          <RenderTree
            mode=""
            tree={smallTree}
            onClick={(e) => {
              // setTree((t) => (t ? pgcl.grow_at(t, e[e.length - 1]) : t));
            }}
            renderNode={(d) => (
              <div className="p-2 bg-white border rounded text-2xl">{tex`${exe?.data(
                d,
              )}`}</div>
            )}
          />
        )}
        {/* </div> */}
        {/* </AnimatePresence> */}
      </div>
    );
  });

const Samples = ({
  initalExpr,
  exe,
  tree,
}: {
  initalExpr: string;
  exe: pgcl.Execution | null;
  tree: pgcl.SmallExecutionTree | null;
}) => {
  const [expr, setExpr] = useState(initalExpr);

  const { samples, weights } = useMemo(
    () => (exe ? exe.sample(expr) : { samples: [], weights: [] }),
    [expr, exe, tree],
  );

  return (
    <div className="flex min-w-96 w-full flex-1 h-96 bg-bg-50 p-1 rounded flex-col gap-1">
      <input
        className="text-xl p-2 font-mono rounded"
        value={expr}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        onChange={(e) => {
          setExpr(e.target.value);
        }}
      />
      <Histogram samples={samples} weights={weights} />
    </div>
  );
};

const Histogram = ({
  samples,
  weights,
}: {
  samples: number[];
  weights?: number[];
}) => {
  if (samples.length === 0) {
    return null;
  }

  samples = samples.map((s) => s);

  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const w = weights?.[i] ?? 1;
    if (w === 0) continue;

    min = Math.min(min, s);
    max = Math.max(max, s);
  }

  if (min == Infinity) {
    return null;
  }

  let numBins = Math.floor(Math.cbrt(samples.length) || 1) * 2;
  let binWidth = (max - min) / numBins;
  let just = samples.every(Number.isSafeInteger) || samples.length < 1000;

  if (just) {
    numBins = max - min + 1;
    binWidth = 1;
  }

  numBins = Math.floor(numBins);

  const bins = Array(numBins + (just ? 0 : 1)).fill(0);

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const w = weights?.[i] ?? 1;
    if (w === 0) continue;
    const bin = Math.floor((s - min) / binWidth);
    bins[bin] += w;
  }

  const maxBin = Math.max(...bins);

  const weightedMean = samples.reduce(
    (a, b, i) => a + b * (weights?.[i] ?? 1),
    0,
  );

  return (
    <div className="flex gap-1 flex-1 -scale-y-100 relative">
      <div className="-scale-y-100 absolute right-0 bottom-0">
        {+weightedMean.toFixed(2)}
      </div>
      <AnimatePresence>
        {bins
          .map((b, i) => [b, i + min] as const)
          .filter((b) => !(bins.length > 20) || b[0] > 0)
          .map(([b, i]) => (
            <motion.div className="flex-1 flex flex-col" key={i} layout>
              <div className="-scale-y-100 bg-fg-300 gird place-items-center text-center font-mono text-sm py-0.5">
                {just
                  ? i
                  : `${+(i * binWidth).toFixed(2)}-${+(
                      (i + 1) *
                      binWidth
                    ).toFixed(2)}`}
              </div>
              <motion.div className="relative flex flex-1">
                <motion.div
                  className="bg-fg-600 flex-1 rounded-b"
                  initial={{ height: 0 }}
                  animate={{ height: `${(b / maxBin) * 100}%` }}
                ></motion.div>
              </motion.div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
};
