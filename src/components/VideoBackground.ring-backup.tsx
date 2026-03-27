import { useEffect, useRef } from "react";

export function VideoBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
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
      void main() { gl_Position = aPosition; }
    `;

    const fsSource = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uRes;

      #define PI 3.14159265358979

      mat3 rotY(float a) {
        return mat3(cos(a),0,sin(a), 0,1,0, -sin(a),0,cos(a));
      }

      mat3 rotX(float a) {
        return mat3(1,0,0, 0,cos(a),-sin(a), 0,sin(a),cos(a));
      }

      mat3 rotZ(float a) {
        return mat3(cos(a),-sin(a),0, sin(a),cos(a),0, 0,0,1);
      }

      float sdTorus(vec3 p, float R, float r) {
        vec2 q = vec2(length(p.xz) - R, p.y);
        return length(q) - r;
      }

      vec3 torusNormal(vec3 p, float R, float r) {
        float e = 0.001;
        return normalize(vec3(
          sdTorus(p + vec3(e,0,0), R, r) - sdTorus(p - vec3(e,0,0), R, r),
          sdTorus(p + vec3(0,e,0), R, r) - sdTorus(p - vec3(0,e,0), R, r),
          sdTorus(p + vec3(0,0,e), R, r) - sdTorus(p - vec3(0,0,e), R, r)
        ));
      }

      vec3 iridescent(float t, float rim) {
        vec3 a = vec3(0.38, 0.35, 0.42);
        vec3 b = vec3(0.18, 0.16, 0.20);
        vec3 c = vec3(1.0, 0.8, 0.6);
        vec3 d = vec3(0.55, 0.30, 0.70);
        vec3 iri = a + b * cos(2.0 * PI * (c * t + d));

        vec3 rimCol = vec3(0.75, 0.68, 0.55);
        iri = mix(iri, rimCol, rim * 0.35);
        return iri;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - uRes * 0.5) / min(uRes.x, uRes.y);

        float camD = 3.8;
        vec3 ro = vec3(0.0, 0.0, camD);
        vec3 rd = normalize(vec3(uv, -1.8));

        mat3 camRot = rotY(uTime * 0.22) * rotX(-0.35);
        ro = camRot * ro;
        rd = camRot * rd;

        float t = 0.0;
        float d = 0.0;
        bool hit = false;
        vec3 p = ro;

        for (int i = 0; i < 96; i++) {
          p = ro + rd * t;
          vec3 q = rotZ(uTime * 0.12) * p;
          d = sdTorus(q, 1.15, 0.32);
          if (d < 0.0015) {
            hit = true;
            p = q;
            break;
          }
          t += d * 0.82;
          if (t > 8.0) {
            break;
          }
        }

        vec3 col = vec3(0.015, 0.015, 0.02);
        float vignette = smoothstep(1.2, 0.12, length(uv));
        col += vec3(0.015, 0.012, 0.02) * vignette;

        if (hit) {
          vec3 n = torusNormal(p, 1.15, 0.32);
          vec3 viewDir = normalize(-rd);
          float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 2.8);

          vec3 lightDirA = normalize(vec3(0.5, 0.8, 0.7));
          vec3 lightDirB = normalize(vec3(-0.8, 0.3, 0.5));
          float lightA = max(dot(n, lightDirA), 0.0);
          float lightB = max(dot(n, lightDirB), 0.0);

          vec3 halfA = normalize(lightDirA + viewDir);
          float spec = pow(max(dot(n, halfA), 0.0), 36.0);

          float iriT = dot(n, viewDir) * 0.5 + uTime * 0.05 + p.y * 0.08;
          vec3 iri = iridescent(iriT, rim);

          col = vec3(0.10, 0.10, 0.12) * 0.4;
          col += iri * (0.35 + rim * 0.72);
          col += vec3(0.82, 0.80, 0.84) * lightA * 0.22;
          col += vec3(0.55, 0.58, 0.62) * lightB * 0.14;
          col += vec3(1.0) * spec * 0.55;
          col += vec3(0.9, 0.78, 0.55) * rim * 0.14;
        } else {
          float halo = exp(-4.5 * abs(length(uv) - 0.38));
          col += vec3(0.16, 0.12, 0.20) * halo * 0.16;
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
      gl.deleteBuffer(positionBuffer);
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
