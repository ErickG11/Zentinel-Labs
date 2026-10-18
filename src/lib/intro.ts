import { REDUCED_MOTION_QUERY } from './motion';

export const INTRO_DONE_EVENT = 'zl:intro-done';
export const INTRO_SESSION_KEY = 'zl:intro-seen';
// La intro solo se reproduce en la home (/es, /en); en el resto de rutas se omite
export const INTRO_HOME_PATTERN = '^/(es|en)/?$';

interface IntroConditions {
  seen: boolean;
  reducedMotion: boolean;
}

export const shouldPlayIntro = ({ seen, reducedMotion }: IntroConditions): boolean =>
  !seen && !reducedMotion;

export const isIntroDone = (): boolean => document.documentElement.dataset.intro === 'done';

export const markIntroDone = (): void => {
  document.documentElement.dataset.intro = 'done';
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, '1');
  } catch {
    // Almacenamiento bloqueado: la intro se repetirá en la próxima carga
  }
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
};

// Corre en <head> antes del primer paint: decide si se muestra el preloader y si hay movimiento
// Solo se reproduce en la home. Si matchMedia falla se asume movimiento reducido; a los 8s se activa data-failsafe por si el JS de la app no corre
export const introInitScript = `(function(){var d=document.documentElement;var r=true;try{r=window.matchMedia('${REDUCED_MOTION_QUERY}').matches}catch(e){}var s=false;try{s=sessionStorage.getItem('${INTRO_SESSION_KEY}')==='1'}catch(e){}d.dataset.motion=r?'reduce':'ok';var h=new RegExp('${INTRO_HOME_PATTERN}').test(location.pathname);d.dataset.intro=(!s&&!r&&h)?'play':'skip';setTimeout(function(){d.setAttribute('data-failsafe','')},8000);})();`;
