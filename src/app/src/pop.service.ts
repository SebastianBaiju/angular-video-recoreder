
export class PopService {
  public ownElementValue: any;
  public ownerDocument!: Document | null;
  public max = Math.max;
  public min = Math.min;
  public round = Math.round;
  public uaData: any;
  public clientRect!: DOMRect;
  public scaleX = 1;
  public scaleY = 1;
  public top = 'top';

  public bottom = 'bottom';

  public right = 'right';

  public left = 'left';

  public auto: any = 'auto';

  public basePlacements: any = [this.top, this.bottom, this.right, this.left];

  public start = 'start';

  public end = 'end';

  public clippingParents = 'clippingParents';

  public viewport = 'viewport';

  public popper = 'popper';

  public reference = 'reference';

  public variationPlacements = /* #__PURE__*/ this.basePlacements.reduce(
    (acc: any, placement: string) => {
      return acc.concat([
        `${placement}-${this.start}`,
        `${placement}-${this.end}`
      ]);
    },
    []
  );

  public state: any = {};

  public instance: any;

  public options: any;

  public placements = /* #__PURE__*/ ([] as any)
    .concat(this.basePlacements, [this.auto])
    .reduce((acc: any, placement: string) => {
      return acc.concat([
        placement,
        `${placement}-${this.start}`,
        `${placement}-${this.end}`
      ]);
    }, []); // modifiers that need to read the DOM

  public beforeRead = 'beforeRead';

  public read = 'read';

  public afterRead = 'afterRead'; // pure-logic modifiers

  public beforeMain = 'beforeMain';

  public main = 'main';

  public afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

  public beforeWrite = 'beforeWrite';

  public write = 'write';

  public afterWrite = 'afterWrite';

  public modifierPhases = [
    this.beforeRead,
    this.read,
    this.afterRead,
    this.beforeMain,
    this.main,
    this.afterMain,
    this.beforeWrite,
    this.write,
    this.afterWrite
  ];

  public defaultOptionsValues = {
    placement: 'bottom',

    modifiers: [],

    strategy: 'absolute'
  };

  getWindow(node: any) {
    if (node == null) {
      return window;
    }
    if (node?.toString() !== '[object Window]') {
      this.ownerDocument = node?.ownerDocument;
      return this.ownerDocument? this.ownerDocument?.defaultView || window: window;
    }
    return node;
  }

  isElement(node: null | Document | Element) {
    this.ownElementValue = this.getWindow(node).Element;
    return node instanceof this.ownElementValue || node instanceof Element;
  }

  isHTMLElement(node: null | Document | Element) {
    this.ownElementValue = this.getWindow(node).HTMLElement;

    return node instanceof this.ownElementValue || node instanceof HTMLElement;
  }

  isShadowRoot(node: null | Document | Element) {
    // IE 11 has no ShadowRoot

    if (typeof ShadowRoot === 'undefined') {
      return false;
    }

    this.ownElementValue = this.getWindow(node).ShadowRoot;

    return node instanceof this.ownElementValue || node instanceof ShadowRoot;
  }



  getUAString() {
    this.uaData = (navigator as any).userAgentData;

    if ( this.uaData != null && (this.uaData?.brands && Array.isArray(this.uaData.brands))) {
      return this.uaData.brands
        .map((item: { brand: string; version: string }) => {
          return `${item.brand}/${item.version}`;
        })
        .join(' ');
    }

    return navigator.userAgent;
  }

  isLayoutViewport() {
    return !(/^((?!chrome|android).)*safari/i).test(this.getUAString());
  }



