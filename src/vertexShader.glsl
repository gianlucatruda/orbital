// https://waelyasmina.net/articles/glsl-and-shaders-tutorial-for-beginners-webgl-threejs/ -->
uniform float u_time;
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
