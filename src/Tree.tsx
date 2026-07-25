import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import React from "react";
import {
  FloatingPortal,
  flip,
  offset,
  shift,
  useFloating,
  useHover,
  useInteractions,
} from "@floating-ui/react";

// type TreeSrc = number | [unknown] | [unknown, TreeSrc[], unknown?];

// const parseTree = (s: string): Tree<ReactNode> => {
//   const data = JSON.parse(s) as TreeSrc;
//   const fix = (s: TreeSrc): Tree<ReactNode> => {
//     if (typeof s == "number")
//       return {
//         key: s + "",
//         modifier: void 0,
//         data: <></>,
//       };
//     else
//       return {
//         key: s[0] + "",
//         data: <></>,
//         modifier: s[2],
//         children: s.length > 1 ? s[1]?.map(fix) : [],
//       };
//   };
//   return fix(data);
// };

// export const InstanceTree = ({ instance }: { instance: FileInstace }) => (
//   <AnimatePresence>
//     {instance && instance.opts.tree && (
//       <motion.div
//         key="tree"
//         layoutId="tree"
//         className="-mx-20"
//         layout
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//       >
//         <RenderTree
//           tree={parseTree(instance.opts.tree)}
//           mode={instance.opts.treeMode ?? ""}
//         />
//       </motion.div>
//     )}
//   </AnimatePresence>
// );

type Tree<T> = {
  key: string;
  data: T;
  modifier: unknown;
  children?: Tree<T>[];
};

type TreeNode<T> = {
  id: number;
  key: string;
  data: T;
  path: string;
  modifier: unknown;
  parent?: number;
  children: number[];
  mod: number;
  x: number;
  width: number;
  y: number;
};

function buildTree<T>(
  tree: Tree<T>,
  id: number,
  parent?: number,
): TreeNode<T>[] {
  let curIdx = id + 1;
  let curX = 1;

  const children: number[] = [];
  const rest =
    tree.children?.flatMap((x, nc) => {
      const next = buildTree(x, curIdx, id);
      children.push(next[0].id);
      curIdx += next.length;
      curX += Math.max(...next.map((n) => n.x + nc));

      return next.map((n) => {
        const x = n.id;
        return { ...n, x, y: n.y + 1 };
      });
    }) ?? [];

  return [
    {
      id,
      parent,
      key: tree.key,
      data: tree.data,
      modifier: tree.modifier,
      path: tree.key,
      children: children.map((c) => c),
      mod: 0,
      x: 0,
      width: 1,
      y: 0,
    },
    ...rest,
  ];
}

// function treeNodeToTree<T>(root: Tree<T>, t: TreeNode<T>) {
//   return t.path
//     .split("~")
//     .slice(1)
//     .reduce((n, seg) => n.children?.find((c) => c.key == seg)!, root);
// }

function hasMarked<T>(t: TreeNode<T>[], id: number): boolean {
  return (
    t[id].modifier == "mark" || !!t[id].children.find((c) => hasMarked(t, c))
  );
}

function hasMarkedParent<T>(t: TreeNode<T>[], id: number): boolean {
  return (
    t[id].modifier == "mark" ||
    (typeof t[id].parent == "number" && hasMarkedParent(t, t[id].parent!))
  );
}

// function isParentOf<T>(t: TreeNode<T>[], id: number, target: number): boolean {
//   return id == target || !!t[id].children.find((c) => isParentOf(t, c, target));
// }
// function isChildOf<T>(t: TreeNode<T>[], id: number, target: number): boolean {
//   return (
//     id == target ||
//     (typeof t[id].parent == "number" && isChildOf(t, t[id].parent!, target))
//   );
// }

const WIDTH = 10;
const HEIGHT = 10 / 10;
const WIDTH_GAP = WIDTH + 5;
const HEIGHT_GAP = HEIGHT + 3;

type Mode =
  | ""
  | "auto-unfold"
  | "root-to-mark"
  | "cover-to-mark"
  | "requires"
  | "leafs"
  | "auto-fold";