  getBoundingClientRect(
    element: HTMLElement,
    includeScale: boolean = false,
    isFixedStrategy: boolean = false
  ) {
    if (includeScale === undefined) {
      includeScale = false;
    }

    if (isFixedStrategy === undefined) {
      isFixedStrategy = false;
    }

    this.clientRect = element.getBoundingClientRect();

    this.scaleX = 1;

    this.scaleY = 1;

    if (includeScale && this.isHTMLElement(element)) {
      this.scaleX =        element.offsetWidth > 0          ? this.round(this.clientRect.width) / element.offsetWidth || 1          : 1;

      this.scaleY =        element.offsetHeight > 0          ? this.round(this.clientRect.height) / element.offsetHeight || 1          : 1;
    }

    const refElement = this.isElement(element) ? this.getWindow(element) : window,
      visualViewport = refElement.visualViewport;

    const addVisualOffsets = !this.isLayoutViewport() && isFixedStrategy;

    const x =      (this.clientRect.left +        (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) /      this.scaleX;

    const y =      (this.clientRect.top +        (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) /      this.scaleY;

    const width = this.clientRect.width / this.scaleX;

    const height = this.clientRect.height / this.scaleY;

    return {
      width: width,

      height: height,

      top: y,

      right: x + width,

      bottom: y + height,

      left: x,

      x: x,

      y: y
    };
  }

  getWindowScroll(node: null | Document | Element) {
    const win = this.getWindow(node);

    const scrollLeft = win.pageXOffset;

    const scrollTop = win.pageYOffset;

    return {
      scrollLeft: scrollLeft,

      scrollTop: scrollTop
    };
  }

  getHTMLElementScroll(element: Element) {
    return {
      scrollLeft: element.scrollLeft,

      scrollTop: element.scrollTop
    };
  }

  getNodeScroll(node: Element) {
    if (node === this.getWindow(node) || !this.isHTMLElement(node)) {
      return this.getWindowScroll(node);
    }

    return this.getHTMLElementScroll(node);
  }

  getNodeName(element: null | Document | Element): any {
    return element ? (element.nodeName || '').toLowerCase() : null;
  }

  getDocumentElement(element: Element | Window | any): any {
    // $FlowFixMe[incompatible-return]: assume body is always available

    return (
      (this.isElement(element) ? element.ownerDocument : element.document) ||      window.document
    ).documentElement; // $FlowFixMe[prop-missing]
  }

  getWindowScrollBarX(element: null | Document | Element) {
    // If <html> has a CSS width greater than the viewport, then this will be

    // incorrect for RTL.

    // Popper 1 is broken in this case and never had a bug report so let's assume

    // it's not an issue. I don't think anyone ever specifies width on <html>

    // anyway.

    // Browsers where the left scrollbar doesn't cause an issue report `0` for

    // this (e.g. Edge 2019, IE11, Safari)

    return (
      this.getBoundingClientRect(this.getDocumentElement(element)).left +      this.getWindowScroll(element).scrollLeft
    );
  }

  getComputedStyle(element: null | Document | Element) {
    return this.getWindow(element).getComputedStyle(element);
  }

  isScrollParent(element: Element) {
    // Firefox wants us to check `-x` and `-y` letiations as well

    const getComputedStyles = getComputedStyle(element),
      overflow = getComputedStyles.overflow,
      overflowX = getComputedStyles.overflowX,
      overflowY = getComputedStyles.overflowY;

    return (/auto|scroll|overlay|hidden/).test(overflow + overflowY + overflowX);
  }

  isElementScaled(element: HTMLElement) {
    const rect = element.getBoundingClientRect();

    const scaleX = this.round(rect.width) / element.offsetWidth || 1;

    const scaleY = this.round(rect.height) / element.offsetHeight || 1;

    return scaleX !== 1 || scaleY !== 1;
  } // Returns the composite rect of an element relative to its offsetParent.

  // Composite means it takes into account transforms as well as layout.

  getCompositeRect(
    elementOrVirtualElement: HTMLElement,
    offsetParent: HTMLElement,
    isFixed: boolean
  ) {
    if (isFixed === undefined) {
      isFixed = false;
    }

    const isOffsetParentAnElement = this.isHTMLElement(offsetParent);

    const offsetParentIsScaled =      this.isHTMLElement(offsetParent) && this.isElementScaled(offsetParent);

    const documentElement = this.getDocumentElement(offsetParent);

    const rect = this.getBoundingClientRect(
      elementOrVirtualElement,
      offsetParentIsScaled,
      isFixed
    );

    let scroll = {
      scrollLeft: 0,

      scrollTop: 0
    };

    let offsets = {
      x: 0,

      y: 0
    };

    if (isOffsetParentAnElement || (!isOffsetParentAnElement && !isFixed)) {
      if (
        this.getNodeName(offsetParent) !== 'body' ||        this.isScrollParent(documentElement)
      ) {
        scroll = this.getNodeScroll(offsetParent);
      }

      if (this.isHTMLElement(offsetParent)) {
        offsets = this.getBoundingClientRect(offsetParent, true);

        offsets.x += offsetParent.clientLeft;

        offsets.y += offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = this.getWindowScrollBarX(documentElement);
      }
    }

    return {
      x: rect.left + scroll.scrollLeft - offsets.x,

      y: rect.top + scroll.scrollTop - offsets.y,

      width: rect.width,

      height: rect.height
    };
  }

  // means it doesn't take into account transforms.

  getLayoutRect(element: HTMLElement) {
    const clientRect = this.getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.

    // Fixes https://github.com/popperjs/popper-core/issues/1223

    let width = element.offsetWidth;

    let height = element.offsetHeight;

    if (Math.abs(clientRect.width - width) <= 1) {
      width = clientRect.width;
    }

    if (Math.abs(clientRect.height - height) <= 1) {
      height = clientRect.height;
    }

    return {
      x: element.offsetLeft,

      y: element.offsetTop,

      width: width,

      height: height
    };
  }

  getParentNode(element: Element | any) {
    if (this.getNodeName(element) === 'html') {
      return element;
    }

    return (
    // this is a quicker (but less type safe) way to save quite some bytes from the bundle

    // $FlowFixMe[incompatible-return]

    // $FlowFixMe[prop-missing]
    // step into the shadow DOM of the parent of a slotted node
    // DOM Element detected
    // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
      element.assignedSlot ||element.parentNode ||(this.isShadowRoot(element) ? element?.host : null) ||  this.getDocumentElement(element) // fallback
    );
  }

  getScrollParent(node: Element): any {
    if (
      ['html', 'body', '#document'].includes(
        this.getNodeName(node) ? this.getNodeName(node) : ''
      )
    ) {
      // $FlowFixMe[incompatible-return]: assume body is always available

      return node.ownerDocument.body;
    }

    if (this.isHTMLElement(node) && this.isScrollParent(node)) {
      return node;
    }

    return this.getScrollParent(this.getParentNode(node));
  }

  /*

  given a DOM element, return the list of all scroll parents, up the list of ancesors

  until we get to the top window object. This list is what we attach scroll listeners

  to, because if any of these parent elements scroll, we'll need to re-calculate the

  reference element's position.

  */

  listScrollParents(element: Element, list: [] = []): any {
    let element$ownerDocumentValue;

    if (list === undefined) {
      list = [];
    }
    const scrollParent = this.getScrollParent(element);
    const isBody = scrollParent ===((element$ownerDocumentValue = element.ownerDocument) == null? undefined: element$ownerDocumentValue.body);
    const win = this.getWindow(scrollParent);
    const target = isBody      ? [win].concat(
      win.visualViewport || [],
      this.isScrollParent(scrollParent) ? scrollParent : []
    )      : scrollParent;
    const updatedList = list.concat(target);
    // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    return isBody? updatedList : updatedList.concat(this.listScrollParents(this.getParentNode(target)));
  }

  isTableElement(element: HTMLElement) {
    return ['table', 'td', 'th'].includes(this.getNodeName(element));
  }

  getTrueOffsetParent(element: HTMLElement): any {
    if (
      !this.isHTMLElement(element) ||getComputedStyle(element).position === 'fixed'
    ) {
      return null;
    }

    return element.offsetParent;
  } // `.offsetParent` reports `null` for fixed elements, while absolute elements

  // return the containing block

  getContainingBlock(element: HTMLElement) {
    const isFirefox = (/firefox/i).test(this.getUAString());
    const isIE = (/Trident/i).test(this.getUAString());
    if (isIE && this.isHTMLElement(element)) {
      // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
      const elementCss = getComputedStyle(element);
      if (elementCss.position === 'fixed') {
        return null;
      }
    }
    let currentNode = this.getParentNode(element);
    if (this.isShadowRoot(currentNode)) {
      currentNode = currentNode.host;
    }
    while (
      this.isHTMLElement(currentNode) &&      !['html', 'body'].includes(this.getNodeName(currentNode))
    ) {
      const css = getComputedStyle(currentNode);
      // This is non-exhaustive but covers the most common CSS properties that

      // create a containing block.

      // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

      if (css.transform !== 'none' ||css.perspective !== 'none' ||css.contain === 'paint' ||['transform', 'perspective'].includes(css.willChange) ||(isFirefox && css.willChange === 'filter') ||(isFirefox && css.filter && css.filter !== 'none')) {
        return currentNode;
      }
      currentNode = currentNode.parentNode;
    }
    return null;
  } // Gets the closest ancestor positioned element. Handles some edge cases,

  // such as table ancestors and cross browser bugs.

  getOffsetParent(element: HTMLElement) {
    const window = this.getWindow(element);
    let offsetParent = this.getTrueOffsetParent(element);
    while (
      offsetParent &&      this.isTableElement(offsetParent) &&      getComputedStyle(offsetParent).position === 'static'
    ) {
      offsetParent = this.getTrueOffsetParent(offsetParent);
    }

    if (
      offsetParent &&      (this.getNodeName(offsetParent) === 'html' ||        (this.getNodeName(offsetParent) === 'body' &&          getComputedStyle(offsetParent).position === 'static'))
    ) {
      return window;
    }

    return offsetParent || this.getContainingBlock(element) || window;
  }


  order(modifiers: Record<string, string>[]) {
    const map = new Map();

    const visited = new Set();

    const result: Record<string, any>[] = [];

    modifiers.forEach((modifier) => {
      map.set(modifier['name'], modifier);
    }); // On visiting object, check for its dependencies and visit them recursively

    const sort = (modifier: Record<string, any>) => {
      visited.add(modifier['name']);

      const requires = [].concat(
        modifier['requires'] || [],
        modifier['requiresIfExists'] || []
      );

      requires.forEach((dep) => {
        if (!visited.has(dep)) {
          const depModifier = map.get(dep);

          if (depModifier) {
            sort(depModifier);
          }
        }
      });

      result.push(modifier);
    };

    modifiers.forEach((modifier) => {
      if (!visited.has(modifier['name'])) {
        // check for visited object

        sort(modifier);
      }
    });

    return result;
  }

  orderModifiers(modifiers: Record<string, string>[]) {
    // order based on dependencies

    const orderedModifiers = this.order(modifiers); // order based on phase

    return this.modifierPhases.reduce((acc: any, phase: string) => {
      return acc.concat(
        orderedModifiers.filter((modifier) => {
          return modifier['phase'] === phase;
        })
      );
    }, []);
  }

  debounce(fn: () => object) {
    let pending;

    return () => {
      pending = new Promise((resolve) => {
        Promise.resolve().then(() => {
          pending = undefined;

          resolve(fn());
        });
      });

      return pending;
    };
  }

  mergeByName(modifiers: any[]) {
    const merged = modifiers.reduce((mergedValue, current) => {
      const existing = mergedValue[current.name];

      mergedValue[current.name] = existing        ? {
        ...existing,
        ...current,
        options: { ...existing.options, ...current.options },

        data: { ...existing.data, ...current.data }
      }        : current;

      return mergedValue;
    }, {}); // IE11 does not support Object.values

    return Object.keys(merged).map((key) => {
      return merged[key];
    });
  }

  getViewportRect(element: HTMLElement, strategy: string) {
    const win = this.getWindow(element);

    const html = this.getDocumentElement(element);

    const visualViewport = win.visualViewport;

    let width = html.clientWidth;

    let height = html.clientHeight;

    let x = 0;

    let y = 0;

    if (visualViewport) {
      width = visualViewport.width;

      height = visualViewport.height;

      const layoutViewport = this.isLayoutViewport();

      if (layoutViewport || (!layoutViewport && strategy === 'fixed')) {
        x = visualViewport.offsetLeft;

        y = visualViewport.offsetTop;
      }
    }

    return {
      width: width,

      height: height,

      x: x + this.getWindowScrollBarX(element),

      y: y
    };
  }

  // of the `<html>` and `<body>` rect bounds if horizontally scrollable

  getDocumentRect(element: HTMLElement) {
    let element$ownerDocumentValues;

    const html = this.getDocumentElement(element);

    const winScroll = this.getWindowScroll(element);

    const body =      (element$ownerDocumentValues = element.ownerDocument) == null? undefined: element$ownerDocumentValues.body;

    const width = this.max(
      html.scrollWidth,
      html.clientWidth,
      body ? body.scrollWidth : 0,
      body ? body.clientWidth : 0
    );

    const height = this.max(
      html.scrollHeight,
      html.clientHeight,
      body ? body.scrollHeight : 0,
      body ? body.clientHeight : 0
    );

    let x = -winScroll.scrollLeft + this.getWindowScrollBarX(element);

    const y = -winScroll.scrollTop;

    if (this.getComputedStyle(body || html).direction === 'rtl') {
      x += this.max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }

    return {
      width: width,

      height: height,

      x: x,

      y: y
    };
  }

  contains(parent: HTMLElement, child: Element) {
    const rootNode: any = child.getRootNode?.(); // First, attempt with faster native method
    // then fallback to custom implementation with Shadow DOM support
    if (parent.contains(child)) {
      return true;
    } else if (rootNode && this.isShadowRoot(rootNode)) {
      let next: any = child;

      do {
        if (next && parent.isSameNode(next)) {
          return true;
        } // $FlowFixMe[prop-missing]: need a better way to handle this...

        next = next.parentNode || next.host;
      } while (next);
    } // Give up, the result is false

    return false;
  }

  rectToClientRect(rect: Record<string, any>) {
    return {
      ...rect,
      left: rect['x'],

      top: rect['y'],

      right: rect['x'] + rect['width'],

      bottom: rect['y'] + rect['height']
    };
  }

  getInnerBoundingClientRect(element: HTMLElement, strategy: string) {
    const rect = this.getBoundingClientRect(
      element,
      false,
      strategy === 'fixed'
    );

    rect.top = rect.top + element.clientTop;

    rect.left = rect.left + element.clientLeft;

    rect.bottom = rect.top + element.clientHeight;

    rect.right = rect.left + element.clientWidth;

    rect.width = element.clientWidth;

    rect.height = element.clientHeight;

    rect.x = rect.left;

    rect.y = rect.top;

    return rect;
  }

  getClientRectFromMixedType(
    element: HTMLElement,
    clippingParent: any,
    strategy: string
  ) {
    return clippingParent === this.viewport      ? this.rectToClientRect(this.getViewportRect(element, strategy))      : this.isElement(clippingParent)      ? this.getInnerBoundingClientRect(clippingParent, strategy)      : this.rectToClientRect(
      this.getDocumentRect(this.getDocumentElement(element))
    );
  } // A "clipping parent" is an overflowable container with the characteristic of

  // clipping (or hiding) overflowing elements with a position different from

  // `initial`

  getClippingParents(element: HTMLElement) {
    const clippingParents = this.listScrollParents(this.getParentNode(element));

    const canEscapeClipping = ['absolute', 'fixed'].includes(
      this.getComputedStyle(element).position
    );

    const clipperElement =      canEscapeClipping && this.isHTMLElement(element)        ? this.getOffsetParent(element)        : element;

    if (!this.isElement(clipperElement)) {
      return [];
    } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414

    return clippingParents.filter((clippingParent: HTMLElement) => {
      return (
        this.isElement(clippingParent) &&        this.contains(clippingParent, clipperElement) &&        this.getNodeName(clippingParent) !== 'body'
      );
    });
  } // Gets the maximum area that the element is visible in due to any number of

  // clipping parents

  getClippingRect(
    element: HTMLElement,
    boundary: string,
    rootBoundary: string,
    strategy: string
  ) {
    const mainClippingParents =      boundary === 'clippingParents'        ? this.getClippingParents(element)        : ([] as string[]).concat(boundary);

    const clippingParents = ([] as string[]).concat(mainClippingParents, [
      rootBoundary
    ]);

    const firstClippingParent = clippingParents[0];

    const clippingRect: any = clippingParents.reduce(
      (accRect, clippingParent) => {
        const rect = this.getClientRectFromMixedType(
          element,
          clippingParent,
          strategy
        );

        accRect.top = this.max(rect.top, accRect.top);

        accRect.right = this.min(rect.right, accRect.right);

        accRect.bottom = this.min(rect.bottom, accRect.bottom);

        accRect.left = this.max(rect.left, accRect.left);

        return accRect;
      },
      this.getClientRectFromMixedType(element, firstClippingParent, strategy)
    );

    clippingRect.width = clippingRect.right - clippingRect.left;

    clippingRect.height = clippingRect.bottom - clippingRect.top;

    clippingRect.x = clippingRect.left;

    clippingRect.y = clippingRect.top;

    return clippingRect;
  }

  getBasePlacement(placement: string) {
    return placement.split('-')[0];
  }

  getVariation(placement: string) {
    return placement.split('-')[1];
  }

  getMainAxisFromPlacement(placement: string) {
    return ['top', 'bottom'].includes(placement) ? 'x' : 'y';
  }

  computeOffsets(_ref: Record<string, any>) {
    const reference = _ref['reference'],
      element = _ref['element'],
      placement = _ref['placement'];

    const basePlacement = placement ? this.getBasePlacement(placement) : null;

    const letiation = placement ? this.getVariation(placement) : null;

    const commonX = reference.x + (reference.width / 2) - (element.width / 2);

    const commonY = reference.y + (reference.height / 2) -( element.height / 2);

    let offsets: Record<string, any>;

    switch (basePlacement) {
    case this.top:
      offsets = {
        x: commonX,

        y: reference.y - element.height
      };

      break;

    case this.bottom:
      offsets = {
        x: commonX,

        y: reference.y + reference.height
      };

      break;

    case this.right:
      offsets = {
        x: reference.x + reference.width,

        y: commonY
      };

      break;

    case this.left:
      offsets = {
        x: reference.x - element.width,

        y: commonY
      };

      break;

    default:
      offsets = {
        x: reference.x,

        y: reference.y
      };
    }

    const mainAxis = basePlacement      ? this.getMainAxisFromPlacement(basePlacement)      : null;

    if (mainAxis != null) {
      const len = mainAxis === 'y' ? 'height' : 'width';

      switch (letiation) {
      case this.start:
        offsets[mainAxis] =            offsets[mainAxis] - ((reference[len] / 2) - (element[len] / 2));

        break;

      case this.end:
        offsets[mainAxis] =            offsets[mainAxis] + ((reference[len] / 2) - (element[len] / 2));

        break;
      }
    }


    return offsets;
  }

  getFreshSideObject() {
    return {
      top: 0,

      right: 0,

      bottom: 0,

      left: 0
    };
  }

  mergePaddingObject(paddingObject: Record<string, any>) {
    return { ...this.getFreshSideObject(), ...paddingObject };
  }

  expandToHashMap(value: string | number, keys: []) {
    return keys.reduce((hashMap: Record<string, any>, key: string) => {
      hashMap[key] = value;

      return hashMap;
    }, {});
  }

  detectOverflow(state: Record<string, any>, options: Record<string, any>) {
    if (options === undefined) {
      options = {};
    }

    const optionsValue: any = options,
      options$placementValue = optionsValue.placement,
      placement =        options$placementValue === undefined          ? state['placement']          : options$placementValue,
      options$strategyValue = optionsValue.strategy,
      strategy =        options$strategyValue === undefined ? state['strategy'] : options$strategyValue,
      options$boundaryValue = optionsValue.boundary,
      boundary =        options$boundaryValue === undefined          ? this.clippingParents          : options$boundaryValue,
      options$rootBoundaryValue = optionsValue.rootBoundary,
      rootBoundary =        options$rootBoundaryValue === undefined          ? this.viewport          : options$rootBoundaryValue,
      options$elementContentValue = optionsValue.elementContext,
      elementContext =        options$elementContentValue === undefined          ? this.popper          : options$elementContentValue,
      options$altBoundaryValue = optionsValue.altBoundary,
      altBoundary =        options$altBoundaryValue === undefined ? false : options$altBoundaryValue,
      options$paddingValue = optionsValue.padding,
      padding = options$paddingValue === undefined ? 0 : options$paddingValue;

    const paddingObject = this.mergePaddingObject(
      typeof padding !== 'number'        ? padding        : this.expandToHashMap(padding, this.basePlacements)
    );

    const altContext =      elementContext === this.popper ? this.reference : this.popper;

    const popperRect = state['rects'].popper;

    const element =      state['elements'][altBoundary ? altContext : elementContext];

    const clippingClientRect = this.getClippingRect(
      this.isElement(element)        ? element        : element.contextElement ||            this.getDocumentElement(state['elements'].popper),
      boundary,
      rootBoundary,
      strategy
    );

    const referenceClientRect = this.getBoundingClientRect(
      state['elements'].reference
    );

    const popperOffsets = this.computeOffsets({
      reference: referenceClientRect,

      element: popperRect,

      strategy: 'absolute',

      placement: placement
    });

    const popperClientRect = this.rectToClientRect({
      ...popperRect,
      ...popperOffsets
    });

    const elementClientRect =      elementContext === this.popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect

    // 0 or negative = within the clipping rect

    const overflowOffsets: Record<string, any> = {
      top: clippingClientRect.top - elementClientRect.top + paddingObject.top,

      bottom:
        elementClientRect.bottom -        clippingClientRect.bottom +        paddingObject.bottom,

      left:
        clippingClientRect.left - elementClientRect.left + paddingObject.left,

      right:
        elementClientRect.right -        clippingClientRect.right +        paddingObject.right
    };

    const offsetData = state['modifiersData'].offset; // Offsets can be applied only to the popper element

    if (elementContext === this.popper && offsetData) {
      const offset = offsetData[placement];

      Object.keys(overflowOffsets).forEach((key) => {
        const multiply = [this.right, this.bottom].includes(key) ? 1 : -1;

        const axis = [this.top, this.bottom].includes(key) ? 'y' : 'x';

        overflowOffsets[key] += offset[axis] * multiply;
      });
    }

    return overflowOffsets;
  }



  areValidElements(elememts: any = []) {
    const lengthOfElement = elememts.length;

    const args = new Array(lengthOfElement);

    let keyNumber = 0;

    for (let lenOfKeys = elememts.length; keyNumber < lenOfKeys; keyNumber++) {
      args[keyNumber] = elememts[keyNumber];
    }

    return !args.some((element) => {
      return !(element && typeof element.getBoundingClientRect === 'function');
    });
  }


  public effectCleanupFns: any = [];

  cleanupModifierEffects() {
    this.effectCleanupFns.forEach((fn: any) => {
      return fn();
    });

    this.effectCleanupFns = [];
  }

  runModifierEffects() {
    this.state.orderedModifiers.forEach((_ref: any) => {
      const name = _ref.name,
        ref$optionsValues = _ref.options,
        options = ref$optionsValues === undefined ? {} : ref$optionsValues,
        effect = _ref.effect;

      if (typeof effect === 'function') {
        const cleanupFn = effect({
          state: this.state,

          name: name,

          instance: this.instance,

          options: options
        });

        const noopFn = () => {};

        this.effectCleanupFns.push(cleanupFn || noopFn);
      }
    });
  }

  createPopper(
    reference: Element | any,
    popper: Element | any,
    options: any = undefined
  ) {
    const generatorOptionsValues: any = { defaultModifiers: this.defaultModifiers, defaultOptions: options},
      generatorOptions$defValue = generatorOptionsValues?.['defaultModifiers'],
      defaultModifiers =        generatorOptions$defValue === undefined ? [] : generatorOptions$defValue,
      generatorOptions$def2Value = generatorOptionsValues?.['defaultOptions'],
      defaultOptions =        generatorOptions$def2Value === undefined          ? this.defaultOptionsValues          : generatorOptions$def2Value;

    if (options === undefined) {
      options = defaultOptions;
    }
    this.state = {
      placement: 'bottom',

      orderedModifiers: [],

      options: { ...this.defaultOptionsValues, ...defaultOptions },

      modifiersData: {},

      elements: {
        reference: reference,
        popper: popper
      },

      attributes: {},

      styles: {}
    };

    let isDestroyed = false;

    const setOptions = (setOptionsAction: any) => {
      const optionsValues =        typeof setOptionsAction === 'function'? setOptionsAction(this.state.options): setOptionsAction;

      this.cleanupModifierEffects();

      this.state.options = {
        ...defaultOptions,
        ...this.state.options,
        ...optionsValues
      };

      this.state.scrollParents = {
        reference: this.isElement(reference)? this.listScrollParents(reference): reference.contextElement? this.listScrollParents(reference.contextElement): [],

        popper: this.listScrollParents(popper)
      }; // Orders the modifiers based on their dependencies and `phase`

      // properties

      const orderedModifiers = this.orderModifiers(
        this.mergeByName(
          [].concat(defaultModifiers, this.state.options.modifiers)
        )
      ); // Strip out disabled modifiers

      this.state.orderedModifiers = orderedModifiers.filter(
        (m: { enabled: boolean }) => {
          return m.enabled;
        }
      );

      this.runModifierEffects();

      return this.instance.update();
    };

    const forceUpdate = () => {
      if (isDestroyed) {
        return;
      }

      const state$elementsValues = this.state.elements,
        referenceValues = state$elementsValues.reference,
        popperValues = state$elementsValues.popper; // Don't proceed if `reference` or `popper` are not valid elements

      // anymore

      if (!this.areValidElements([referenceValues, popperValues])) {
        return;
      } // Store the reference and popper rects to be read by modifiers

      this.state.rects = {
        reference: this.getCompositeRect(
          referenceValues,
          this.getOffsetParent(popperValues),
          this.state.options.strategy === 'fixed'
        ),

        popper: this.getLayoutRect(popperValues)
      }; // Modifiers have the ability to reset the current update cycle. The

      // most common use case for this is the `flip` modifier changing the

      // placement, which then needs to re-run all the modifiers, because the

      // logic was previously ran for the previous placement and is therefore

      // stale/incorrect

      this.state.reset = false;

      this.state.placement = this.state.options.placement; // On each update cycle, the `modifiersData` property for each modifier

      // is filled with the initial data specified by the modifier. This means

      // it doesn't persist and is fresh on each update.

      // To ensure persistent data, use `${name}#persistent`

      this.state.orderedModifiers.forEach((modifier: Record<string, any>) => {
        return (this.state.modifiersData[modifier['name']] = {
          ...modifier['data']
        });
      });

      for (let index = 0; index < this.state.orderedModifiers.length; index++) {
        if (this.state.reset === true) {
          this.state.reset = false;
          index = -1;
          continue;
        }

        const state$orderedModifiedficationValue = this.state.orderedModifiers[index],
          fn = state$orderedModifiedficationValue.fn,
          state$orderedModified2Value = state$orderedModifiedficationValue.options,
          optionsValueElements =state$orderedModified2Value === undefined ? {} : state$orderedModified2Value,
          name = state$orderedModifiedficationValue.name;

        if (typeof fn === 'function') {

          this.state =            fn({
            state: this.state,

            options: optionsValueElements,

            name: name,

            instance: this.instance
          }) || this.state;
        }
      }
    };

    const destroy = () => {
      this.cleanupModifierEffects();

      isDestroyed = true;
    };

    this.instance = {
      state: this.state,

      setOptions: setOptions,

      // Sync update – it will always be executed, even if not necessary. This

      // is useful for low frequency updates where sync behavior simplifies the

      // logic.

      // For high frequency updates (e.g. `resize` and `scroll` events), always

      // prefer the async Popper#update method

      forceUpdate: forceUpdate,

      // Async and optimistically optimized update – it will not be executed if

      // not necessary (debounced to run at most once-per-tick)

      update: this.debounce(() => {
        return new Promise((resolve) => {
          this.instance.forceUpdate();

          resolve(this.state);
        });
      }),

      destroy: destroy
    };


    if (!this.areValidElements([reference, popper])) {
      return this.instance;
    }

    this.instance.setOptions(options).then((state: any) => {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state);
      }
    }); // Modifiers have the ability to execute arbitrary code before the first

    // update cycle runs. They will be executed in the same order as the update

    // cycle. This is useful when a modifier adds some persistent data that

    // other modifiers need to use, but the modifier is run after the dependent

    // one.

    return this.instance;
  }


