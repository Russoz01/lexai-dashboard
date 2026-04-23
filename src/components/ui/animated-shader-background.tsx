'use client'

import { useRef, useEffect } from 'react'

/* ─────────────────────────────────────────────────────────────
 * AnimatedShaderBackground
 * WebGL fragment shader (Matthias Hurrle @atzedent) rodando como
 * camada de fundo. Usa cores champagne/noir do Pralvex.
 * Background-only — conteudo vai sobreposto no parent.
 * ────────────────────────────────────────────────────────────── */

const vertexShader = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`

const fragmentShader = `#version 300 es
/*
 * Based on work by Matthias Hurrle (@atzedent).
 * Paleta ajustada para noir + champagne.
 */
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p){
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p){
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float a=rnd(i), b=rnd(i+vec2(1,0)), c=rnd(i+vec2(0,1)), d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p){
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for(int i=0;i<5;i++){ t+=a*noise(p); p*=2.*m; a*=.5; }
  return t;
}
float clouds(vec2 p){
  float d=1., t=.0;
  for(float i=.0;i<3.;i++){
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a); d=a; p*=2./(i+1.);
  }
  return t;
}
void main(void){
  vec2 uv=(FC-.5*R)/MN, st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.15,-st.y));
  uv*=1.-.2*(sin(T*.15)*.5+.5);
  for(float i=1.;i<10.;i++){
    uv+=.08*cos(i*vec2(.1+.01*i,.8)+i*i+T*.3+.08*uv.x);
    vec2 p=uv;
    float d=length(p);
    // champagne warm highlight
    col+=.0011/d*(cos(sin(i)*vec3(.75,.62,.48))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.0016*b/length(max(p,vec2(b*p.x*.02,p.y)));
    // mix into noir base with subtle stone tint
    col=mix(col,vec3(bg*.06,bg*.045,bg*.03),d);
  }
  O=vec4(col,1);
}`

export function AnimatedShaderBackground({
  className,
  opacity = 1,
}: {
  className?: string
  opacity?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2')
    if (!gl) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(s))
      }
      return s
    }

    const program = gl.createProgram()!
    const vs = compile(gl.VERTEX_SHADER, vertexShader)
    const fs = compile(gl.FRAGMENT_SHADER, fragmentShader)
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]),
      gl.STATIC_DRAW,
    )
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'resolution')
    const uTime = gl.getUniformLocation(program, 'time')

    const resize = () => {
      const dpr = Math.min(2, Math.max(1, 0.75 * window.devicePixelRatio))
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const loop = (now: number) => {
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, now * 1e-3)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ opacity, background: '#000' }}
    />
  )
}
