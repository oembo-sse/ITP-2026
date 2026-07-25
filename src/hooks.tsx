import { useEffect, useRef, useState } from "react";

export const makeSlide = (
  steps: number,
  render: (step: number) => React.ReactNode,
) => {
  return { steps, render: ({ step }: { step: number }) => render(step) };
};

export type Slide = {
  steps: number;
  render: (props: { step: number }) => React.ReactNode;
  from: number;
  to: number;
};

export type Slides = {
  slides: Slide[];
  totalSteps: number;
  getCurrentSlide: (index: number) => {
    prevSlide: Slide;
    currentSlideIndex: number;
    currentSlide: Slide;
    step: number;
  };
};

export const buildSlides = (
  inputSlides: {
    steps: number;
    render: (props: { step: number }) => React.ReactNode;
  }[],
): Slides => {
  let current = 0;
  const slides = inputSlides.map((slide): Slide => {
    current += slide.steps;
    return { ...slide, from: current - slide.steps, to: current };
  });

  return {
    slides,
    totalSteps: slides.reduce((sum, s) => sum + s.steps, 0),
    getCurrentSlide: (index: number) => {
      let currentSlideIndex = slides.findIndex(
        (slide) => slide.from <= index && index < slide.to,
      );
      if (currentSlideIndex == -1) currentSlideIndex = slides.length - 1;
      const currentSlide = slides[currentSlideIndex];

      return {
        prevSlide: slides[Math.max(0, currentSlideIndex - 1)],
        currentSlideIndex,
        currentSlide,
        step: Math.min(index - currentSlide.from, currentSlide.steps - 1),
      };
    },
  };
};

function getStorageValue<T>(key: string, defaultValue: T): T {
  // getting stored value
  const saved = localStorage.getItem(key);
  return typeof saved == "undefined" || saved === null
    ? defaultValue
    : JSON.parse(saved);
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export const useSlidesBase = (slides: Slides) => {
  const clamp = (min: number, x: number, max: number) =>
    Math.min(max, Math.max(x, min));

  const [index, setIndex] = useLocalStorage("slide-index", 0);

  const lastScrollTime = useRef(0);

  useEffect(() => {
    const clampIndex = (i: number) => clamp(0, i, slides.totalSteps - 1);

    const keyListener = (e: KeyboardEvent) => {
      switch (e.key) {
        case "PageUp":
        case "ArrowLeft": {
          setIndex((i) => clampIndex(i - 1));
          break;
        }
        case "PageDown":
        case "ArrowRight": {
          setIndex((i) => clampIndex(i + 1));
          break;
        }
        case " ": {
          if (e.shiftKey) setIndex((i) => clampIndex(i - 1));
          else setIndex((i) => clampIndex(i + 1));
          break;
        }
        case "ArrowUp": {
          const { prevSlide, currentSlide, step } =
            slides.getCurrentSlide(index);
          if (step == 0) {
            setIndex(clampIndex(prevSlide.from));
          } else {
            setIndex(clampIndex(currentSlide.from));
          }
          break;
        }
        case "ArrowDown": {
          const { currentSlide } = slides.getCurrentSlide(index);
          setIndex(clampIndex(currentSlide.to));
          break;
        }
      }
    };
    const ENABLE_SCROLL = false;
    const wheelListener = (e: WheelEvent) => {
      if (!ENABLE_SCROLL) return;

      // scroll events are often fired multiple times so we need to debounce

      if (Math.abs(e.deltaY) < 2) {
        return;
      }

      const now = Date.now();
      if (now - lastScrollTime.current < 20) {
        return;
      }
      lastScrollTime.current = now;

      if (e.deltaY > 0) {
        setIndex((i) => clampIndex(i + 1));
      } else {
        setIndex((i) => clampIndex(i - 1));
      }
    };
    window.addEventListener("keydown", keyListener);
    window.addEventListener("wheel", wheelListener);
    return () => {
      window.removeEventListener("keydown", keyListener);
    };
  }, [slides, index, setIndex]);

  const { currentSlideIndex, currentSlide, step } =
    slides.getCurrentSlide(index);

  return {
    currentSlideIndex,
    currentSlide,
    step,
    globalStep: index,
    totalSteps: slides.totalSteps,
    totalSlides: slides.slides.length,
  };
};