  effect$2(_ref: any) {
    const passive = {
      passive: true
    };

    this.state = _ref.state;

    this.instance = _ref.instance;

    this.options = _ref.options;

    const options$scrollValue = this.options.scroll,
      scroll = options$scrollValue === undefined ? true : options$scrollValue,
      options$resizeValues = this.options.resize,
      resize = options$resizeValues === undefined ? true : options$resizeValues;
    const window = this.getWindow(this.state?.elements?.popper);

    const scrollParents = ([] as any[]).concat(
      this.state.scrollParents.reference,
      this.state.scrollParents.popper
    );

    if (scroll) {
      scrollParents.forEach((scrollParent) => {
        scrollParent.addEventListener('scroll', this.instance.update, passive);
      });
    }

    if (resize) {
      window.addEventListener('resize', this.instance.update, passive);
    }

    return () => {
      if (scroll) {
        scrollParents.forEach((scrollParent) => {
          scrollParent.removeEventListener(
            'scroll',
            this.instance.update,
            passive
          );
        });
      }

      if (resize) {
        window.removeEventListener('resize', this.instance.update, passive);
      }
    };
  }

  public eventListeners = {
    name: 'eventListeners',

    enabled: true,

    phase: 'write',

    fn: () => {},

    effect: (data: any = {}) => this.effect$2(data),

    data: {}
  };

