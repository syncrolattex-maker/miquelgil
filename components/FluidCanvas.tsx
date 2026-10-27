"use client";

import { useEffect, useRef } from "react";

const vertShader = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 u_vertex_texel;

void main () {
    vUv = aPosition * .5 + .5;
    vL = vUv - vec2(u_vertex_texel.x, 0.);
    vR = vUv + vec2(u_vertex_texel.x, 0.);
    vT = vUv + vec2(0., u_vertex_texel.y);
    vB = vUv - vec2(0., u_vertex_texel.y);
    gl_Position = vec4(aPosition, 0., 1.);
}
`;

const fragShaderAdvection = `
precision highp float;
precision highp sampler2D;

varying vec2 vUv;
uniform sampler2D u_velocity_txr;
uniform sampler2D u_input_txr;
uniform vec2 u_vertex_texel;
uniform vec2 u_output_textel;
uniform float u_dt;
uniform float u_dissipation;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
    vec2 st = uv / tsize - 0.5;
    vec2 iuv = floor(st);
    vec2 fuv = fract(st);

    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main () {
    vec2 coord = vUv - u_dt * bilerp(u_velocity_txr, vUv, u_vertex_texel).xy * u_vertex_texel;
    gl_FragColor = u_dissipation * bilerp(u_input_txr, coord, u_output_textel);
    gl_FragColor.a = 1.;
}
`;

const fragShaderDivergence = `
precision highp float;
precision highp sampler2D;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_velocity_txr;

void main () {
    float L = texture2D(u_velocity_txr, vL).x;
    float R = texture2D(u_velocity_txr, vR).x;
    float T = texture2D(u_velocity_txr, vT).y;
    float B = texture2D(u_velocity_txr, vB).y;

    float div = .5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0., 0., 1.);
}
`;

const fragShaderPressure = `
precision highp float;
precision highp sampler2D;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_pressure_txr;
uniform sampler2D u_divergence_txr;

void main () {
    float L = texture2D(u_pressure_txr, vL).x;
    float R = texture2D(u_pressure_txr, vR).x;
    float T = texture2D(u_pressure_txr, vT).y;
    float B = texture2D(u_pressure_txr, vB).y;

    float C = texture2D(u_pressure_txr, vUv).x;
    float div = texture2D(u_divergence_txr, vUv).x;

    float pressure = (L + R + B + T - div) * .25;
    gl_FragColor = vec4(pressure, 0., 0., 1.);
}
`;

const fragShaderGradientSubtract = `
precision highp float;
precision highp sampler2D;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D u_pressure_txr;
uniform sampler2D u_velocity_txr;

void main () {
    float L = texture2D(u_pressure_txr, vL).x;
    float R = texture2D(u_pressure_txr, vR).x;
    float T = texture2D(u_pressure_txr, vT).y;
    float B = texture2D(u_pressure_txr, vB).y;

    vec2 velocity = texture2D(u_velocity_txr, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0., 1.);
}
`;

const fragShaderPoint = `
precision highp float;
precision highp sampler2D;

varying vec2 vUv;
uniform sampler2D u_input_txr;
uniform float u_ratio;
uniform vec3 u_point_value;
uniform vec2 u_point;
uniform float u_point_size;

void main () {
    vec2 p = vUv - u_point.xy;
    p.x *= u_ratio;
    vec3 splat = exp(-dot(p, p) / u_point_size) * u_point_value;
    vec3 base = texture2D(u_input_txr, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.);
}
`;

const fragShaderDisplay = `
precision highp float;
precision highp sampler2D;

varying vec2 vUv;
uniform sampler2D u_output_texture;

