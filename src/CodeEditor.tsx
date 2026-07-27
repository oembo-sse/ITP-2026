import { LayoutGroup, motion } from "framer-motion";
import * as pgcl from "pgcl";
import React from "react";
import { useMemo } from "react";

export const CodeEditor = ({
  src,
  setSrc,
}: {
  src: string;
  setSrc: (s: string) => void;
}) => {
  const { tokens } = useMemo(() => pgcl.highlight_pgcl(src), [src]);

  return (
    <div className="relative font-mono">
      <textarea
        className="p-4 resize-none rounded-lg whitespace-pre outline-none text-white caret-black"
        cols={55}
        rows={15}
        value={src}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        onChange={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setSrc(e.target.value);
        }}
      ></textarea>
      <pre className="absolute inset-4 pointer-events-none">
        <code>
          {tokens.map((tok, i) => (
            <span
              key={i}
              className={
                {
                  WhiteSpace: "",
                  Number: "text-fg-500",
                  Ident: "",
                  Keyword: "text-fg-700",
                  Punctuation: "text-bg-700/50",
                  Op: "text-fg-400",
                  Marker: "",
                  MarkerEnd: "",
                }[tok.token_type] ?? ""
              }
            >
              {tok.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
};

export const Code = ({ src }: { src: string }) => {
  const { tokens } = useMemo(() => pgcl.highlight_pgcl(src), [src]);

  const tokIndex: Record<string, number> = {};
  const markers: string[] = [];

  return (
    <div className="font-mono p-4">
      <pre className="pointer-events-none flex flex-wrap justify-start w-[45ch]">
        <LayoutGroup>
          {/* <AnimatePresence> */}
          {tokens.map((tok) => {
            if (tok.token_type === "Marker") {
              markers.push(tok.text);
              return null;
            }
            if (tok.token_type === "MarkerEnd") {
              markers.pop();
              return null;
            }

            const fingerprint = `${markers.join("~")}|${tok.text}`;
            if (fingerprint in tokIndex) {
              tokIndex[fingerprint] += 1;
            } else {
              tokIndex[fingerprint] = 1;
            }
            const id = `${tok.token_type}-${tokIndex[fingerprint]}-${fingerprint}`;
            if (tok.text.includes("\n"))
              return tok.text.split("\n").map((l, i) => (
                <React.Fragment key={id + i}>
                  <div className="basis-full h-0 whitespace-pre"></div>
                  <motion.div layout>{l}</motion.div>
                </React.Fragment>
              ));
            return (
              <motion.div
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                title={id}
                key={id}
                layoutId={id}
                className={
                  "whitespace-pre inline " +
                  ({
                    WhiteSpace: "",
                    Number: "text-fg-500",
                    Ident: "",
                    Keyword: "text-fg-700",
                    Punctuation: "text-bg-700/50",
                    Op: "text-fg-400",
                  }[tok.token_type] ?? "")
                }
              >
                {tok.text.replace(/@/g, "")}
              </motion.div>
            );
          })}
          {/* </AnimatePresence> */}
        </LayoutGroup>
      </pre>
    </div>
  );
};

export const LeanCode = ({ src }: { src: string }) => {
  const { tokens } = useMemo(() => pgcl.highlight_lean(src), [src]);

  const tokIndex: Record<string, number> = {};
  const markers: string[] = [];

  return (
    <div className="font-mono">
      <pre className="pointer-events-none flex flex-wrap justify-start w-[90ch]">
        <LayoutGroup id={src}>
          {/* <AnimatePresence> */}
          {tokens.map((tok) => {
            if (tok.token_type === "Marker") {
              markers.push(tok.text);
              return null;
            }
            if (tok.token_type === "MarkerEnd") {
              markers.pop();
              return null;
            }

            const fingerprint = `${markers.join("~")}|${tok.text}`;
            if (fingerprint in tokIndex) {
              tokIndex[fingerprint] += 1;
            } else {
              tokIndex[fingerprint] = 1;
            }
            const id = `${tok.token_type}-${tokIndex[fingerprint]}-${fingerprint}`;
            if (tok.text.includes("\n"))
              return tok.text.split("\n").map((l, i) => (
                <React.Fragment key={id + i}>
                  <div className="basis-full h-0 whitespace-pre"></div>
                  <motion.div layout>{l}</motion.div>
                </React.Fragment>
              ));
            return (
              <motion.div
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                title={id}
                key={id}
                layoutId={id}
                className={
                  "whitespace-pre inline " +
                  ({
                    WhiteSpace: "",
                    Number: "text-fg-500",
                    Ident: "",
                    Keyword: "text-fg-700",
                    Punctuation: "text-bg-700/50",
                    Op: "text-fg-400",
                  }[tok.token_type] ?? "")
                }
              >
                {tok.text}
              </motion.div>
            );
          })}
          {/* </AnimatePresence> */}
        </LayoutGroup>
      </pre>
    </div>
  );
};

export const InlineLeanCode = ({ src }: { src: string }) => {
  const { tokens } = useMemo(() => pgcl.highlight_lean(src), [src]);

  const markers: string[] = [];

  return (
    <span className="font-mono whitespace-pre">
      {tokens.map((tok, id) => {
        if (tok.token_type === "Marker") {
          markers.push(tok.text);
          return null;
        }
        if (tok.token_type === "MarkerEnd") {
          markers.pop();
          return null;
        }
        return (
          <span
            key={id}
            className={
              "whitespace-pre inline " +
              ({
                WhiteSpace: "",
                Number: "text-fg-500",
                Ident: "",
                Keyword: "text-fg-700",
                Punctuation: "text-bg-700/50",
                Op: "text-fg-400",
              }[tok.token_type] ?? "")
            }
          >
            {tok.text}
          </span>
        );
      })}
    </span>
  );
};