export function RenderTree<T>({
  tree: initialTree,
  mode,
  onClick,
  renderNode,
}: {
  tree: Tree<T>;
  mode: Mode;
  onClick?: (key: string[], data: T) => void;
  renderNode?: (data: T, opts: { isOpen: boolean }) => ReactNode;
}) {
  const [tree, setTree] = useState(initialTree);
  const [_foldings, setFoldings] = useState<boolean[]>([]);

  useEffect(() => {
    setTree(initialTree);
    setFoldings([]);
  }, [initialTree]);

  // const d = Array.from({ length: 1000 }).reduce(
  //   (n: TreeNode[]) => iter(n),
  //   layout(buildTree(tree, 0))
  // );
  const cutMarkedChildren = (t: Tree<T>): Tree<T> => ({
    ...t,
    children:
      t.modifier == "mark" ? [] : (t.children ?? []).map(cutMarkedChildren),
  });

  const d = layout(buildTree(tree, 0), mode == "auto-unfold");

  const minX = Math.min(...d.map((n) => n.x));
  const maxX = Math.max(...d.map((n) => n.x));
  const maxY = Math.max(...d.map((n) => n.y));

  // useInterval(() => {
  //   if (mode != "auto-fold") return;

  //   const fold = (idx: number) => {
  //     setTree(
  //       produce((tree) => {
  //         const n = treeNodeToTree(tree, d[idx]);
  //         for (const child of n.children ?? []) {
  //           child.modifier = void 0;
  //         }
  //         n.modifier = "mark";
  //       })
  //     );
  //   };
  //   const unfold = (idx: number) => {
  //     setTree(
  //       produce((tree) => {
  //         const n = treeNodeToTree(tree, d[idx]);
  //         for (const child of n.children ?? []) {
  //           child.modifier = "mark";
  //         }
  //         n.modifier = void 0;
  //       })
  //     );
  //   };

  //   for (const n of d) {
  //     if (foldings[n.id]) {
  //       if (n.modifier == "mark") continue;

  //       let p = n.parent;
  //       while (typeof p == "number") {
  //         if (d[p].modifier == "mark") {
  //           unfold(p);
  //           return;
  //         }
  //         p = d[p].parent;
  //       }

  //       const foldChildren = (idx: number): "nothing" | "called folded" => {
  //         if (d[idx].modifier == "mark") return "nothing";

  //         for (const child of d[idx].children) {
  //           const v = foldChildren(child);
  //           if (v == "nothing") {
  //           } else if (v == "called folded") {
  //             return "called folded";
  //           }
  //         }

  //         fold(idx);
  //         return "called folded";
  //       };

  //       if (foldChildren(n.id) == "called folded") return;
  //     }
  //   }
  // }, 200);

  // useInterval(() => {
  //   if (mode != "auto-unfold") return;

  //   const unfold = (idx: number) => {
  //     setTree(
  //       produce((tree) => {
  //         const n = treeNodeToTree(tree, d[idx]);
  //         for (const child of n.children ?? []) {
  //           child.modifier = "mark";
  //         }
  //         n.modifier = void 0;
  //       })
  //     );
  //   };

  //   for (let depth = 0; depth <= Math.max(...d.map((n) => n.y)); depth++) {
  //     for (const n of d) {
  //       if (n.y != depth) continue;
  //       if (n.modifier == "mark" && n.children.length > 0) {
  //         unfold(n.id);
  //         return;
  //       }
  //     }
  //   }
  // }, 100);

  return (
    <motion.svg
      // layout
      animate={{
        viewBox: `-${WIDTH} -${HEIGHT} ${
          (maxX - minX + 1.3) * WIDTH_GAP + WIDTH
        } ${(maxY + 1) * HEIGHT_GAP + HEIGHT}`,
      }}
      className="w-full min-w-[40rem]"
    >
      <LayoutGroup>
        {d.map(
          (t) =>
            (mode != "auto-unfold" ||
              t.modifier == "mark" ||
              !hasMarkedParent(d, t.id)) && (
              <React.Fragment key={t.path + "frag"}>
                {typeof t.parent == "number" && (
                  <motion.line
                    key={t.path + "l"}
                    className="text-fg-900"
                    stroke="currentColor"
                    strokeLinecap="round"
                    x1={WIDTH_GAP * (t.x - minX) + WIDTH / 2}
                    y1={HEIGHT_GAP * t.y + HEIGHT / 2}
                    x2={WIDTH_GAP * (d[t.parent].x - minX) + WIDTH / 2}
                    y2={HEIGHT_GAP * d[t.parent].y + HEIGHT / 2}
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                  />
                )}
              </React.Fragment>
            ),
        )}
        {d.map(
          (t) =>
            (mode != "auto-unfold" ||
              t.modifier == "mark" ||
              !hasMarkedParent(d, t.id)) && (
              <React.Fragment key={t.path + "frag"}>
                <RenderNode
                  t={t}
                  d={d}
                  minX={minX}
                  mode=""
                  onClick={onClick}
                  renderNode={renderNode}
                />
              </React.Fragment>
            ),
        )}
      </LayoutGroup>
    </motion.svg>
  );
}

