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
      uniform sampler2D uLogoTex;
      uniform vec2 uLogoTexel;
      uniform float uLogoAspect;
      uniform float uLogoReady;

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

      float logoMask(vec2 uv) {
        vec4 tex = texture2D(uLogoTex, uv);
        return smoothstep(0.03, 0.78, tex.a);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - uRes * 0.5) / min(uRes.x, uRes.y);

        vec3 col = vec3(0.015, 0.015, 0.02);
        float vignette = smoothstep(1.24, 0.16, length(uv));
        col += vec3(0.015, 0.012, 0.02) * vignette;

        float crossGlow = exp(-10.0 * abs(abs(uv.x) - abs(uv.y))) * exp(-2.8 * length(uv));
        col += vec3(0.17, 0.13, 0.24) * crossGlow * 0.14;

        if (uLogoReady > 0.5) {
          vec3 ro = vec3(0.0, 0.02, 4.2);
          vec3 rd = normalize(vec3(uv, -1.95));

          float yaw = sin(uTime * 0.55) * 0.45;
          float roll = cos(uTime * 0.30) * 0.08;
          mat3 objRot = rotY(yaw) * rotZ(roll) * rotX(-0.08);
          mat3 invRot = transpose(objRot);

          vec3 localRo = invRot * ro;
          vec3 localRd = invRot * rd;
          float planeT = -localRo.z / localRd.z;

          if (planeT > 0.0) {
            vec3 hit = localRo + localRd * planeT;
            vec2 halfSize = vec2(1.55, 1.55 / max(uLogoAspect, 0.001));
            vec2 logoUv = hit.xy / halfSize * 0.5 + 0.5;

            if (logoUv.x > 0.0 && logoUv.x < 1.0 && logoUv.y > 0.0 && logoUv.y < 1.0) {
              float mask = logoMask(logoUv);

              if (mask > 0.01) {
                vec2 tx = max(uLogoTexel, vec2(0.0005));
                float maskXp = logoMask(clamp(logoUv + vec2(tx.x, 0.0), 0.0, 1.0));
                float maskXm = logoMask(clamp(logoUv - vec2(tx.x, 0.0), 0.0, 1.0));
                float maskYp = logoMask(clamp(logoUv + vec2(0.0, tx.y), 0.0, 1.0));
                float maskYm = logoMask(clamp(logoUv - vec2(0.0, tx.y), 0.0, 1.0));

                vec2 grad = vec2(maskXp - maskXm, maskYp - maskYm);
                float bevel = clamp(length(grad) * 2.8, 0.0, 1.0);
                vec3 n = normalize(vec3(-grad * 3.4, 1.0));
                vec3 viewDir = normalize(localRo - vec3(hit.xy, 0.0));
                float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 2.8);

                vec3 lightDirA = normalize(vec3(0.5, 0.8, 0.7));
                vec3 lightDirB = normalize(vec3(-0.8, 0.3, 0.5));
                float lightA = max(dot(n, lightDirA), 0.0);
                float lightB = max(dot(n, lightDirB), 0.0);
                vec3 halfA = normalize(lightDirA + viewDir);
                float spec = pow(max(dot(n, halfA), 0.0), 36.0);

                float iriT = dot(n, viewDir) * 0.5 + uTime * 0.05 + hit.y * 0.08 + hit.x * 0.04;
                vec3 iri = iridescent(iriT, rim);
                float innerGlow = smoothstep(0.2, 0.95, mask) * (1.0 - bevel * 0.55);
                float edgeLight = smoothstep(0.18, 0.92, bevel);

                vec3 logoColor = vec3(0.10, 0.10, 0.12) * 0.34;
                logoColor += iri * (0.28 + rim * 0.68);
                logoColor += vec3(0.82, 0.80, 0.84) * lightA * 0.18;
                logoColor += vec3(0.55, 0.58, 0.62) * lightB * 0.12;
                logoColor += vec3(1.0) * spec * 0.48;
                logoColor += vec3(0.9, 0.78, 0.55) * rim * 0.12;
                logoColor += vec3(1.0, 0.82, 0.54) * innerGlow * 0.07;
                logoColor += iri * edgeLight * 0.16;

                col = mix(col, logoColor, mask);
                col += iri * mask * 0.04;
              }
            }
          }
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

    const texture = gl.createTexture();
    let logoReady = false;
    let logoTexel = { x: 1 / 1024, y: 1 / 1024 };
    let logoAspect = 1;

    if (texture) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 0]),
      );

      const logo = new Image();
      logo.decoding = "async";
      logo.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, logo);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        logoTexel = { x: 1 / logo.width, y: 1 / logo.height };
        logoAspect = logo.width / logo.height;
        logoReady = true;
      };
      logo.src = `${import.meta.env.BASE_URL}logos/xlogo.png`;
    }

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const resLocation = gl.getUniformLocation(program, "uRes");
    const logoTexLocation = gl.getUniformLocation(program, "uLogoTex");
    const logoTexelLocation = gl.getUniformLocation(program, "uLogoTexel");
    const logoAspectLocation = gl.getUniformLocation(program, "uLogoAspect");
    const logoReadyLocation = gl.getUniformLocation(program, "uLogoReady");

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

      if (logoTexLocation) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(logoTexLocation, 0);
      }

      if (logoTexelLocation) {
        gl.uniform2f(logoTexelLocation, logoTexel.x, logoTexel.y);
      }

      if (logoAspectLocation) {
        gl.uniform1f(logoAspectLocation, logoAspect);
      }

      if (logoReadyLocation) {
        gl.uniform1f(logoReadyLocation, logoReady ? 1 : 0);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animRef.current = window.requestAnimationFrame(render);
    };

    animRef.current = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(positionBuffer);
      if (texture) {
        gl.deleteTexture(texture);
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

