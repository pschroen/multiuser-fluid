import { Events } from '../config/Events.js';
import { Global } from '../config/Global.js';
import { Assets } from '../loaders/Assets.js';
import { WebAudio } from '../utils/audio/WebAudio.js';
import { AudioController } from './audio/AudioController.js';
import { WorldController } from './world/WorldController.js';
import { FluidController } from './world/FluidController.js';
import { Stage } from './Stage.js';
import { Trackers } from '../views/Trackers.js';
import { UI } from '../views/UI.js';

import { ticker } from '../tween/Ticker.js';
import { wait } from '../tween/Tween.js';

export class App {
  static async init(loader) {
    this.loader = loader;

    const sound = localStorage.getItem('sound');
    Global.SOUND = sound ? JSON.parse(sound) : true;

    this.initWorld();
    this.initViews();
    this.initControllers();

    this.addListeners();
    this.onResize();

    await this.loader.ready();

    WebAudio.init(Assets.filter(path => /sounds/.test(path)), { sampleRate: 48000 });
    AudioController.init();
  }

  static initWorld() {
    WorldController.init();
    Stage.add(WorldController.element);
  }

  static initViews() {
    this.trackers = new Trackers();
    Stage.add(this.trackers);

    this.ui = new UI();
    Stage.add(this.ui);
  }

  static initControllers() {
    const { renderer, scene, camera, screen } = WorldController;

    FluidController.init(renderer, scene, camera, screen, this.trackers);
  }

  static addListeners() {
    Stage.events.on(Events.RESIZE, this.onResize);
    ticker.add(this.onUpdate);
  }

  /**
   * Event handlers
   */

  static onResize = () => {
    const { width, height } = Stage;
    const dpr = 1;

    WorldController.resize(width, height, dpr);
    AudioController.resize();
    FluidController.resize(width, height, dpr);
  };

  static onUpdate = (time, delta, frame) => {
    WorldController.update(time, delta, frame);
    FluidController.update();

    this.ui.update();
  };

  /**
   * Public methods
   */

  static start = async () => {
    AudioController.start();
    AudioController.trigger('fluid_start');
    AudioController.trigger('bass_drum');
    FluidController.animateIn();

    await wait(1000);

    this.ui.animateIn();
  };
}