function RenderNode<T>({
  t,
  minX,
  mode,
  d,
  onClick,
  renderNode,
}: {
  t: TreeNode<T>;
  minX: number;
  mode: Mode;
  d: TreeNode<T>[];
  onClick: ((key: string[], data: T) => void) | undefined;
  renderNode?: (data: T, opts: { isOpen: boolean }) => ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    middleware: [offset(10), flip(), shift()],
  });

  const hover = useHover(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return (
    <>
      <motion.rect
        key={t.path}
        ref={refs.setReference}
        {...getReferenceProps()}
        initial={{
          opacity: 0,
          x: (t.x - minX) * WIDTH_GAP,
          y: t.y * HEIGHT_GAP,
        }}
        animate={{
          opacity: 1,
          x: (t.x - minX) * WIDTH_GAP,
          y: t.y * HEIGHT_GAP,
        }}
        width={WIDTH}
        height={HEIGHT}
        strokeWidth={2}
        strokeLinejoin="round"
        style={{
          transitionDelay:
            mode == "root-to-mark" ||
            mode == "cover-to-mark" ||
            mode == "requires"
              ? `${t.y * 20}ms`
              : void 0,
        }}
        className={[
          "rounded transition-colors",

          (() => {
            if (t.modifier == "mark") return "text-purple-500";
            if (t.modifier == "dead") return "text-orange-500";
            if (mode == "leafs") {
              if (t.children.length == 0) return "text-purple-500";
              return "text-fg-700";
            }
            if (mode == "root-to-mark" || mode == "auto-fold") {
              if (hasMarked(d, t.id)) return "text-fg-700";
              return "text-slate-400";
            }
            if (mode == "cover-to-mark") {
              if (hasMarked(d, t.id)) return "text-fg-700";
              if (
                typeof t.parent == "number" &&
                d[t.parent].modifier != "mark" &&
                hasMarked(d, t.parent)
              ) {
                return "text-purple-400";
              }
              return "text-slate-400";
            }
            if (mode == "requires") {
              if (hasMarked(d, t.id)) {
                return "text-fg-700";
              }
              if (
                typeof t.parent == "number" &&
                d[t.parent].modifier != "mark" &&
                hasMarked(d, t.parent)
              ) {
                return "text-purple-400";
              }
              if (typeof t.parent == "number" && hasMarkedParent(d, t.parent)) {
                return "text-sky-700";
              }
              return "text-slate-400";
            }
            return "text-fg-700";
          })(),
        ].join(" ")}
        fill="currentColor"
        stroke="currentColor"
        // onMouseEnter={() => {
        //   if (mode == "auto-fold") {
        //     setFoldings((f) => {
        //       const next = f.map(
        //         (s, idx) =>
        //           idx == t.id ||
        //           (s && !isParentOf(d, idx, t.id) && !isChildOf(d, idx, t.id))
        //       );
        //       next[t.id] = true;
        //       return next;
        //     });
        //   }
        //   if (
        //     mode == "hover-to-mark" ||
        //     mode == "root-to-mark" ||
        //     mode == "cover-to-mark" ||
        //     mode == "requires"
        //   ) {
        //     setTree(
        //       produce((tree) => {
        //         const c = treeNodeToTree(tree, t);
        //         c.modifier = "mark";
        //       })
        //     );
        //   }
        // }}
        // onMouseLeave={() => {
        //   if (
        //     mode == "hover-to-mark" ||
        //     mode == "root-to-mark" ||
        //     mode == "cover-to-mark" ||
        //     mode == "requires"
        //   ) {
        //     setTree(
        //       produce((tree) => {
        //         const c = treeNodeToTree(tree, t);
        //         c.modifier = void 0;
        //       })
        //     );
        //   }
        // }}
        onClick={() => {
          onClick?.(t.path.split("~"), t.data);
        }}
      />
      {isOpen && (
        <FloatingPortal>
          <div
            className="pointer-events-none"
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <AnimatePresence>
              {isOpen && renderNode?.(t.data, { isOpen })}
            </AnimatePresence>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

export function useInterval(
  callback: () => void,
  delay: number | null,
  deps: unknown[] = [],
) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);

    return () => {
      console.log("destructor!");
      clearInterval(id);
    };
  }, [delay, ...deps]);
}

