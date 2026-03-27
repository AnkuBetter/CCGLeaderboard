import { useEffect, useRef } from "react";

export function VideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const vsSource = `
      attribute vec4 aPosition;
      void main() {
        gl_Position = aPosition;
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uRes;

      #define PI 3.14159265358979

      mat3 rotY(float a) {
        return mat3(cos(a), 0.0, sin(a), 0.0, 1.0, 0.0, -sin(a), 0.0, cos(a));
      }

      mat3 rotX(float a) {
        return mat3(1.0, 0.0, 0.0, 0.0, cos(a), -sin(a), 0.0, sin(a), cos(a));
      }

      mat3 rotZ(float a) {
        return mat3(cos(a), -sin(a), 0.0, sin(a), cos(a), 0.0, 0.0, 0.0, 1.0);
      }

      float sdRoundBox(vec3 p, vec3 b, float r) {
        vec3 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
      }

      float smin(float a, float b, float k) {
        float h = max(k - abs(a - b), 0.0) / k;
        return min(a, b) - h * h * k * 0.25;
      }

      float sdBetterX(vec3 p) {
        vec3 armA = rotZ(0.78539816339) * p;
        vec3 armB = rotZ(-0.78539816339) * p;

        float barA = sdRoundBox(armA, vec3(1.12, 0.18, 0.27), 0.092);
        float barB = sdRoundBox(armB, vec3(1.12, 0.18, 0.27), 0.092);

        return smin(barA, barB, 0.18);
      }

      vec3 betterXNormal(vec3 p) {
        float e = 0.0012;
        return normalize(vec3(
          sdBetterX(p + vec3(e, 0.0, 0.0)) - sdBetterX(p - vec3(e, 0.0, 0.0)),
          sdBetterX(p + vec3(0.0, e, 0.0)) - sdBetterX(p - vec3(0.0, e, 0.0)),
          sdBetterX(p + vec3(0.0, 0.0, e)) - sdBetterX(p - vec3(0.0, 0.0, e))
        ));
      }

      vec3 iridescent(float t, float rim) {
        vec3 a = vec3(0.34, 0.33, 0.38);
        vec3 b = vec3(0.16, 0.14, 0.18);
        vec3 c = vec3(1.0, 0.8, 0.62);
        vec3 d = vec3(0.56, 0.30, 0.69);
        vec3 iri = a + b * cos(2.0 * PI * (c * t + d));
        vec3 rimCol = vec3(0.74, 0.68, 0.56);
        return mix(iri, rimCol, rim * 0.28);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - uRes * 0.5) / min(uRes.x, uRes.y);

        vec3 base = vec3(0.012, 0.013, 0.017);
        float vignette = smoothstep(1.26, 0.18, length(uv));
        base += vec3(0.010, 0.010, 0.014) * vignette;
        base += vec3(0.018, 0.016, 0.024) * exp(-6.0 * abs(uv.y + 0.22)) * 0.16;
        base += vec3(0.026, 0.022, 0.034) * exp(-10.0 * abs(abs(uv.x * 0.92) - abs(uv.y + 0.06))) * 0.08;

        vec3 ro = vec3(0.0, 0.03, 4.25);
        vec3 rd = normalize(vec3(uv, -1.95));

        float yaw = sin(uTime * 0.55) * 0.65;
        float roll = cos(uTime * 0.28) * 0.10;
        float bob = sin(uTime * 0.42) * 0.035;
        mat3 objRot = rotY(yaw) * rotZ(roll) * rotX(-0.18);
        vec3 objectOffset = vec3(0.0, -0.48 + bob, 0.0);

        float t = 0.0;
        float d = 0.0;
        bool hit = false;
        vec3 localP = vec3(0.0);

        for (int i = 0; i < 120; i++) {
          vec3 worldP = ro + rd * t;
          localP = objRot * (worldP - objectOffset);
          d = sdBetterX(localP);
          if (d < 0.0012) {
            hit = true;
            break;
          }
          t += d * 0.82;
          if (t > 8.5) {
            break;
          }
        }

        vec3 col = base;

        if (hit) {
          vec3 n = betterXNormal(localP);
          vec3 viewDir = normalize(-rd);
          float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 2.6);

          vec3 lightDirA = normalize(vec3(0.48, 0.86, 0.72));
          vec3 lightDirB = normalize(vec3(-0.72, 0.24, 0.58));
          vec3 lightDirC = normalize(vec3(0.10, -0.82, 0.54));

          float diffA = max(dot(n, lightDirA), 0.0);
          float diffB = max(dot(n, lightDirB), 0.0);
          float diffC = max(dot(n, lightDirC), 0.0);

          vec3 halfA = normalize(lightDirA + viewDir);
          vec3 halfB = normalize(lightDirB + viewDir);
          float specA = pow(max(dot(n, halfA), 0.0), 42.0);
          float specB = pow(max(dot(n, halfB), 0.0), 22.0);

          float iriT = dot(n, viewDir) * 0.5 + uTime * 0.045 + localP.y * 0.10 + localP.x * 0.05;
          vec3 iri = iridescent(iriT, fresnel);
          float depthGlow = pow(max(1.0 - abs(localP.z) / 0.27, 0.0), 2.3);
          float thicknessShade = smoothstep(-0.24, 0.24, localP.z);
          float edgeAccent = pow(max(1.0 - abs(localP.z) / 0.27, 0.0), 7.0);

          vec3 logo = vec3(0.06, 0.065, 0.082);
          logo += iri * (0.24 + fresnel * 0.56);
          logo += vec3(0.80, 0.82, 0.88) * diffA * 0.18;
          logo += vec3(0.46, 0.52, 0.64) * diffB * 0.12;
          logo += vec3(0.20, 0.22, 0.30) * diffC * 0.06;
          logo += vec3(1.0) * specA * 0.38;
          logo += vec3(0.72, 0.78, 0.92) * specB * 0.12;
          logo += vec3(0.12, 0.18, 0.28) * depthGlow * 0.18;
          logo += iri * edgeAccent * 0.10;
          logo *= mix(0.82, 1.02, thicknessShade);

          float contactShadow = smoothstep(0.95, 0.15, length(uv - vec2(0.0, -0.22)));
          col *= 1.0 - contactShadow * 0.05;
          col = logo;
        }

        col *= vignette;
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) {
        return null;
      }

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) {
      window.removeEventListener("resize", resize);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      window.removeEventListener("resize", resize);
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      window.removeEventListener("resize", resize);
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const resLocation = gl.getUniformLocation(program, "uRes");

    const render = (time: number) => {
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      if (timeLocation) {
        gl.uniform1f(timeLocation, time * 0.001);
      }

      if (resLocation) {
        gl.uniform2f(resLocation, canvas.width, canvas.height);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animRef.current = window.requestAnimationFrame(render);
    };

    animRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      if (positionBuffer) {
        gl.deleteBuffer(positionBuffer);
      }
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