  popperOffsets(_ref: any) {
    this.state = _ref.state;

    const name = _ref.name;

    // Offsets are the actual position the popper needs to have to be

    // properly positioned near its reference element

    // This is the most basic placement, and will be adjusted by

    // the modifiers in the next step

    this.state.modifiersData[name] = this.computeOffsets({
      reference: this.state.rects.reference,

      element: this.state.rects.popper,

      strategy: 'absolute',

      placement: this.state.placement
    });
  }

  public popperOffsets$1 = {
    name: 'popperOffsets',

    enabled: true,

    phase: 'read',

    fn: (data: any) => {
      this.popperOffsets(data);
    },

    data: {}
  };

  public unsetSides = {
    top: 'auto',

    right: 'auto',

    bottom: 'auto',

    left: 'auto'
  }; // Round the offsets to the nearest suitable subpixel based on the DPR.

  // Zooming can change the DPR, but it seems to report a value that will

  // cleanly divide the values into the appropriate subpixels.

  roundOffsetsByDPR(_ref: any, win: any) {
    const x = _ref.x,
      y = _ref.y;

    const dpr = win.devicePixelRatio || 1;

    return {
      x: this.round(x * dpr) / dpr || 0,

      y: this.round(y * dpr) / dpr || 0
    };
  }