function layout<T>(
  t: TreeNode<T>[],
  cutMarkedChildren: boolean,
): TreeNode<T>[] {
  const computeEdges = (idx: number): [number[], number[]] => {
    if (t[idx].children.length == 0) {
      return [[t[idx].x], [t[idx].x + 1]];
    } else {
      const ldepth: number[] = [];
      const rdepth: number[] = [];
      for (const child of t[idx].children) {
        if (
          cutMarkedChildren &&
          t[child].modifier != "mark" &&
          hasMarkedParent(t, child)
        )
          continue;

        const [le, re] = computeEdges(child);
        for (let i = 0; i < le.length; i++) {
          if (i == ldepth.length) {
            ldepth[i] = le[i];
            rdepth[i] = re[i];
          } else {
            ldepth[i] = Math.min(ldepth[i], le[i]);
            rdepth[i] = Math.max(rdepth[i], re[i]);
          }
        }
      }
      return [
        [t[idx].x, ...ldepth],
        [t[idx].x + 1, ...rdepth],
      ];
    }
  };

  const shift = (idx: number, dx: number) => {
    t[idx].x += dx;
    for (const child of t[idx].children) {
      shift(child, dx);
    }
  };

  const fix = (idx: number) => {
    if (typeof t[idx].parent == "number") {
      t[idx].path = `${t[t[idx].parent!].path}~${t[idx].key}`;
    }

    t[idx].x = 0;
    t[idx].children.forEach(fix);

    let redge: number[] | null = null;

    for (const child of t[idx].children) {
      const [le, re] = computeEdges(child);
      if (redge == null) {
        redge = re;
        continue;
      }

      let dx = 0;
      for (let i = 0; i < Math.min(redge.length, le.length); i++) {
        dx = Math.max(dx, redge[i] - le[i]);
      }
      shift(child, dx);
      const [_, newRe] = computeEdges(child);
      redge = newRe;
    }

    if (t[idx].children.length == 1) {
      // t[idx].x = t[t[idx].children[0]].x + 0.5;
      t[idx].x = t[t[idx].children[0]].x;
    } else if (t[idx].children.length != 0) {
      const sum = t[idx].children.map((x) => t[x].x).reduce((a, b) => a + b);
      t[idx].x = sum / t[idx].children.length;
    }
  };

  fix(0);

  return t;
}
