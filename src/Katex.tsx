import * as React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export const Katex: React.FC<{ src: string }> = ({ src }) => {
  const [ref, setRef] = React.useState(null as null | HTMLSpanElement);

  React.useEffect(() => {
    if (ref) {
      try {
        ref.style.color = "";

        katex.render(src.replace(/\\\\/g, "\\"), ref, {
          trust: true,
          strict: false,
          macros: {
            "\\iInf": "\\displaystyle \\inf",
            "\\iSup": "\\displaystyle \\sup",
            "\\McG": "\\mathcal{S}",
            "\\MfG": "\\mathfrak{S}",
            "\\McS": "\\htmlClass{text-McS-500}{\\mathcal{S}}",
            "\\MfS": "\\htmlClass{text-McS-500}{\\mathfrak{S}}",
            "\\McM": "\\mathcal{M}",
            "\\MfM": "\\mathfrak{M}",
            "\\McL": "\\htmlClass{text-McL-500}{\\mathcal{L}}",
            "\\MfL": "\\htmlClass{text-McL-500}{\\mathfrak{L}}",
            "\\mem": "\\,\\in\\,",
            "\\Exp": "\\H{\\mathbf{Exp}}^{=#1}",
            "\\EC": "\\H{\\mathbf{ECost}}^{=#1}_{#2}",
            "\\PathsEq": "\\mathbf{Paths}^{=#1}",
            "\\Cost": "\\text{Cost}",
            "\\cost": "\\text{cost}",
            "\\lfp": "\\text{lfp}~",
            "\\gfp": "\\text{gfp}~",
            "\\Bell": "\\H{\\Phi}",
            // old
            "\\code": "\\texttt{\\H{#1}}",
            "\\pGCL": "\\mathbf{pGCL}",
            "\\Expr": "\\mathbf{Expr}",
            "\\State": "\\mathbf{State}",
            "\\Mem": "\\mathbf{Mem}",
            "\\Conf": "\\mathbf{Conf}",
            "\\Act": "\\mathbf{Act}",
            "\\Rew": "\\mathbf{Rew}",
            "\\Path": "\\mathbf{Path}",
            "\\Paths": "\\mathbf{Paths}",
            "\\Scheduler": "\\mathbf{Scheduler}",
            "\\Sche": "\\mathcal{S}",
            "\\Set": "\\text{Set } #1",
            // "\\op": "\\text{op}",
            "\\P": "\\text{P}",
            "\\Pr": "\\H{\\text{Pr}}",
            "\\Prob": "\\text{Prob}",
            "\\act": "\\text{act}",
            "\\last": "\\text{last}",
            "\\succs": "\\text{succs}",
            "\\supp": "\\text{supp }",
            "\\Dist": "\\text{Dist }",
            "\\Nat": "\\mathbb{N}",
            "\\Bool": "\\mathbf{Bool}",
            "\\ENNReal": "\\mathbb{R_{\\ge 0}^{\\infty}}",
            "\\NNReal": "\\mathbb{R_{\\ge 0}}",
            "\\PReal": "\\mathbb{R_{[0; 1]}}",
            "\\PPReal": "\\mathbb{R_{]0; 1]}}",
            "\\state": "\\langle #1,\\: #2 \\rangle",
            "\\sink": "\\Downarrow",
            "\\fault": "↯",
            "\\tick": "\\code{tick}\\:#1",
            "\\skip": "\\code{skip}",
            "\\assign": "#1\\:\\code{$\\coloneqq$}\\:#2",
            "\\seq": "#1\\:\\code{;}\\:#2",
            "\\prob": "\\code{\\{}#1\\code{\\}[}#2\\code{]\\{}#3\\code{\\}}",
            "\\nondet": "\\code{\\{}#1\\code{\\}[]\\{}#2\\code{\\}}",
            "\\ite":
              "\\code{if}\\:#1\\:\\code{\\{}#2\\code{\\}}\\:\\code{else}\\:\\code{\\{}#3\\code{\\}}",
            "\\loop": "\\code{while}\\:#1\\:\\code{\\{}#2\\code{\\}}",
            "\\observe": "\\code{observe}\\:#1",
            "\\operation": "#1 \\xrightarrow[]{#2} #3",
            "\\op": "\\mathbf{\\H{op}}\\llbracket#1\\rrbracket",
            "\\wp": "\\mathbf{\\H{wp}}\\llbracket#1\\rrbracket",
            "\\wlp": "\\mathbf{\\H{wlp}}\\llbracket#1\\rrbracket",
            "\\wfp": "\\mathbf{\\H{wfp}}\\llbracket#1\\rrbracket",
            // "\\dwp": "\\mathbf{\\H{dwp}}\\llbracket#1\\rrbracket(#2)",
            "\\dwp": "\\mathbf{\\H{wp}}\\llbracket#1\\rrbracket(#2)",
            "\\orew": "\\mathbf{r}",
            "\\ER": "\\H{\\mathbf{ExpRew}}",
            "\\MinER": "\\H{\\mathbf{MinExpRew}}",
            "\\MaxER": "\\H{\\mathbf{MaxExpRew}}",
            "\\iver": "[#1]",
            "\\rew": "\\text{rew}^{#1}",
            "\\H": "\\htmlClass{text-fg-600}{#1}",
          },
        });
      } catch (e) {
        ref.style.color = "red";
        ref.innerText = "KaTeX error: " + src;
        console.error(e);
      }
    }
  }, [src, ref]);

  return (
    <span
      style={{ fontSize: `${1 / 1.21}em` }}
      ref={(x) => {
        setRef(x);
      }}
    ></span>
  );
};

export const Katext: React.FC<{ children: string }> = ({ children }) => (
  <Katex src={`\\text{${children}}`} />
);

export const tex = (src: TemplateStringsArray, ...rest: unknown[]) => {
  return <Katex src={String.raw(src, ...rest)} />;
};
export const text = (src: TemplateStringsArray, ...rest: unknown[]) => (
  <Katex src={`\\text{${String.raw(src, ...rest)}}`} />
);