  mapToStyles(_ref2: any) {
    let object$assign2Values: any;

    const popper = _ref2.popper,
      popperRect = _ref2.popperRect,
      placement = _ref2.placement,
      letiation = _ref2.letiation,
      offsets = _ref2.offsets,
      position = _ref2.position,
      gpuAcceleration = _ref2.gpuAcceleration,
      adaptive = _ref2.adaptive,
      roundOffsets = _ref2.roundOffsets,
      isFixed = _ref2.isFixed;

    const offsets$xValue = offsets.x;
    let  x = offsets$xValue === undefined ? 0 : offsets$xValue;
    const  offsets$yValue = offsets.y;
    let  y = offsets$yValue === undefined ? 0 : offsets$yValue;

    const ref3Value =      typeof roundOffsets === 'function'        ? roundOffsets({
      x: x,

      y: y
    })        : {
      x: x,

      y: y
    };

    x = ref3Value.x;

    y = ref3Value.y;

    const hasX = offsets.hasOwnProperty('x');

    const hasY = offsets.hasOwnProperty('y');

    let sideX = this.left;

    let sideY = this.top;

    const win = window;

    if (adaptive) {
      let offsetParent = this.getOffsetParent(popper);

      let heightProp = 'clientHeight';

      let widthProp = 'clientWidth';

      if (offsetParent === this.getWindow(popper)) {
        offsetParent = this.getDocumentElement(popper);

        if (
          getComputedStyle(offsetParent).position !== 'static' &&          position === 'absolute'
        ) {
          heightProp = 'scrollHeight';

          widthProp = 'scrollWidth';
        }
      } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it

      offsetParent = offsetParent;

      if (
        placement === this.top ||        ((placement === this.left || placement === this.right) &&          letiation === this.end)
      ) {
        sideY = this.bottom;

        const offsetY =          isFixed && offsetParent === win && win.visualViewport            ? win.visualViewport.height          : offsetParent[heightProp];

        y -= offsetY - popperRect.height;

        y *= gpuAcceleration ? 1 : -1;
      }

      if (
        placement === this.left ||        ((placement === this.top || placement === this.bottom) &&          letiation === this.end)
      ) {
        sideX = this.right;

        const offsetX =          isFixed && offsetParent === win && win.visualViewport            ? win.visualViewport.width          : offsetParent[widthProp];

        x -= offsetX - popperRect.width;

        x *= gpuAcceleration ? 1 : -1;
      }
    }

    const commonStyles = {
      position: position,
      ...(adaptive && this.unsetSides)
    };

    const ref4Value =      roundOffsets === true        ? this.roundOffsetsByDPR(
      {
        x: x,

        y: y
      },
      this.getWindow(popper)
    )        : {
      x: x,

      y: y
    };

    x = ref4Value.x;

    y = ref4Value.y;

    if (gpuAcceleration) {
      let object$assignValue: any;

      return {
        ...commonStyles,
        ...((object$assignValue = {}),
        (object$assignValue[sideY] = hasY ? '0' : ''),
        (object$assignValue[sideX] = hasX ? '0' : ''),
        (object$assignValue.transform =          (win.devicePixelRatio || 1) <= 1            ? `translate(${x}px, ${y}px)`            : `translate3d(${x}px, ${y}px, 0)`),
        object$assignValue)
      };
    }

    return {
      ...commonStyles,
      ...((object$assign2Values = {}),
      (object$assign2Values[sideY] = hasY ? `${y}px` : ''),
      (object$assign2Values[sideX] = hasX ? `${x}px` : ''),
      (object$assign2Values.transform = ''),
      object$assign2Values)
    };
  }

  computeStyles(_ref5: any) {

    this.state = _ref5.state;

    const options = _ref5.options;

    const options$gpuAccelerateValue = options.gpuAcceleration,
      gpuAcceleration =        options$gpuAccelerateValue === undefined ? true : options$gpuAccelerateValue,
      options$adaptiveValue = options.adaptive,
      adaptive = options$adaptiveValue === undefined ? true : options$adaptiveValue,
      options$roundOffsetsValue = options.roundOffsets,
      roundOffsets =options$roundOffsetsValue === undefined ? true : options$roundOffsetsValue;

    const commonStyles = {
      placement: this.getBasePlacement(this.state.placement),

      letiation: this.getVariation(this.state.placement),

      popper: this.state.elements.popper,

      popperRect: this.state.rects.popper,

      gpuAcceleration: gpuAcceleration,

      isFixed: this.state.options.strategy === 'fixed'
    };

    if (this.state.modifiersData.popperOffsets != null) {
      this.state.styles.popper = {
        ...this.state.styles.popper,
        ...this.mapToStyles({
          ...commonStyles,
          offsets: this.state.modifiersData.popperOffsets,

          position: this.state.options.strategy,

          adaptive: adaptive,

          roundOffsets: roundOffsets
        })
      };
    }

    if (this.state.modifiersData.arrow != null) {
      this.state.styles.arrow = {
        ...this.state.styles.arrow,
        ...this.mapToStyles({
          ...commonStyles,
          offsets: this.state.modifiersData.arrow,

          position: 'absolute',

          adaptive: false,

          roundOffsets: roundOffsets
        })
      };
    }

    this.state.attributes.popper = {
      ...this.state.attributes.popper,
      'data-popper-placement': this.state.placement
    };
  }

