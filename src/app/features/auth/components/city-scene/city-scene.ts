import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';
import * as THREE from 'three';
import { ThemeMode } from '../../../../core/services/theme.service';
import {
  CAMERA_HOME,
  CAMERA_SIDE,
  CAMERA_SIDE_TARGET,
  CAMERA_TARGET,
  DESKTOP_PROFILE,
  MOBILE_PROFILE,
  SceneObjects,
  ScenePerformanceProfile,
  animateCubeField,
  applySceneTheme,
  configureRenderer,
  createScene,
  disposeScene,
} from './scene-factory';

const MOBILE_QUERY = '(max-width: 767px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
/** Duração da troca entre as vistas. */
const VIEW_TRANSITION_SECONDS = 1.8;
/** Limite de avanço por quadro, para a transição não pular se a aba ficou oculta. */
const MAX_FRAME_STEP_SECONDS = 0.1;

/** Vista da câmera: aérea (de cima) ou lateral. */
export type CameraView = 'aerial' | 'side';

/** Renderizador e objetos da cena. Todos são liberados em `ngOnDestroy`. */
interface SceneContext extends SceneObjects {
  readonly renderer: THREE.WebGLRenderer;
}

/**
 * Cenário 3D animado do fundo do login: um campo de cubos visto de cima, com núcleo azul.
 * Este componente cuida só do ciclo de vida (inicialização, animação e limpeza); a montagem da
 * cena fica em `scene-factory.ts`. Sem WebGL, não desenha nada e o fundo preto continua legível.
 */
@Component({
  selector: 'app-city-scene',
  templateUrl: './city-scene.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityScene implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');

  private context: SceneContext | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private animated = false;
  /** 0 = vista aérea, 1 = vista lateral. A transição avança quadro a quadro até o alvo. */
  private viewProgress = 0;
  private viewTarget = 0;
  private lastSeconds = 0;
  private theme: ThemeMode = 'dark';

  ngAfterViewInit(): void {
    // Fora da zona do Angular: o loop de animação não dispara detecção de mudanças a cada frame.
    this.zone.runOutsideAngular(() => this.start());
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (!this.context) {
      return;
    }

    const { renderer, scene } = this.context;
    renderer.setAnimationLoop(null);
    disposeScene(scene);
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
    this.context = null;
  }

  /** Move a câmera para a vista pedida, com transição suave. Com movimento reduzido, troca direto. */
  setView(view: CameraView): void {
    this.viewTarget = view === 'side' ? 1 : 0;

    if (this.context && !this.animated) {
      this.viewProgress = this.viewTarget;
      this.renderFrame(0);
    }
  }

  /** Recolore a cena para o tema. Pode ser chamado antes da cena existir; vale ao montar. */
  setTheme(theme: ThemeMode): void {
    this.theme = theme;

    if (this.context) {
      applySceneTheme(this.context.themeTargets, theme);
      if (!this.animated) {
        this.renderFrame(0);
      }
    }
  }

  private readonly tick = (timeMs: number): void => {
    this.renderFrame(timeMs / 1000);
  };

  /** Pausa o loop com a aba oculta, para não gastar CPU e GPU à toa. */
  private readonly onVisibilityChange = (): void => {
    if (!this.context || !this.animated) {
      return;
    }
    this.context.renderer.setAnimationLoop(document.hidden ? null : this.tick);
  };

  private start(): void {
    if (!hasWebGL()) {
      return;
    }

    const host = this.container().nativeElement;
    const isMobile = window.matchMedia(MOBILE_QUERY).matches;
    const profile: ScenePerformanceProfile = isMobile ? MOBILE_PROFILE : DESKTOP_PROFILE;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: profile.antialias,
        powerPreference: 'high-performance',
      });
    } catch {
      // Contexto WebGL indisponível (ex.: desabilitado no navegador): segue só com o fundo.
      return;
    }

    try {
      configureRenderer(renderer, profile);
      this.context = { renderer, ...createScene(profile) };
      applySceneTheme(this.context.themeTargets, this.theme);
    } catch (error) {
      // Falha na montagem: libera o contexto WebGL já criado antes de propagar o erro.
      renderer.dispose();
      renderer.forceContextLoss();
      throw error;
    }

    host.append(renderer.domElement);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();

    this.animated = !window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (this.animated) {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      renderer.setAnimationLoop(document.hidden ? null : this.tick);
    } else {
      // Movimento reduzido: um único quadro estático, redesenhado apenas ao redimensionar.
      this.renderFrame(0);
    }
  }

  private resize(): void {
    if (!this.context) {
      return;
    }

    const host = this.container().nativeElement;
    const { renderer, camera } = this.context;
    const width = host.clientWidth;
    const height = host.clientHeight;

    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();

    if (!this.animated) {
      this.renderFrame(0);
    }
  }

  /** Avança a transição entre as vistas pelo tempo decorrido desde o último quadro. */
  private advanceView(seconds: number): void {
    const elapsed = Math.min(Math.max(seconds - this.lastSeconds, 0), MAX_FRAME_STEP_SECONDS);
    this.lastSeconds = seconds;

    const maxStep = elapsed / VIEW_TRANSITION_SECONDS;
    const remaining = this.viewTarget - this.viewProgress;
    this.viewProgress += Math.min(Math.max(remaining, -maxStep), maxStep);
  }

  private renderFrame(seconds: number): void {
    if (!this.context) {
      return;
    }

    const { renderer, scene, camera, cubes, core, floaters, particles } = this.context;

    this.advanceView(seconds);
    const eased = smoothstep(this.viewProgress);

    // Deriva lenta da câmera sobre o campo: o movimento de paralaxe dá profundidade sem custo extra.
    camera.position.set(
      lerp(CAMERA_HOME.x, CAMERA_SIDE.x, eased) + Math.sin(seconds * 0.06) * 4,
      lerp(CAMERA_HOME.y, CAMERA_SIDE.y, eased) + Math.sin(seconds * 0.04) * 2,
      lerp(CAMERA_HOME.z, CAMERA_SIDE.z, eased),
    );
    camera.lookAt(
      lerp(CAMERA_TARGET.x, CAMERA_SIDE_TARGET.x, eased),
      lerp(CAMERA_TARGET.y, CAMERA_SIDE_TARGET.y, eased),
      lerp(CAMERA_TARGET.z, CAMERA_SIDE_TARGET.z, eased),
    );

    animateCubeField(cubes, seconds);
    core.intensity = 12 + Math.sin(seconds * 1.2) * 4;

    for (const floater of floaters) {
      floater.mesh.position.y =
        floater.baseY + Math.sin(seconds * floater.speed + floater.phase) * 1.5;
      floater.mesh.rotation.y = seconds * floater.speed * 0.4;
    }

    particles.rotation.y = seconds * 0.015;
    renderer.render(scene, camera);
  }
}

function hasWebGL(): boolean {
  return typeof WebGLRenderingContext !== 'undefined';
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Curva em S: a câmera acelera no começo e desacelera ao chegar, sem corte brusco. */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}