void main () {
    vec3 C = texture2D(u_output_texture, vUv).rgb;
    float a = max(C.r, max(C.g, C.b));
    a = pow(.1 * a, .1);
    a = clamp(a, 0., 1.);
    gl_FragColor = vec4(1. - C, 1. - a);
}
`;

export default function FluidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    gl.getExtension("OES_texture_float");

    const params = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1024,
      DENSITY_DISSIPATION: 0.995,
      VELOCITY_DISSIPATION: 0.9,
      PRESSURE_ITERATIONS: 10,
      SPLAT_RADIUS: 3 / window.innerHeight,
      color: { r: 0.8, g: 0.5, b: 0.2 },
    };

    const pointer = {
      x: 0.65 * window.innerWidth,
      y: 0.5 * window.innerHeight,
      dx: 0,
      dy: 0,
      moved: false,
      firstMove: false,
    };

    const firstMoveTimer = window.setTimeout(() => {
      pointer.firstMove = true;
    }, 3000);

    let prevTimestamp = Date.now();
    let animId: number;

    const createShader = (sourceCode: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, sourceCode);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(vertShader, gl.VERTEX_SHADER);
    if (!vertexShader) return;

    const createShaderProgram = (
      vShader: WebGLShader,
      fShader: WebGLShader
    ) => {
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vShader);
      gl.attachShader(program, fShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error: " + gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    };

    const getUniforms = (program: WebGLProgram) => {
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < uniformCount; i++) {
        const info = gl.getActiveUniform(program, i);
        if (info) {
          uniforms[info.name] = gl.getUniformLocation(program, info.name);
        }
      }
      return uniforms;
    };

    const createProgram = (fragSource: string) => {
      const fShader = createShader(fragSource, gl.FRAGMENT_SHADER);
      if (!fShader) return null;
      const program = createShaderProgram(vertexShader, fShader);
      if (!program) return null;
      const uniforms = getUniforms(program);
      return { program, uniforms, fShader };
    };

    const splatProgram = createProgram(fragShaderPoint);
    const divergenceProgram = createProgram(fragShaderDivergence);
    const pressureProgram = createProgram(fragShaderPressure);
    const gradientSubtractProgram = createProgram(fragShaderGradientSubtract);
    const advectionProgram = createProgram(fragShaderAdvection);
    const displayProgram = createProgram(fragShaderDisplay);

    if (
      !splatProgram ||
      !divergenceProgram ||
      !pressureProgram ||
      !gradientSubtractProgram ||
      !advectionProgram ||
      !displayProgram
    ) {
      return;
    }

    const quadVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW
    );

    const quadEbo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadEbo);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      gl.STATIC_DRAW
    );

    function blit(target?: { width: number; height: number; fbo: WebGLFramebuffer } | null) {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quadVbo);
      gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, quadEbo);
      gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0);
      gl!.enableVertexAttribArray(0);

      if (!target) {
        gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      } else {
        gl!.viewport(0, 0, target.width, target.height);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
      }
      gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
    }

    function createFBO(w: number, h: number, type: number = gl!.RGBA) {
      gl!.activeTexture(gl!.TEXTURE0);
      const texture = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.NEAREST);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.NEAREST);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, type, w, h, 0, type, gl!.FLOAT, null);

      const fbo = gl!.createFramebuffer()!;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(
        gl!.FRAMEBUFFER,
        gl!.COLOR_ATTACHMENT0,
        gl!.TEXTURE_2D,
        texture,
        0
      );
      gl!.viewport(0, 0, w, h);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      return {
        fbo,
        texture,
        width: w,
        height: h,
        attach(id: number) {
          gl!.activeTexture(gl!.TEXTURE0 + id);
          gl!.bindTexture(gl!.TEXTURE_2D, texture);
          return id;
        },
      };
    }

    function createDoubleFBO(w: number, h: number, type: number = gl!.RGBA) {
      let fbo1 = createFBO(w, h, type);
      let fbo2 = createFBO(w, h, type);

      return {
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        read: () => fbo1,
        write: () => fbo2,
        swap() {
          const temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        },
        destroy() {
          gl!.deleteTexture(fbo1.texture);
          gl!.deleteFramebuffer(fbo1.fbo);
          gl!.deleteTexture(fbo2.texture);
          gl!.deleteFramebuffer(fbo2.fbo);
        },
      };
    }

    function getResolution(resolution: number) {
      let aspectRatio = gl!.drawingBufferWidth / gl!.drawingBufferHeight;
      if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;

      const min = Math.round(resolution);
      const max = Math.round(resolution * aspectRatio);

      if (gl!.drawingBufferWidth > gl!.drawingBufferHeight)
        return { width: max, height: min };
      else return { width: min, height: max };
    }

    let outputColor: ReturnType<typeof createDoubleFBO>;
    let velocity: ReturnType<typeof createDoubleFBO>;
    let divergence: ReturnType<typeof createFBO>;
    let pressure: ReturnType<typeof createDoubleFBO>;

    function initFBOs() {
      const simRes = getResolution(params.SIM_RESOLUTION);
      const dyeRes = getResolution(params.DYE_RESOLUTION);

      if (outputColor) outputColor.destroy();
      if (velocity) velocity.destroy();
      if (divergence) {
        gl!.deleteTexture(divergence.texture);
        gl!.deleteFramebuffer(divergence.fbo);
      }
      if (pressure) pressure.destroy();

      outputColor = createDoubleFBO(dyeRes.width, dyeRes.height);
      velocity = createDoubleFBO(simRes.width, simRes.height);
      divergence = createFBO(simRes.width, simRes.height, gl!.RGB);
      pressure = createDoubleFBO(simRes.width, simRes.height, gl!.RGB);
    }

    function updateSize() {
      params.SPLAT_RADIUS = 3 / window.innerHeight;
      canvas!.width = canvas!.clientWidth;
      canvas!.height = canvas!.clientHeight;
      initFBOs();
    }

    updateSize();

    function render() {
      const dt = (Date.now() - prevTimestamp) / 1000;
      prevTimestamp = Date.now();

      if (!pointer.firstMove) {
        pointer.moved = true;
        const newX =
          (0.65 +
            0.2 *
              Math.cos(0.006 * prevTimestamp) *
              Math.sin(0.008 * prevTimestamp)) *
          window.innerWidth;
        const newY =
          (0.5 + 0.12 * Math.sin(0.01 * prevTimestamp)) * window.innerHeight;
        pointer.dx = 10 * (newX - pointer.x);
        pointer.dy = 10 * (newY - pointer.y);
        pointer.x = newX;
        pointer.y = newY;
      }

      if (pointer.moved) {
        pointer.moved = false;

        gl!.useProgram(splatProgram!.program);
        gl!.uniform1i(
          splatProgram!.uniforms.u_input_txr,
          velocity.read().attach(0)
        );
        gl!.uniform1f(
          splatProgram!.uniforms.u_ratio,
          canvas!.width / canvas!.height
        );
        gl!.uniform2f(
          splatProgram!.uniforms.u_point,
          pointer.x / canvas!.width,
          1 - pointer.y / canvas!.height
        );
        gl!.uniform3f(
          splatProgram!.uniforms.u_point_value,
          pointer.dx,
          -pointer.dy,
          1
        );
        gl!.uniform1f(
          splatProgram!.uniforms.u_point_size,
          params.SPLAT_RADIUS
        );

        blit(velocity.write());
        velocity.swap();

        gl!.uniform1i(
          splatProgram!.uniforms.u_input_txr,
          outputColor.read().attach(0)
        );
        gl!.uniform3f(
          splatProgram!.uniforms.u_point_value,
          1 - params.color.r,
          1 - params.color.g,
          1 - params.color.b
        );
        blit(outputColor.write());
        outputColor.swap();
      }

      gl!.useProgram(divergenceProgram!.program);
      gl!.uniform2f(
        divergenceProgram!.uniforms.u_vertex_texel,
        velocity.texelSizeX,
        velocity.texelSizeY
      );
      gl!.uniform1i(
        divergenceProgram!.uniforms.u_velocity_txr,
        velocity.read().attach(0)
      );
      blit(divergence);

      gl!.useProgram(pressureProgram!.program);
      gl!.uniform2f(
        pressureProgram!.uniforms.u_vertex_texel,
        velocity.texelSizeX,
        velocity.texelSizeY
      );
      gl!.uniform1i(
        pressureProgram!.uniforms.u_divergence_txr,
        divergence.attach(0)
      );
      for (let i = 0; i < params.PRESSURE_ITERATIONS; i++) {
        gl!.uniform1i(
          pressureProgram!.uniforms.u_pressure_txr,
          pressure.read().attach(1)
        );
        blit(pressure.write());
        pressure.swap();
      }

      gl!.useProgram(gradientSubtractProgram!.program);
      gl!.uniform2f(
        gradientSubtractProgram!.uniforms.u_vertex_texel,
        velocity.texelSizeX,
        velocity.texelSizeY
      );
      gl!.uniform1i(
        gradientSubtractProgram!.uniforms.u_pressure_txr,
        pressure.read().attach(0)
      );
      gl!.uniform1i(
        gradientSubtractProgram!.uniforms.u_velocity_txr,
        velocity.read().attach(1)
      );
      blit(velocity.write());
      velocity.swap();

      gl!.useProgram(advectionProgram!.program);
      gl!.uniform2f(
        advectionProgram!.uniforms.u_vertex_texel,
        velocity.texelSizeX,
        velocity.texelSizeY
      );
      gl!.uniform2f(
        advectionProgram!.uniforms.u_output_textel,
        velocity.texelSizeX,
        velocity.texelSizeY
      );

      gl!.uniform1i(
        advectionProgram!.uniforms.u_velocity_txr,
        velocity.read().attach(0)
      );
      gl!.uniform1i(
        advectionProgram!.uniforms.u_input_txr,
        velocity.read().attach(0)
      );
      gl!.uniform1f(advectionProgram!.uniforms.u_dt, dt);
      gl!.uniform1f(
        advectionProgram!.uniforms.u_dissipation,
        params.VELOCITY_DISSIPATION
      );
      blit(velocity.write());
      velocity.swap();

      gl!.uniform2f(
        advectionProgram!.uniforms.u_output_textel,
        outputColor.texelSizeX,
        outputColor.texelSizeY
      );
      gl!.uniform1i(
        advectionProgram!.uniforms.u_velocity_txr,
        velocity.read().attach(0)
      );
      gl!.uniform1i(
        advectionProgram!.uniforms.u_input_txr,
        outputColor.read().attach(1)
      );
      gl!.uniform1f(
        advectionProgram!.uniforms.u_dissipation,
        params.DENSITY_DISSIPATION
      );
      blit(outputColor.write());
      outputColor.swap();

      gl!.useProgram(displayProgram!.program);
      gl!.uniform1i(
        displayProgram!.uniforms.u_output_texture,
        outputColor.read().attach(0)
      );
      blit();

      animId = requestAnimationFrame(render);
    }

    render();

    const onResize = () => {
      updateSize();
    };

    const onClick = (e: MouseEvent) => {
      pointer.dx = 10;
      pointer.dy = 10;
      pointer.x = e.pageX;
      pointer.y = e.pageY;
      pointer.firstMove = true;
    };

    const onMouseMove = (e: MouseEvent) => {
      pointer.moved = true;
      pointer.dx = 5 * (e.pageX - pointer.x);
      pointer.dy = 5 * (e.pageY - pointer.y);
      pointer.x = e.pageX;
      pointer.y = e.pageY;
      pointer.firstMove = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      pointer.moved = true;
      pointer.dx = 8 * (e.targetTouches[0].pageX - pointer.x);
      pointer.dy = 8 * (e.targetTouches[0].pageY - pointer.y);
      pointer.x = e.targetTouches[0].pageX;
      pointer.y = e.targetTouches[0].pageY;
      pointer.firstMove = true;
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("click", onClick);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.clearTimeout(firstMoveTimer);
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("click", onClick);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);

      if (outputColor) outputColor.destroy();
      if (velocity) velocity.destroy();
      if (divergence) {
        gl.deleteTexture(divergence.texture);
        gl.deleteFramebuffer(divergence.fbo);
      }
      if (pressure) pressure.destroy();

      gl.deleteBuffer(quadVbo);
      gl.deleteBuffer(quadEbo);
      gl.deleteShader(vertexShader);
      [
        splatProgram,
        divergenceProgram,
        pressureProgram,
        gradientSubtractProgram,
        advectionProgram,
        displayProgram,
      ].forEach((p) => {
        if (p) {
          gl.deleteProgram(p.program);
          gl.deleteShader(p.fShader);
        }
      });
    };
  }, []);

  return <canvas ref={canvasRef} className="home__canvas" aria-hidden="true" />;
}