  public computeStyles$1 = {
    name: 'computeStyles',

    enabled: true,

    phase: 'beforeWrite',

    fn: (data: any) => {
      this.computeStyles(data);
    },

    data: {}
  };

  // and applies them to the HTMLElements such as popper and arrow

  applyStyles(_ref: any) {
    this.state = _ref.state;

    Object.keys(this.state.elements).forEach((name) => {
      const style = this.state.styles[name] || {};

      const attributes = this.state.attributes[name] || {};

      const element = this.state.elements[name]; // arrow is optional + virtual elements

      if (!this.isHTMLElement(element) || !this.getNodeName(element)) {
        return;
      } // Flow doesn't support to extend this property, but it's the most

      // effective way to apply styles to an HTMLElement

      // $FlowFixMe[cannot-write]

      Object.assign(element.style, style);

      Object.keys(attributes).forEach((nameValue: any) => {
        const value = attributes[nameValue];

        if (value === false) {
          element.removeAttribute(nameValue);
        } else {
          element.setAttribute(nameValue, value === true ? '' : value);
        }
      });
    });
  }

  effect$1(_ref2: any) {
    this.state = _ref2.state;

    const initialStyles:
      | {
          popper: {
            position: any;

            left: string;

            top: string;

            margin: string;
          };

          arrow: {
            position: string;
          };

          reference: object;
        }
      | any = {
        popper: {
          position: this.state.options.strategy,

          left: '0',

          top: '0',

          margin: '0'
        },

        arrow: {
          position: 'absolute'
        },

        reference: {}
      };

    Object.assign(this.state.elements.popper.style, initialStyles.popper);

    this.state.styles = initialStyles;

    if (this.state.elements.arrow) {
      Object.assign(this.state.elements.arrow.style, initialStyles.arrow);
    }

    return () => {
      Object.keys(this.state.elements).forEach((name: string) => {
        const element = this.state.elements[name];

        const attributes = this.state.attributes[name] || {};

        const styleProperties = Object.keys(
          this.state.styles.hasOwnProperty(name)            ? this.state.styles[name]            : initialStyles[name]
        ); // Set all values to an empty string to unset them

        const style = styleProperties.reduce(
          (style: Record<string, any>, property: string) => {
            style[property] = '';

            return style;
          },
          {}
        ); // arrow is optional + virtual elements

        if (!this.isHTMLElement(element) || !this.getNodeName(element)) {
          return;
        }

        Object.assign(element.style, style);

        Object.keys(attributes).forEach((attribute) => {
          element.removeAttribute(attribute);
        });
      });
    };
  }

  public applyStyles$1 = {
    name: 'applyStyles',

    enabled: true,

    phase: 'write',

    fn: (data: any) => {
      this.applyStyles(data);
    },

    effect: (data: any = {}) => this.effect$1(data),

    requires: ['computeStyles']
  };

  distanceAndSkiddingToXY(placement: string, rects: any, offset: any) {
    const basePlacement = this.getBasePlacement(placement);

    const invertDistance = [this.left, this.top].includes(basePlacement)      ? -1      : 1;

    const refValueNew =        typeof offset === 'function'          ? offset({ ...rects, placement: placement })          : offset;
    let  skidding = refValueNew[0];
    let  distance = refValueNew[1];

    skidding = skidding || 0;

    distance = (distance || 0) * invertDistance;

    return [this.left, this.right].includes(basePlacement)      ? {
      x: distance,

      y: skidding
    }      : {
      x: skidding,

      y: distance
    };
  }

  offset(_ref2: any) {
    this.state = _ref2.state;

    const options = _ref2.options,
      name = _ref2.name;

    const options$offsetValue = options.offset,
      offset = options$offsetValue === undefined ? [0, 0] : options$offsetValue;

    const data = this.placements.reduce(
      (acc: Record<string, any>, placement: string) => {
        acc[placement] = this.distanceAndSkiddingToXY(
          placement,
          this.state.rects,
          offset
        );

        return acc;
      },
      {}
    );

    const data$state$placementValue = data[this.state.placement],
      x = data$state$placementValue.x,
      y = data$state$placementValue.y;

    if (this.state.modifiersData.popperOffsets != null) {
      this.state.modifiersData.popperOffsets.x += x;

      this.state.modifiersData.popperOffsets.y += y;
    }

    this.state.modifiersData[name] = data;
  }

  public offset$1 = {
    name: 'offset',

    enabled: true,

    phase: 'main',

    requires: ['popperOffsets'],

    fn: (data: any) => {
      this.offset(data);
    }
  };

  public hash$1: any = {
    left: 'right',

    right: 'left',

    bottom: 'top',

    top: 'bottom'
  };

  getOppositePlacement(placement: string) {
    return placement.replace(/left|right|bottom|top/g, (matched: string) => {
      return this.hash$1[matched];
    });
  }

  public hash: any = {
    start: 'end',

    end: 'start'
  };

  getOppositeLetiationPlacement(placement: string) {
    return placement.replace(/start|end/g, (matched) => {
      return this.hash[matched];
    });
  }

  computeAutoPlacement(state: any, options: any) {
    if (options === undefined) {
      options = {};
    }

    const optionsValues = options,
      placement = optionsValues.placement,
      boundary = optionsValues.boundary,
      rootBoundary = optionsValues.rootBoundary,
      padding = optionsValues.padding,
      flipLetiations = optionsValues.flipLetiations,
      options$allowedAutoPValues = optionsValues.allowedAutoPlacements,
      allowedAutoPlacements =        options$allowedAutoPValues === undefined          ? this.placements          : options$allowedAutoPValues;

    const letiation = this.getVariation(placement);

    const placements$1 = letiation      ? flipLetiations        ? this.variationPlacements        : this.variationPlacements.filter((placementValues: any) => {
      return this.getVariation(placementValues) === letiation;
    })      : this.basePlacements;

    let allowedPlacements = placements$1.filter((placementVal: any) => {
      return allowedAutoPlacements.indexOf(placementVal) >= 0;
    });

    if (allowedPlacements.length === 0) {
      allowedPlacements = placements$1;
    } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...

    const overflows = allowedPlacements.reduce(
      (acc: any, placementNewVal: string) => {
        acc[placementNewVal] = this.detectOverflow(state, {
          placement: placementNewVal,

          boundary: boundary,

          rootBoundary: rootBoundary,

          padding: padding
        })[this.getBasePlacement(placementNewVal)];

        return acc;
      },
      {}
    );

    return Object.keys(overflows).sort((a, b) => {
      return overflows[a] - overflows[b];
    });
  }

  getExpandedFallbackPlacements(placement: any) {
    if (this.getBasePlacement(placement) === this.auto) {
      return [];
    }

    const oppositePlacement = this.getOppositePlacement(placement);

    return [
      this.getOppositeLetiationPlacement(placement),
      oppositePlacement,
      this.getOppositeLetiationPlacement(oppositePlacement)
    ];
  }

