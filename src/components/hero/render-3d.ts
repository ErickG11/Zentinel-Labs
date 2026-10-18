interface Render3DInput {
  reducedMotion: boolean;
  webgl: boolean;
  cores: number | undefined;
}

export const shouldRender3D = ({ reducedMotion, webgl, cores }: Render3DInput): boolean =>
  !reducedMotion && webgl && (cores === undefined || cores > 4);
