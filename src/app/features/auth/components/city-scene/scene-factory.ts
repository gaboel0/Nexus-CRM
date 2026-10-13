import * as THREE from 'three';
import { ThemeMode } from '../../../../core/services/theme.service';
import { createRandom } from './seeded-random';

/**
 * Cores do design system (docs/DESIGN-SYSTEM.md, seção 2). O Three.js não lê tokens CSS,
 * então os valores hexadecimais ficam aqui e devem acompanhar o `@theme` de `styles.css`.
 */
const COLORS = {
  background: 0x000000,
  body: 0x0f172a, // text
  primary: 0x2563eb, // primary
  light: 0xeff6ff, // light
};

/** Cores da cena que mudam com o tema. */
interface ScenePalette {
  readonly background: number;
  readonly cubes: number;
  readonly ground: number;
  readonly hemisphereGround: number;
  readonly hemisphereSky: number;
  readonly particles: number;
}

/** No claro: fundo `canvas`, cubos `surface`, chão `border` e partículas `primary`. */
const SCENE_PALETTES: Record<ThemeMode, ScenePalette> = {
  // Escuro: preto e cinzas neutros, sem tom azul nos cubos, no chão e na luz do céu.
  dark: {
    background: COLORS.background,
    cubes: 0x141414,
    ground: 0x0a0a0a,
    hemisphereGround: COLORS.background,
    hemisphereSky: 0x8a8a8a,
    particles: COLORS.light,
  },
  light: {
    background: 0xf8fafc, // canvas
    cubes: 0xffffff, // surface
    ground: 0xe2e8f0, // border
    hemisphereGround: 0xe2e8f0, // border
    hemisphereSky: COLORS.primary,
    particles: COLORS.primary,
  },
};

/** Objetos cuja cor muda com o tema. Ficam guardados para trocar o tema sem recriar a cena. */
export interface SceneThemeTargets {
  readonly background: THREE.Color;
  readonly fog: THREE.Fog;
  readonly hemisphere: THREE.HemisphereLight;
  readonly groundMaterial: THREE.MeshStandardMaterial;
  readonly cubeMaterial: THREE.MeshStandardMaterial;
  readonly particleMaterial: THREE.PointsMaterial;
}

/** Perfil de desempenho: menos objetos, menor resolução e sem sombras em telas pequenas. */
export interface ScenePerformanceProfile {
  readonly cubeGrid: number;
  readonly floaters: number;
  readonly particles: number;
  readonly maxPixelRatio: number;
  readonly antialias: boolean;
  readonly shadows: boolean;
}

export const DESKTOP_PROFILE: ScenePerformanceProfile = {
  cubeGrid: 12,
  floaters: 8,
  particles: 260,
  maxPixelRatio: 2,
  antialias: true,
  shadows: true,
};

export const MOBILE_PROFILE: ScenePerformanceProfile = {
  cubeGrid: 6,
  floaters: 3,
  particles: 60,
  maxPixelRatio: 1.25,
  antialias: false,
  shadows: false,
};

const SCENE_SEED = 42;
const SHADOW_MAP_SIZE = 2048;
// Grade larga o bastante para cobrir a área visível da câmera em qualquer proporção de tela.
const CUBE_SIZE = 6.2;
const CUBE_SPACING = 8;

/** Câmera em plano aéreo: alta e quase vertical, olhando o campo de cubos de cima. */
export const CAMERA_HOME = { x: 0, y: 50, z: 20 };
export const CAMERA_TARGET = { x: 0, y: 0, z: 0 };

/** Vista lateral: câmera ao lado do campo, olhando a linha de topos dos cubos. */
export const CAMERA_SIDE = { x: -58, y: 26, z: 14 };
export const CAMERA_SIDE_TARGET = { x: 4, y: 3, z: -6 };

/** Poliedro em wireframe que flutua acima da cidade e é animado a cada quadro. */
export interface Floater {
  readonly mesh: THREE.Mesh;
  readonly baseY: number;
  readonly speed: number;
  readonly phase: number;
}

/** Grade de cubos num único `InstancedMesh`: todos os cubos são desenhados em uma chamada. */
export interface CubeField {
  readonly mesh: THREE.InstancedMesh;
  readonly material: THREE.MeshStandardMaterial;
  readonly grid: number;
}