  flip(_ref: any) {
    this.state = _ref.state;

    const options = _ref.options,
      name = _ref.name;

    if (this.state.modifiersData[name]._skip) {
      return;
    }

    const options$mainAxisValue = options.mainAxis,
      checkMainAxis =        options$mainAxisValue === undefined ? true : options$mainAxisValue,
      options$altAxisValue = options.altAxis,
      checkAltAxis = options$altAxisValue === undefined ? true : options$altAxisValue,
      specifiedFallbackPlacements = options.fallbackPlacements,
      padding = options.padding,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      options$flipLetiatioValues = options.flipLetiations,
      flipLetiations =        options$flipLetiatioValues === undefined ? true : options$flipLetiatioValues,
      allowedAutoPlacements = options.allowedAutoPlacements;

    const preferredPlacement = this.state.options.placement;

    const basePlacement = this.getBasePlacement(preferredPlacement);

    const isBasePlacement = basePlacement === preferredPlacement;

    const fallbackPlacements =      specifiedFallbackPlacements ||      (isBasePlacement || !flipLetiations        ? [this.getOppositePlacement(preferredPlacement)]        : this.getExpandedFallbackPlacements(preferredPlacement));

    const placements = [preferredPlacement]
      .concat(fallbackPlacements)
      .reduce((acc, placement) => {
        return acc.concat(
          this.getBasePlacement(placement) === this.auto            ? this.computeAutoPlacement(this.state, {
            placement: placement,

            boundary: boundary,

            rootBoundary: rootBoundary,

            padding: padding,

            flipLetiations: flipLetiations,

            allowedAutoPlacements: allowedAutoPlacements
          })            : placement
        );
      }, []);

    const referenceRect = this.state.rects.reference;

    const popperRect = this.state.rects.popper;

    const checksMap = new Map();

    let makeFallbackChecks = true;

    let firstFittingPlacement = placements[0];

    for (const placement of placements ) {

      const basePlacementValue = this.getBasePlacement(placement);

      const isStartLetiation = this.getVariation(placement) === this.start;

      const isVertical = [this.top, this.bottom].includes(basePlacementValue);

      const len = isVertical ? 'width' : 'height';

      const overflow = this.detectOverflow(this.state, {
        placement: placement,

        boundary: boundary,

        rootBoundary: rootBoundary,

        altBoundary: altBoundary,

        padding: padding
      });

      let mainLetiationSide = isVertical        ? isStartLetiation          ? this.right          : this.left        : isStartLetiation        ? this.bottom        : this.top;

      if (referenceRect[len] > popperRect[len]) {
        mainLetiationSide = this.getOppositePlacement(mainLetiationSide);
      }

      const altLetiationSide = this.getOppositePlacement(mainLetiationSide);

      const checks = [];

      if (checkMainAxis) {
        checks.push(overflow[basePlacementValue] <= 0);
      }

      if (checkAltAxis) {
        checks.push(
          overflow[mainLetiationSide] <= 0,
          overflow[altLetiationSide] <= 0
        );
      }

      if (
        checks.every((check) => {
          return check;
        })
      ) {
        firstFittingPlacement = placement;

        makeFallbackChecks = false;

        break;
      }

      checksMap.set(placement, checks);
    }

    if (makeFallbackChecks) {
      // `2` may be desired in some cases – research later

      const numberOfChecks = flipLetiations ? 3 : 1;

      const loopCheck = (index: any) => {
        const fittingPlacement = placements.find((placement: any) => {
          const checks = checksMap.get(placement);

          if (checks) {
            return checks.slice(0, index).every((check: any) => {
              return check;
            });
          }
        });

        if (fittingPlacement) {
          firstFittingPlacement = fittingPlacement;

          return 'break';
        }

        return;
      };

      for (let indexValue = numberOfChecks; indexValue > 0; indexValue--) {
        const retValues = loopCheck(indexValue);

        if (retValues === 'break') {
          break;
        }
      }
    }

    if (this.state.placement !== firstFittingPlacement) {
      this.state.modifiersData[name]._skip = true;

      this.state.placement = firstFittingPlacement;

      this.state.reset = true;
    }
  }

  public flip$1 = {
    name: 'flip',

    enabled: true,

    phase: 'main',

    fn: (data: any) => {
      this.flip(data);
    },

    requiresIfExists: ['offset'],

    data: {
      _skip: false
    }
  };

  getAltAxis(axis: string) {
    return axis === 'x' ? 'y' : 'x';
  }

  within(min$1: number, value: number, max$1: number) {
    return this.max(min$1, this.min(value, max$1));
  }

  withinMaxClamp(min: number, value: number, max: number) {
    const v = this.within(min, value, max);

    return v > max ? max : v;
  }

  preventOverflow(_ref: any) {
    this.state = _ref.state;

    const options = _ref.options,
      name = _ref.name;

    const options$mainAxisValues = options.mainAxis,
      checkMainAxis =        options$mainAxisValues === undefined ? true : options$mainAxisValues,
      options$altAxisValuesNew = options.altAxis,
      checkAltAxis = options$altAxisValuesNew === undefined ? false : options$altAxisValuesNew,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      padding = options.padding,
      options$tetherValues = options.tether,
      tether = options$tetherValues === undefined ? true : options$tetherValues,
      options$tetherOffsetData = options.tetherOffset,
      tetherOffset =        options$tetherOffsetData === undefined ? 0 : options$tetherOffsetData;

    const overflow = this.detectOverflow(this.state, {
      boundary: boundary,

      rootBoundary: rootBoundary,

      padding: padding,

      altBoundary: altBoundary
    });

    const basePlacement = this.getBasePlacement(this.state.placement);

    const letiation = this.getVariation(this.state.placement);

    const isBasePlacement = !letiation;

    const mainAxis = this.getMainAxisFromPlacement(basePlacement);

    const altAxis = this.getAltAxis(mainAxis);

    const popperOffsets = this.state.modifiersData.popperOffsets;

    const referenceRect = this.state.rects.reference;

    const popperRect = this.state.rects.popper;

    const tetherOffsetValue =      typeof tetherOffset === 'function'        ? tetherOffset({ ...this.state.rects, placement: this.state.placement })        : tetherOffset;

    const normalizedTetherOffsetValue =      typeof tetherOffsetValue === 'number'        ? {
      mainAxis: tetherOffsetValue,

      altAxis: tetherOffsetValue
    }        : {
      mainAxis: 0,

      altAxis: 0,
      ...tetherOffsetValue
    };

    const offsetModifierState = this.state.modifiersData.offset      ? this.state.modifiersData.offset[this.state.placement]      : null;

    const data: any = {
      x: 0,

      y: 0
    };

    if (!popperOffsets) {
      return;
    }

    if (checkMainAxis) {
      let offsetModifierState$Value;

      const mainSide = mainAxis === 'y' ? this.top : this.left;

      const altSide = mainAxis === 'y' ? this.bottom : this.right;

      const len = mainAxis === 'y' ? 'height' : 'width';

      const offset = popperOffsets[mainAxis];

      const min$1 = offset + overflow[mainSide];

      const max$1 = offset - overflow[altSide];

      const additive = tether ? -popperRect[len] / 2 : 0;

      const minLen =        letiation === this.start ? referenceRect[len] : popperRect[len];

      const maxLen =        letiation === this.start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go

      // outside the reference bounds

      const arrowElement = this.state.elements.arrow;

      const arrowRect: any =        tether && arrowElement          ? this.getLayoutRect(arrowElement)          : {
        width: 0,

        height: 0
      };

      const arrowPaddingObject = this.state.modifiersData['arrow#persistent']        ? this.state.modifiersData['arrow#persistent'].padding        : this.getFreshSideObject();

      const arrowPaddingMin = arrowPaddingObject[mainSide];

      const arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want

      // to include its full size in the calculation. If the reference is small

      // and near the edge of a boundary, the popper can overflow even if the

      // reference is not overflowing as well (e.g. virtual elements with no

      // width or height)

      const arrowLen = this.within(0, referenceRect[len], arrowRect[len]);

      const minOffset = isBasePlacement        ? referenceRect[len] / 2 -          additive -          arrowLen -          arrowPaddingMin -          normalizedTetherOffsetValue.mainAxis        : minLen -          arrowLen -          arrowPaddingMin -          normalizedTetherOffsetValue.mainAxis;

      const maxOffset = isBasePlacement        ? -referenceRect[len] / 2 +          additive +          arrowLen +          arrowPaddingMax +          normalizedTetherOffsetValue.mainAxis        : maxLen +          arrowLen +          arrowPaddingMax +          normalizedTetherOffsetValue.mainAxis;

      const arrowOffsetParent =        this.state.elements.arrow &&        this.getOffsetParent(this.state.elements.arrow);

      const clientOffset = arrowOffsetParent        ? mainAxis === 'y'          ? arrowOffsetParent.clientTop || 0          : arrowOffsetParent.clientLeft || 0        : 0;

      const offsetModifierValue =        (offsetModifierState$Value =          offsetModifierState == null            ? undefined            : offsetModifierState[mainAxis]) != null          ? offsetModifierState$Value          : 0;

      const tetherMin = offset + minOffset - offsetModifierValue - clientOffset;

      const tetherMax = offset + maxOffset - offsetModifierValue;

      const preventedOffset = this.within(
        tether ? this.min(min$1, tetherMin) : min$1,
        offset,
        tether ? this.max(max$1, tetherMax) : max$1
      );

      popperOffsets[mainAxis] = preventedOffset;

      data[mainAxis] = preventedOffset - offset;
    }

    if (checkAltAxis) {
      let offsetModifierState$2Values;

      const mainSideValue = mainAxis === 'x' ? this.top : this.left;

      const altSideValue = mainAxis === 'x' ? this.bottom : this.right;

      const valueOfoffset = popperOffsets[altAxis];

      const lengthOfAxis = altAxis === 'y' ? 'height' : 'width';

      const minValue = valueOfoffset + overflow[mainSideValue];

      const maxValue = valueOfoffset - overflow[altSideValue];

      const isOriginSide = [this.top, this.left].includes(basePlacement);

      const offsetModifierValueData =        (offsetModifierState$2Values =          offsetModifierState == null            ? undefined            : offsetModifierState[altAxis]) != null          ? offsetModifierState$2Values          : 0;

      const tetherMinValue = isOriginSide        ? minValue        : valueOfoffset -          referenceRect[lengthOfAxis] -          popperRect[lengthOfAxis] -          offsetModifierValueData +          normalizedTetherOffsetValue.altAxis;

      const tetherMaxValue = isOriginSide        ? valueOfoffset +          referenceRect[lengthOfAxis] +          popperRect[lengthOfAxis] -          offsetModifierValueData -          normalizedTetherOffsetValue.altAxis        : maxValue;

      const preventedOffsetValue =        tether && isOriginSide          ? this.withinMaxClamp(tetherMinValue, valueOfoffset, tetherMaxValue)          : this.within(
        tether ? tetherMinValue : minValue,
        valueOfoffset,
        tether ? tetherMaxValue : maxValue
      );

      popperOffsets[altAxis] = preventedOffsetValue;

      data[altAxis] = preventedOffsetValue - valueOfoffset;
    }

    this.state.modifiersData[name] = data;
  }

