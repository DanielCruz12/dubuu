declare module "react-signature-canvas" {
  import type { Component } from "react";

  interface SignatureCanvasProps {
    penColor?: string;
    backgroundColor?: string;
    canvasProps?: Record<string, unknown>;
    clearOnResize?: boolean;
    onBegin?: () => void;
    onEnd?: () => void;
    velocityFilterWeight?: number;
    minWidth?: number;
    maxWidth?: number;
    dotSize?: number | (() => number);
  }

  export default class SignatureCanvas extends Component<SignatureCanvasProps> {
    clear(): void;
    isEmpty(): boolean;
    toDataURL(type?: string, encoderOptions?: number): string;
    toData(): Array<Array<{ x: number; y: number; time: number }>>;
    fromData(data: Array<Array<{ x: number; y: number; time: number }>>): void;
    fromDataURL(dataURL: string): void;
    getCanvas(): HTMLCanvasElement;
    getTrimmedCanvas(): HTMLCanvasElement;
  }
}
