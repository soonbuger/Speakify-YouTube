export interface OverlayOptions {
  position: 'center' | 'bottom-right' | 'bottom-left' | 'random' | 'smart';
  size: number;
  opacity: number;
  flip: boolean;
  smartPosition?: { x: number; y: number };
}

export interface ThumbnailState {
  processed: boolean;
  sourceUrl: string;
  processing: boolean;
  overlayElement?: HTMLImageElement;
}

export interface Settings {
  extensionEnabled: boolean;
  appearChance: number;
  flipChance: number;
  overlayPosition: OverlayOptions['position'];
  overlaySizeMin: number;
  overlaySizeMax: number;
  overlayOpacity: number;
}

export interface RendererInterface {
  createOverlay(imageUrl: string, options: OverlayOptions): HTMLImageElement;
  removeOverlay(element: HTMLElement | null): void;
}
