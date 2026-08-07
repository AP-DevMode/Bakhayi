import * as THREE from "three";
import { createTextDerivedMaterial } from "troika-three-text";
import { createDerivedMaterial } from "troika-three-utils";

export type IbiTextMaterial = THREE.Material & {
  uniforms: {
    uProgress: { value: number };
    uFrequency: { value: number };
    uAmplitude: { value: number };
    uFontSize: { value: number };
    uNoiseSpeed: { value: number };
    uGlyphDelay: { value: number };
    uWordLength: { value: number };
    uTime: { value: number };
  };
};

const SIMPLEX_FBM = `
vec4 ibiPermute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 ibiTaylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float ibiSimplex(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = ibiPermute(ibiPermute(ibiPermute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = ibiTaylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m *= m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float ibiFbm(vec3 x) {
  float value = 0.0;
  float amplitude = 0.5;
  vec3 shift = vec3(100.0);
  for (int octave = 0; octave < 5; octave++) {
    value += amplitude * ibiSimplex(x);
    x = x * 2.0 + shift;
    amplitude *= 0.5;
  }
  return value;
}
`;

export function createIbiTextMaterial(
  fontSize: number,
  wordLength: number,
  color: THREE.ColorRepresentation = 0xffffff,
): IbiTextMaterial {
  const base = createTextDerivedMaterial(new THREE.MeshBasicMaterial({ color }));
  const material = createDerivedMaterial(base, {
    chained: true,
    extensions: { derivatives: true },
    uniforms: {
      uProgress: { value: 0 },
      uFrequency: { value: 5 },
      uAmplitude: { value: 35 },
      uFontSize: { value: fontSize },
      uNoiseSpeed: { value: 0.5 },
      uGlyphDelay: { value: 0.15 },
      uWordLength: { value: Math.max(wordLength, 1) },
      uTime: { value: 0 },
    },
    customRewriter({ vertexShader, fragmentShader }) {
      vertexShader = `
        uniform float uProgress;
        uniform float uGlyphDelay;
        uniform float uWordLength;
        varying float vIbiProgress;
        ${vertexShader}
      `;

      fragmentShader = `
        uniform float uFrequency;
        uniform float uAmplitude;
        uniform float uFontSize;
        uniform float uNoiseSpeed;
        uniform float uTime;
        varying float vIbiProgress;
        ${SIMPLEX_FBM}
        ${fragmentShader}
      `;

      vertexShader = vertexShader.replace(
        "vTroikaTextureChannel = mod(aTroikaGlyphIndex, 4.0);",
        `vTroikaTextureChannel = mod(aTroikaGlyphIndex, 4.0);
        float ibiDelay = (float(gl_InstanceID) / max(uWordLength, 1.0)) - uGlyphDelay;
        float ibiProgress = clamp((uProgress - ibiDelay) / max(1.0 - ibiDelay, 0.001), 0.0, 1.0);
        float ibiScale = 0.75 + 0.25 * ibiProgress;
        vec2 ibiCenter = (bounds.xy + bounds.zw) * 0.5;
        position.xy = (position.xy - ibiCenter) * ibiScale + ibiCenter;
        vIbiProgress = ibiProgress;`,
      );

      fragmentShader = fragmentShader.replace(
        "float fragDistance = troikaGetFragDistValue();",
        `float fragDistance = troikaGetFragDistValue();
        float ibiFontScaling = uFontSize / 250.0;
        float ibiNoise = ibiFbm(vec3(vTroikaGlyphUV * uFrequency, uTime * 0.1));
        ibiNoise *= uAmplitude * smoothstep(0.0, 0.13, vIbiProgress);
        float ibiDistanceOffset = (1.0 - vIbiProgress) * ibiFontScaling * (-19.0 + ibiNoise);
        fragDistance -= ibiDistanceOffset;`,
      );

      return { vertexShader, fragmentShader };
    },
  }) as IbiTextMaterial;

  material.transparent = true;
  material.depthTest = false;
  material.depthWrite = false;
  return material;
}
