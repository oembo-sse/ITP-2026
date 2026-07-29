import { makeSlide } from "../hooks";
import { useSlide } from "../slides";
import { Code } from "../CodeEditor";

export const programs = [
  //   `@l1 x := 10$`,
  //   `@l1 x := 10$ ;
  // @l2 x := x - 1$`,
  `@l1 x := 10$ ;
while x > 0 {
  @l2 x := x - 1$ ;
  sum := sum + x
}`,
  //   `@l1 x := 10$ ;
  // @l3 sum := 0$ ;
  // while x > 0 {
  //   @l2 x := x - 1$ ;
  //   sum := sum + x
  // }`,
  //   `@l1 { x := 10 } [1/2] { x := 20 }$ ;
  // @l3 sum := 0$ ;
  // while x > 0 {
  //   @l2 x := x - 1$ ;
  //   sum := sum + x
  // }`,
  //   `@l1 x := 10$ ;
  // while x > 0 {
  //   @l2 {
  //     x := x - 1
  //   } [1/2] {
  //     x := x - 2
  //   }$ ;
  //   sum := sum + x
  // }`,
  //   `@l1 x := 10$ ;
  // while x > 0 {
  //   @l2 {
  //     x := x - 1
  //   } [1/2] {
  //     skip
  //   }$ ;
  //   sum := sum + x
  // }`,
  //   `@l1 x := 10$ ;
  // while x > 0 {
  //   @l2 {
  //     x := x - 1
  //   } [1/2] {
  //     @xp x := x + 1$
  //   }$ ;
  //   sum := sum + x
  // }`,
  //   `@l1 x := 0$ ; @b stop := 0$ ;
  // while stop = 0 {
  //   @l2 { stop := 1 } [1/2] { @xp x := x + 1$ }$
  // }`,
  //   `@l1 x := 1$ ; @b stop := 0$ ;
  // while stop = 0 {
  //   @l2 { stop := 1 } [1/2] { @xp x := x * 2$ }$
  // }`,
  //   `@p2
  // @init fail := 0 ; sent := 0 ;$
  // while sent < 4 && fail < 2 {
  //   { fail := 0 ; sent := sent + 1 } [1/2]
  //   { fail := fail + 1 }
  // }$`,
  //   `@p2 @init fail := 0 ; sent := 0 ;$
  // while sent < 4 && fail < 2 {
  //   @t tick 1 ;$
  //   { fail := 0 ; sent := sent + 1 } [1/2]
  //   { fail := fail + 1 }
  // }$`,
];

export const rawPrograms = [
  //   `@l1 x := 10$`,
  //   `@l1 x := 10$ ;
  // @l2 x := x - 1$`,
  `x := 2 ;
while x > 0 {
  x := x - 1 ;
  sum := sum + x
}`,
  //   `x := 2 ;
  // @l3 sum := 0 ;
  // while x > 0 {
  //   @l2 x := x - 1 ;
  //   sum := sum + x
  // }`,
  //   `{ x := 2 } [1/2] { x := 20 } ;
  // @l3 sum := 0 ;
  // while x > 0 {
  //   @l2 x := x - 1 ;
  //   sum := sum + x
  // }`,
  `x := 5 ;
while x > 0 {
  {
    x := x - 1
  } [1/2] {
    x := x - 2
  } ;
  sum := sum + x
}`,
  `x := 2 ;
while x > 0 {
  {
    x := x - 1
  } [1/2] {
    skip
  } ;
  sum := sum + x
}`,
  `x := 2 ;
while x > 0 {
  {
    x := x - 1
  } [1/2] {
    x := x + 1
  } ;
  sum := sum + x
}`,
  //   `x := 0$ ; @b stop := 0$ ;
  // while stop = 0 {
  //   @l2 { stop := 1 } [1/2] { @xp x := x + 1$ }$
  // }`,
  //   `@l1 x := 1$ ; @b stop := 0$ ;
  // while stop = 0 {
  //   @l2 { stop := 1 } [1/2] { @xp x := x * 2$ }$
  // }`,
  //   `@p2
  // @init fail := 0 ; sent := 0 ;$
  // while sent < 4 && fail < 2 {
  //   { fail := 0 ; sent := sent + 1 } [1/2]
  //   { fail := fail + 1 }
  // }$`,
  //   `@p2 @init fail := 0 ; sent := 0 ;$
  // while sent < 4 && fail < 2 {
  //   @t tick 1 ;$
  //   { fail := 0 ; sent := sent + 1 } [1/2]
  //   { fail := fail + 1 }
  // }$`,
];

export const s04 = makeSlide(programs.length, () => {
  const { step } = useSlide();
  return (
    <div className="flex justify-center flex-col items-center">
      <div className="text-4xl">
        <Code src={programs[step] ?? ""} />
      </div>
    </div>
  );
});
