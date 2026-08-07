declare module "troika-three-text" {
  import * as THREE from "three";

  export class Text extends THREE.Mesh {
    text: string;
    font: string;
    fontSize: number;
    letterSpacing: number;
    lineHeight: string | number;
    anchorX: string | number;
    anchorY: string | number;
    textAlign: string;
    maxWidth: number;
    color: THREE.ColorRepresentation;
    textRenderInfo?: { blockBounds: [number, number, number, number] };
    sync(callback?: () => void): void;
  }

  export function createTextDerivedMaterial(baseMaterial: THREE.Material): THREE.Material;
}

declare module "troika-three-utils" {
  import * as THREE from "three";

  export function createDerivedMaterial(
    baseMaterial: THREE.Material,
    options: {
      chained?: boolean;
      extensions?: Record<string, boolean>;
      uniforms?: Record<string, { value: unknown }>;
      vertexDefs?: string;
      fragmentDefs?: string;
      customRewriter?: (shaders: { vertexShader: string; fragmentShader: string }) => {
        vertexShader: string;
        fragmentShader: string;
      };
    },
  ): THREE.Material;
}
