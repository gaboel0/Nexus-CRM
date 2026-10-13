import * as THREE from 'three';
import {
  DESKTOP_PROFILE,
  MOBILE_PROFILE,
  applySceneTheme,
  createScene,
  disposeScene,
} from './scene-factory';

/** Geometrias e materiais usados pelos objetos visíveis da cena. */
function collectResources(scene: THREE.Scene): Set<THREE.BufferGeometry | THREE.Material> {
  const resources = new Set<THREE.BufferGeometry | THREE.Material>();

  scene.traverse((object) => {
    if (
      object instanceof THREE.Mesh ||
      object instanceof THREE.Line ||
      object instanceof THREE.Points
    ) {
      resources.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        resources.add(material);
      }
    }
  });

  return resources;
}

describe('scene-factory', () => {
  it('cria um cubo para cada posição da grade do perfil', () => {
    expect(createScene(MOBILE_PROFILE).cubes.mesh.count).toBe(MOBILE_PROFILE.cubeGrid ** 2);
    expect(createScene(DESKTOP_PROFILE).cubes.mesh.count).toBe(DESKTOP_PROFILE.cubeGrid ** 2);
  });

  it('cria o número de planos flutuantes do perfil', () => {
    expect(createScene(MOBILE_PROFILE).floaters).toHaveLength(MOBILE_PROFILE.floaters);
    expect(createScene(DESKTOP_PROFILE).floaters).toHaveLength(DESKTOP_PROFILE.floaters);
  });

  it('disposeScene libera cada geometria e material da cena exatamente uma vez', () => {
    const { scene } = createScene(DESKTOP_PROFILE);
    const resources = collectResources(scene);
    const onDispose = vi.fn();
    resources.forEach((resource) => resource.addEventListener('dispose', onDispose));

    disposeScene(scene);

    expect(resources.size).toBeGreaterThan(0);
    expect(onDispose).toHaveBeenCalledTimes(resources.size);
  });

  it('applySceneTheme recolore fundo, névoa e cubos sem recriar a cena', () => {
    const { scene, cubes, themeTargets } = createScene(MOBILE_PROFILE);
    const cubeMaterial = cubes.material;

    applySceneTheme(themeTargets, 'light');
    expect(themeTargets.background.getHex()).toBe(0xf8fafc);
    expect(themeTargets.fog.color.getHex()).toBe(0xf8fafc);
    expect(cubeMaterial.color.getHex()).toBe(0xffffff);
    expect(scene.background).toBe(themeTargets.background);

    applySceneTheme(themeTargets, 'dark');
    expect(themeTargets.background.getHex()).toBe(0x000000);
    expect(cubes.material).toBe(cubeMaterial);
  });
});
