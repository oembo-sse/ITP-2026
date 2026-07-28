import deepEqual from "deep-equal";
import React from "react";
import colors from "tailwindcss/colors";
import type * as vis from "vis-network/esnext";

export const rewardNode: vis.Node = {
  color: colors.orange[300],
  //   borderWidth: 0,
};

type NetworkProps = {
  nodes: vis.Node[];
  edges: vis.Edge[];
  highlighted?: string[];
  full?: boolean;
};
export const Network = React.memo(
  React.forwardRef<vis.Network, NetworkProps>((props, ref) => {
    const [container, setContainer] = React.useState<null | HTMLDivElement>();

    const nodes = React.useMemo(
      () => props.nodes.map((n) => ({ ...n })),
      [props.nodes],
    );
    const edges = React.useMemo(
      () => props.edges.map((e) => ({ ...e })),
      [props.edges],
    );
    const highlighted = React.useMemo(
      () => props.highlighted ?? [],
      [props.highlighted],
    );

    const [networkRef, setNetworkRef] = React.useState<vis.Network | null>(
      null,
    );

    React.useEffect(() => {
      if (!container) return;

      const run = async () => {
        const visPromise = import("vis-network/esnext");

        // NOTE: Prime all images, such that when the figure is drawn, they will
        // all be loaded
        // TODO: This priming does not always load the images
        await Promise.all(
          nodes.map((n) => {
            if (typeof n.image == "string")
              return new Promise((res) => {
                const img = document.createElement("img");
                img.onload = res;
                img.src = n.image as string;
              });
          }),
        );

        const vis = await visPromise;

        const network = new vis.Network(
          container,
          {
            nodes,
            edges,
          },
          {
            nodes: {
              fixed: true,
              font: { face: '"KaTeX_Math"' },
              color: {
                background: "white",
                border: "lightgray",
              },
              shape: "circle",
              size: 30,
              widthConstraint: 25,
            },
            edges: {
              font: { face: '"KaTeX_Math"' },
              color: "lightgray",
            },
            // autoResize: true,
          },
        );
        setNetworkRef(network);

        network.on("stabilized", () => {
          // We do this a couple of times. Seem to be most stable
          network.fit({ animation: false, maxZoomLevel: 5 });
          setTimeout(() => {
            network.fit({ animation: false, maxZoomLevel: 5 });
            setTimeout(() => {
              network.fit({ animation: false, maxZoomLevel: 5 });
            }, 10);
          }, 10);
        });

        if (ref)
          typeof ref == "function" ? ref(network) : (ref.current = network);
      };

      const debounce = setTimeout(() => run().catch(console.error), 10);

      return () => clearTimeout(debounce);
    }, [container, nodes, edges, ref]);

    React.useEffect(() => {
      if (!networkRef) return;

      console.log("highlighted", highlighted);

      networkRef.setSelection({ nodes: highlighted });
    }, [networkRef, highlighted]);

    return (
      <div
        className={props.full ? "h-full w-full" : ""}
        ref={setContainer}
      ></div>
    );
  }),
  (a, b) => deepEqual(a, b),
);
Network.displayName = "Network";
