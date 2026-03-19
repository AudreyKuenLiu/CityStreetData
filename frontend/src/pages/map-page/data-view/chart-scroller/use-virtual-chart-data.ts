import { useCallback, useEffect, useState } from "react";

interface IUserVirtualChartDataReturn {
  scrollHandler: (range: [number, number]) => void;
  resetHandler: (totalLength: number) => void;
  truncatedDataHandler: <T>(data: T[]) => T[];
  interval: [number, number];
}

export const useVirtualChartData = ({
  sizePerTick,
  panel,
}: {
  sizePerTick: number;
  panel: HTMLElement | null;
}): IUserVirtualChartDataReturn => {
  const [visibleInterval, setVisibleInterval] = useState<[number, number]>([
    0, 0,
  ]);
  const [panelSize, setPanelSize] = useState<number>(0);

  useEffect(() => {
    const panelObserver = new ResizeObserver((entries) => {
      for (const e of entries) {
        const panelSize = e.contentRect.width;
        const totalTicks = Math.floor(panelSize / sizePerTick);
        setPanelSize(panelSize);
        setVisibleInterval((prev) => {
          const [prevStart] = prev;
          return [prevStart, prevStart + totalTicks];
        });
      }
    });
    if (panel) {
      panelObserver.observe(panel);
    }
    return (): void => {
      panelObserver.disconnect();
    };
  }, [panel, sizePerTick]);

  const truncatedDataHandler = <T>(data: T[]): T[] => {
    return data.slice(visibleInterval[0], visibleInterval[1] + 1);
  };
  const scrollHandler = useCallback(
    (range: [number, number]): void => {
      const [leftP, rightP] = range;
      const currentRange = Math.floor(panelSize / (rightP - leftP));
      if (currentRange >= sizePerTick && rightP - leftP >= 1) {
        setVisibleInterval(range);
      }
    },
    [panelSize, sizePerTick],
  );
  const resetHandler = useCallback(
    (totalLength: number) => {
      setVisibleInterval((prevInterval) => {
        const [prev, next] = prevInterval;
        return [0, Math.min(next - prev, totalLength)];
      });
    },
    [setVisibleInterval],
  );

  return {
    interval: visibleInterval,
    truncatedDataHandler,
    scrollHandler,
    resetHandler,
  };
};
