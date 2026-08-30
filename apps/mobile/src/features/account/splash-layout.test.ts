import { describe, expect, it } from "vitest";
import { getSplashLayoutMetrics } from "./splash-layout";

describe("getSplashLayoutMetrics", () => {
  it("scales the logo and title between compact, standard, and tablet screens", () => {
    const compactPhone = getSplashLayoutMetrics({ height: 568, width: 320 });
    const standardPhone = getSplashLayoutMetrics({ height: 852, width: 393 });
    const tablet = getSplashLayoutMetrics({ height: 1024, width: 768 });

    expect(compactPhone.compact).toBe(true);
    expect(standardPhone.compact).toBe(false);
    expect(compactPhone.logoSize).toBeLessThan(standardPhone.logoSize);
    expect(standardPhone.logoSize).toBeLessThan(tablet.logoSize);
    expect(compactPhone.titleFontSize).toBeLessThan(standardPhone.titleFontSize);
    expect(standardPhone.titleFontSize).toBeLessThan(tablet.titleFontSize);
  });

  it("caps large-screen metrics to keep the splash content readable", () => {
    const tablet = getSplashLayoutMetrics({ height: 1366, width: 1024 });

    expect(tablet.logoSize).toBe(180);
    expect(tablet.titleFontSize).toBe(40);
    expect(tablet.contentPadding).toBe(32);
    expect(tablet.contentGap).toBe(30);
    expect(tablet.paddingBottom).toBe(42);
  });

  it("uses compact limits on short landscape screens", () => {
    const landscape = getSplashLayoutMetrics({ height: 393, width: 852 });

    expect(landscape.compact).toBe(true);
    expect(landscape.logoSize).toBe(144);
    expect(landscape.titleFontSize).toBe(34);
    expect(landscape.logoTopSpacing).toBeLessThan(80);
  });
});