/** Objetos da cena que o componente precisa animar a cada quadro ou recolorir no tema. */
export interface SceneObjects {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly cubes: CubeField;
  readonly core: THREE.PointLight;
  readonly floaters: readonly Floater[];
  readonly particles: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;
  readonly themeTargets: SceneThemeTargets;
}

/** Aplica ao renderizador a resolução, as sombras e a cor de fundo do perfil. */
export function configureRenderer(
  renderer: THREE.WebGLRenderer,
  profile: ScenePerformanceProfile,
): void {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, profile.maxPixelRatio));
  renderer.setClearColor(COLORS.background, 1);
  renderer.shadowMap.enabled = profile.shadows;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.classList.add('block', 'size-full', 'pointer-events-none');
}

/** Monta a cena: luzes, chão, grade, cubos, núcleo luminoso e partículas. Não toca no renderizador. */
export function createScene(profile: ScenePerformanceProfile): SceneObjects {
  const scene = new THREE.Scene();
  const background = new THREE.Color(COLORS.background);
  scene.background = background;
  // A névoa apaga as bordas do campo; no escuro, cria a atmosfera; no claro, clareia o horizonte.
  const fog = new THREE.Fog(COLORS.background, 80, 190);
  scene.fog = fog;

  const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 400);
  camera.position.set(CAMERA_HOME.x, CAMERA_HOME.y, CAMERA_HOME.z);
  camera.lookAt(CAMERA_TARGET.x, CAMERA_TARGET.y, CAMERA_TARGET.z);

  const random = createRandom(SCENE_SEED);

  const hemisphere = addLights(scene, profile);
  const groundMaterial = addGround(scene, profile);
  addGrid(scene);
  const cubes = addCubeField(scene, profile);
  const core = addCore(scene);
  const floaters = addFloaters(scene, profile, random);
  const particles = createParticles(profile, random);
  scene.add(particles);

  const themeTargets: SceneThemeTargets = {
    background,
    fog,
    hemisphere,
    groundMaterial,
    cubeMaterial: cubes.material,
    particleMaterial: particles.material,
  };

  return { scene, camera, cubes, core, floaters, particles, themeTargets };
}

/** Recolore a cena para o tema pedido, sem recriar geometrias ou materiais. */
export function applySceneTheme(targets: SceneThemeTargets, mode: ThemeMode): void {
  const palette = SCENE_PALETTES[mode];
  targets.background.set(palette.background);
  targets.fog.color.set(palette.background);
  targets.hemisphere.groundColor.set(palette.hemisphereGround);
  targets.hemisphere.color.set(palette.hemisphereSky);
  targets.groundMaterial.color.set(palette.ground);
  targets.cubeMaterial.color.set(palette.cubes);
  targets.particleMaterial.color.set(palette.particles);
}

/**
 * Atualiza altura e posição de cada cubo. As alturas seguem ondas lentas que partem do centro;
 * o centro fica mais baixo, abrindo espaço para o núcleo luminoso.
 */
export function animateCubeField(field: CubeField, seconds: number): void {
  const { mesh, grid } = field;
  const half = (grid - 1) / 2;
  let index = 0;

  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const x = (i - half) * CUBE_SPACING;
      const z = (j - half) * CUBE_SPACING;
      const wave =
        0.5 + 0.5 * Math.sin(x * 0.18 + seconds * 0.6) * Math.cos(z * 0.18 - seconds * 0.4);
      const ring = Math.min(1, Math.hypot(x, z) / 10);
      const height = Math.max((1.5 + 12 * wave * wave) * ring, 0.05);

      CUBE_MATRIX.compose(
        CUBE_POSITION.set(x, height / 2, z),
        CUBE_ROTATION,
        CUBE_SCALE.set(1, height, 1),
      );
      mesh.setMatrixAt(index++, CUBE_MATRIX);
    }
  }

  mesh.instanceMatrix.needsUpdate = true;
}

// Objetos reutilizados a cada quadro para não gerar lixo para o coletor de memória.
const CUBE_MATRIX = new THREE.Matrix4();
const CUBE_POSITION = new THREE.Vector3();
const CUBE_SCALE = new THREE.Vector3();
const CUBE_ROTATION = new THREE.Quaternion();