  public preventOverflow$1 = {
    name: 'preventOverflow',

    enabled: true,

    phase: 'main',

    fn: (data: any) => {
      this.preventOverflow(data);
    },

    requiresIfExists: ['offset']
  };

  public toPaddingObject = (padding: any, state: any) => {
    padding =      typeof padding === 'function'        ? padding({ ...state.rects, placement: state.placement })        : padding;

    return this.mergePaddingObject(
      typeof padding !== 'number'        ? padding        : this.expandToHashMap(padding, this.basePlacements)
    );
  };

  arrow(_ref: any) {
    let state$modifiersData$Value: any;

    this.state = _ref.state;

    const name = _ref.name,
      options = _ref.options;

    const arrowElement = this.state.elements.arrow;

    const popperOffsets = this.state.modifiersData.popperOffsets;

    const basePlacement = this.getBasePlacement(this.state.placement);

    const axis = this.getMainAxisFromPlacement(basePlacement);

    const isVertical = [this.left, this.right].includes(basePlacement);

    const len = isVertical ? 'height' : 'width';

    if (!arrowElement || !popperOffsets) {
      return;
    }

    const paddingObject: any = this.toPaddingObject(
      options.padding,
      this.state
    );

    const arrowRect: any = this.getLayoutRect(arrowElement);

    const minProp = axis === 'y' ? this.top : this.left;

    const maxProp = axis === 'y' ? this.bottom : this.right;

    const endDiff =      this.state.rects.reference[len] +      this.state.rects.reference[axis] -      popperOffsets[axis] -      this.state.rects.popper[len];

    const startDiff = popperOffsets[axis] - this.state.rects.reference[axis];

    const arrowOffsetParent = this.getOffsetParent(arrowElement);

    const clientSize = arrowOffsetParent      ? axis === 'y'        ? arrowOffsetParent.clientHeight || 0        : arrowOffsetParent.clientWidth || 0      : 0;

    const centerToReference = (endDiff / 2) -( startDiff / 2); // Make sure the arrow doesn't overflow the popper if the center point is

    // outside of the popper bounds

    const min = paddingObject[minProp];

    const max = clientSize - arrowRect[len] - paddingObject[maxProp];

    const center = (clientSize / 2) -( arrowRect[len] / 2) + centerToReference;

    const offset = this.within(min, center, max); // Prevents breaking syntax highlighting...

    const axisProp = axis;

    this.state.modifiersData[name] =      ((state$modifiersData$Value = {}),
    (state$modifiersData$Value[axisProp] = offset),
    (state$modifiersData$Value.centerOffset = offset - center),
    state$modifiersData$Value);
  }

  effect(_ref2: any) {
    this.state = _ref2['state'];

    const options = _ref2?.options;

    const options$elementValue = options.element;
    let  arrowElement =        options$elementValue === undefined          ? '[data-popper-arrow]'          : options$elementValue;

    if (arrowElement == null) {
      return;
    } // CSS selector

    if (typeof arrowElement === 'string') {
      arrowElement = this.state.elements.popper.querySelector(arrowElement);

      if (!arrowElement) {
        return;
      }
    }

    if (!this.contains(this.state.elements.popper, arrowElement)) {
      return;
    }

    this.state.elements.arrow = arrowElement;
  }

  public arrow$1 = {
    name: 'arrow',

    enabled: true,

    phase: 'main',

    fn: (data: any) => {
      this.arrow(data);
    },

    effect: (data: any = {}) => {
      this.effect(data);
    },

    requires: ['popperOffsets'],

    requiresIfExists: ['preventOverflow']
  };

  getSideOffsets(overflow: any, rect: any, preventedOffsets: any = undefined) {
    if (preventedOffsets === undefined) {
      preventedOffsets = {
        x: 0,

        y: 0
      };
    }

    return {
      top: overflow.top - rect.height - preventedOffsets.y,

      right: overflow.right - rect.width + preventedOffsets.x,

      bottom: overflow.bottom - rect.height + preventedOffsets.y,

      left: overflow.left - rect.width - preventedOffsets.x
    };
  }

  isAnySideFullyClipped(overflow: any) {
    return [this.top, this.right, this.bottom, this.left].some((side) => {
      return overflow[side] >= 0;
    });
  }

  hide(_ref: any) {
    this.state = _ref.state;

    const name = _ref.name;

    const referenceRect = this.state.rects.reference;

    const popperRect = this.state.rects.popper;

    const preventedOffsets = this.state.modifiersData.preventOverflow;

    const referenceOverflow = this.detectOverflow(this.state, {
      elementContext: 'reference'
    });

    const popperAltOverflow = this.detectOverflow(this.state, {
      altBoundary: true
    });

    const referenceClippingOffsets = this.getSideOffsets(
      referenceOverflow,
      referenceRect
    );

    const popperEscapeOffsets = this.getSideOffsets(
      popperAltOverflow,
      popperRect,
      preventedOffsets
    );

    const isReferenceHidden = this.isAnySideFullyClipped(
      referenceClippingOffsets
    );

    const hasPopperEscaped = this.isAnySideFullyClipped(popperEscapeOffsets);

    this.state.modifiersData[name] = {
      referenceClippingOffsets: referenceClippingOffsets,

      popperEscapeOffsets: popperEscapeOffsets,

      isReferenceHidden: isReferenceHidden,

      hasPopperEscaped: hasPopperEscaped
    };

    this.state.attributes.popper = {
      ...this.state.attributes.popper,
      'data-popper-reference-hidden': isReferenceHidden,

      'data-popper-escaped': hasPopperEscaped
    };
  }

  public hide$1 = {
    name: 'hide',

    enabled: true,

    phase: 'main',

    requiresIfExists: ['preventOverflow'],

    fn: (data: any) => {
      this.hide(data);
    }
  };

  public defaultModifiers: any = [
    this.eventListeners,
    this.popperOffsets$1,
    this.computeStyles$1,
    this.applyStyles$1,
    this.offset$1,
    this.flip$1,
    this.preventOverflow$1,
    this.arrow$1,
    this.hide$1
  ];


}
