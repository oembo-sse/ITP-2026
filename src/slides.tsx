import { motion } from "framer-motion";
import * as React from "react";
import { useSlidesBase } from "./hooks";

export type AppearProps = {
  from?: number;
  to?: number;
  show?: boolean;
  scale?: boolean;
  exit?: boolean;
  className?: string;
  src?: string;
  id?: string;
  layoutId?: string;
  children?: React.ReactNode | React.ReactNode[];
};

const deriveProps = (props: AppearProps) => {
  const { scale, exit, children, className, src } = props;
  return {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: exit ? { opacity: 0, y: 10 } : undefined,
    layout: scale ? true : "position",
    children,
    className,
    src,
    id: props.id,
    layoutId: props.layoutId,
  } as const;
};

const show = (props: AppearProps) => {
  const { step } = useSlide();
  const { from = 0, to = Infinity } = props;

  if ("show" in props) {
    return props.show;
  }

  return step >= from && step < to;
};

export const appear = {
  div: (props: AppearProps) =>
    show(props) && <motion.div {...deriveProps(props)} />,
  img: (props: AppearProps) =>
    show(props) && <motion.img {...deriveProps(props)} />,
  li: (props: AppearProps) =>
    show(props) && <motion.li {...deriveProps(props)} />,
  span: (props: AppearProps) =>
    show(props) && <motion.span {...deriveProps(props)} />,
};

export const SlidesContext = React.createContext<ReturnType<
  typeof useSlidesBase
> | null>(null);

export const useSlide = () => {
  return React.useContext(SlidesContext)!;
};
