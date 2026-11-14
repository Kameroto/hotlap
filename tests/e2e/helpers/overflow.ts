// Self-contained so Playwright can serialize this function into the browser.
export function measureOverflow() {
  const tolerance = 1;
  const viewportWidth = document.documentElement.clientWidth;
  const overflowingElements = [];
  const clippedElements = [];
  const horizontalScrollers = [];

  for (const element of document.querySelectorAll<HTMLElement>('body *')) {
    if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) continue;
    let left = rect.left;
    let right = rect.right;
    let top = rect.top;
    let bottom = rect.bottom;
    const clips = [];

    // Do not intersect with the viewport itself: that would hide every failure.
    for (let ancestor = element.parentElement;
      ancestor && ancestor !== document.documentElement;
      ancestor = ancestor.parentElement) {
      const ancestorStyle = getComputedStyle(ancestor);
      const clipsX = /^(hidden|clip|auto|scroll)$/.test(ancestorStyle.overflowX);
      const clipsY = /^(hidden|clip|auto|scroll)$/.test(ancestorStyle.overflowY);
      const paintContainment = /\b(paint|strict|content)\b/.test(ancestorStyle.contain);
      if (!clipsX && !clipsY && !paintContainment) continue;

      // Out-of-flow descendants can escape an overflow ancestor when their
      // containing block is outside it. Don't incorrectly clip those boxes.
      let escapes = false;
      for (let descendant: HTMLElement | null = element;
        descendant && descendant !== ancestor;
        descendant = descendant.parentElement) {
        const position = getComputedStyle(descendant).position;
        if ((position === 'absolute' || position === 'fixed') &&
          (!descendant.offsetParent || !ancestor.contains(descendant.offsetParent))) {
          escapes = true;
          break;
        }
      }
      if (escapes && !paintContainment) continue;

      const clip = ancestor.getBoundingClientRect();
      const scaleX = ancestor.offsetWidth ? clip.width / ancestor.offsetWidth : 1;
      const scaleY = ancestor.offsetHeight ? clip.height / ancestor.offsetHeight : 1;
      const clipLeft = clip.left + ancestor.clientLeft * scaleX;
      const clipTop = clip.top + ancestor.clientTop * scaleY;
      if (clipsX || paintContainment) {
        left = Math.max(left, clipLeft);
        right = Math.min(right, clipLeft + ancestor.clientWidth * scaleX);
      }
      if (clipsY || paintContainment) {
        top = Math.max(top, clipTop);
        bottom = Math.min(bottom, clipTop + ancestor.clientHeight * scaleY);
      }
      clips.push({ tag: ancestor.tagName, className: ancestor.className,
        overflowX: ancestorStyle.overflowX, overflowY: ancestorStyle.overflowY });
    }

    const diagnostic = { tag: element.tagName, id: element.id,
      className: typeof element.className === 'string' ? element.className : '',
      raw: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
      effective: { left, right, top, bottom }, clips,
      position: style.position, overflowX: style.overflowX };
    const nonempty = right > left && bottom > top;
    if (nonempty && (left < -tolerance || right > viewportWidth + tolerance)) {
      overflowingElements.push(diagnostic);
    } else if (rect.left < -tolerance || rect.right > viewportWidth + tolerance) {
      clippedElements.push(diagnostic);
    }
    if (nonempty && element.scrollWidth > element.clientWidth + tolerance &&
      /^(auto|scroll)$/.test(style.overflowX)) {
      horizontalScrollers.push({ id: element.id, className: element.className,
        isBeginnerGuide: !!element.closest('section')?.querySelector('h2')?.textContent?.includes('Start smarter.'),
        clientWidth: element.clientWidth, scrollWidth: element.scrollWidth });
    }
  }
  return { overflowingElements, clippedElements, horizontalScrollers };
}