/** Libera geometrias, materiais, sombras e buffers de instância da cena. Recursos compartilhados são liberados uma vez. */
export function disposeScene(scene: THREE.Scene): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  scene.traverse((object) => {
    if (
      object instanceof THREE.Mesh ||
      object instanceof THREE.Line ||
      object instanceof THREE.Points
    ) {
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(material);
      }
    }
    if (object instanceof THREE.InstancedMesh) {
      object.dispose();
    }
    if (object instanceof THREE.DirectionalLight) {
      object.shadow.dispose();
    }
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

function addLights(scene: THREE.Scene, profile: ScenePerformanceProfile): THREE.HemisphereLight {
  const hemisphere = new THREE.HemisphereLight(COLORS.primary, COLORS.background, 0.8);

  // Luz vinda do alto: destaca o topo dos cubos, que é o que aparece na visão aérea.
  const key = new THREE.DirectionalLight(COLORS.light, 1.4);
  key.position.set(-20, 60, 20);
  key.target.position.set(0, 0, 0);
  key.castShadow = profile.shadows;
  key.shadow.mapSize.set(SHADOW_MAP_SIZE, SHADOW_MAP_SIZE);

  // Área de sombra cobre o campo de cubos em torno do alvo da luz.
  const shadowCamera = key.shadow.camera;
  shadowCamera.left = -50;
  shadowCamera.right = 50;
  shadowCamera.top = 50;
  shadowCamera.bottom = -50;
  shadowCamera.far = 200;
  shadowCamera.updateProjectionMatrix();

  scene.add(hemisphere, key, key.target);
  return hemisphere;
}

function addGround(
  scene: THREE.Scene,
  profile: ScenePerformanceProfile,
): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({ color: COLORS.body, roughness: 0.9 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), material);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = profile.shadows;
  scene.add(ground);
  return material;
}

function addGrid(scene: THREE.Scene): void {
  const grid = new THREE.GridHelper(400, 80, COLORS.primary, COLORS.primary);
  grid.position.y = 0.02;
  if (!Array.isArray(grid.material)) {
    grid.material.transparent = true;
    grid.material.opacity = 0.12;
  }
  scene.add(grid);
}

/** Grade de cubos com material e geometria compartilhados; a altura de cada um é definida por instância. */
function addCubeField(scene: THREE.Scene, profile: ScenePerformanceProfile): CubeField {
  const geometry = new THREE.BoxGeometry(CUBE_SIZE, 1, CUBE_SIZE);
  const material = new THREE.MeshStandardMaterial({
    color: COLORS.body,
    roughness: 0.5,
    metalness: 0.3,
  });
  const count = profile.cubeGrid * profile.cubeGrid;
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.castShadow = profile.shadows;
  mesh.receiveShadow = profile.shadows;
  // As posições mudam a cada quadro; o limite de recorte original deixaria de valer.
  mesh.frustumCulled = false;
  scene.add(mesh);

  const field = { mesh, material, grid: profile.cubeGrid };
  animateCubeField(field, 0);
  return field;
}

/** Luz azul no centro do campo, que pulsa devagar e cria o brilho do núcleo. */
function addCore(scene: THREE.Scene): THREE.PointLight {
  const core = new THREE.PointLight(COLORS.primary, 14, 40, 1.2);
  core.position.set(0, 2.5, 0);
  scene.add(core);
  return core;
}

function addFloaters(
  scene: THREE.Scene,
  profile: ScenePerformanceProfile,
  random: () => number,
): Floater[] {
  const geometry = new THREE.IcosahedronGeometry(1, 0);
  const material = new THREE.MeshBasicMaterial({
    color: COLORS.primary,
    wireframe: true,
    transparent: true,
    opacity: 0.6,
  });

  return Array.from({ length: profile.floaters }, () => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.setScalar(0.8 + random() * 1.6);
    mesh.position.set((random() * 2 - 1) * 30, 8 + random() * 14, (random() * 2 - 1) * 30);
    scene.add(mesh);

    return {
      mesh,
      baseY: mesh.position.y,
      speed: 0.3 + random() * 0.4,
      phase: random() * Math.PI * 2,
    };
  });
}

function createParticles(
  profile: ScenePerformanceProfile,
  random: () => number,
): THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> {
  const positions = new Float32Array(profile.particles * 3);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (random() * 2 - 1) * 70;
    positions[i + 1] = random() * 45;
    positions[i + 2] = (random() * 2 - 1) * 70;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: COLORS.light,
    size: 0.25,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}
