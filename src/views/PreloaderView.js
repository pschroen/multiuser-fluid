import { Device } from '../config/Device.js';
import { Styles } from '../config/Styles.js';
import { Events } from '../config/Events.js';
import { Interface } from '../utils/Interface.js';
import { NicknameInput } from './ui/NicknameInput.js';

import { clearTween, tween } from '../tween/Tween.js';

export class PreloaderView extends Interface {
  constructor() {
    super('.preloader');

    this.progress = 0;

    this.initHTML();
    this.initBackground();
    this.initNickname();
    this.initNumber();
    this.initTitle();

    this.addListeners();
  }

  initHTML() {
    this.css({
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--main-bg-color)',
      zIndex: 100,
      pointerEvents: 'none'
    });
  }

  initBackground() {
    this.bg = new Interface('.bg');
    this.bg.hide();
    this.bg.css({
      width: '100%',
      height: '100%',
      pointerEvents: 'auto'
    });
    this.add(this.bg);
  }

  initNickname() {
    this.nickname = new NicknameInput();
    this.nickname.css({
      left: '50%',
      top: '50%',
      width: 78,
      height: 45,
      marginLeft: -78 / 2,
      marginTop: -108
    });
    this.add(this.nickname);
  }

  initNumber() {
    this.number = new Interface('.number');
    this.number.css({
      left: '50%',
      top: '50%',
      width: 150,
      height: 25,
      marginLeft: -150 / 2,
      marginTop: -25 / 2
    });
    this.add(this.number);

    this.number.inner = new Interface('.inner');
    this.number.inner.css({
      width: '100%',
      ...Styles.monospaceLabel,
      lineHeight: 25,
      textAlign: 'center',
      whiteSpace: 'nowrap',
      opacity: 0.4
    });
    this.number.inner.text(0);
    this.number.add(this.number.inner);
  }

  initTitle() {
    this.title = new Interface('.title');
    this.title.css({
      left: '50%',
      top: '50%',
      width: 600,
      height: 25,
      marginLeft: -600 / 2,
      marginTop: -25 / 2,
      opacity: 0
    });
    this.add(this.title);

    this.title.inner = new Interface('.inner');
    this.title.inner.css({
      width: '100%',
      ...Styles.monospaceLabel,
      lineHeight: 25,
      textAlign: 'center',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      opacity: 0.4
    });
    this.title.inner.text(Device.mobile ? 'Put on your headphones' : 'Turn up your speakers');
    this.title.add(this.title.inner);
  }

  addStartButton() {
    this.number.tween({ opacity: 0 }, 200, 'easeOutSine', () => {
      this.number.hide();
      this.title.css({ y: 10, opacity: 0 }).tween({ y: 0, opacity: 1 }, 1000, 'easeOutQuart', 100);

      this.delayedCall(7000, () => this.swapTitle((Device.mobile ? 'Tap' : 'Click') + ' anywhere'));
      this.delayedCall(14000, () => this.swapTitle(Device.mobile ? 'Tap tap!' : 'Click!'));
    });
  }

  swapTitle(text) {
    this.title.tween({ y: -10, opacity: 0 }, 300, 'easeInSine', () => {
      if (!this.title) {
        return;
      }

      this.title.inner.text(text);
      this.title.css({ y: 10 }).tween({ y: 0, opacity: 1 }, 1000, 'easeOutCubic');
    });
  }

  addListeners() {
    this.bg.element.addEventListener('pointerdown', this.onPointerDown);
    this.nickname.events.on(Events.COMPLETE, this.onComplete);
  }

  removeListeners() {
    this.bg.element.removeEventListener('pointerdown', this.onPointerDown);
    this.nickname.events.off(Events.COMPLETE, this.onComplete);
  }

  /**
   * Event handlers
   */

  onPointerDown = () => {
    this.events.emit(Events.START);
  };

  onComplete = () => {
    if (!this.isComplete) {
      return;
    }

    this.events.emit(Events.START);
  };

  onProgress = ({ progress }) => {
    clearTween(this);
    tween(this, { progress }, 2000, 'easeInOutSine', null, () => {
      this.number.inner.text(Math.round(100 * this.progress));

      if (this.progress === 1 && !this.isComplete) {
        this.isComplete = true;

        this.events.emit(Events.COMPLETE);

        if (this.nickname.isComplete) {
          this.events.emit(Events.START);
        } else {
          this.bg.show();
          this.addStartButton();
        }
      }
    });
  };

  /**
   * Public methods
   */

  animateIn = async () => {
    await this.nickname.animateIn();
    this.nickname.focus();
  };

  animateOut = () => {
    this.number.clearTween().tween({ opacity: 0 }, 200, 'easeOutSine');
    this.title.clearTween().tween({ opacity: 0 }, 200, 'easeOutSine');
    return this.nickname.animateOut();
  };

  destroy = () => {
    this.removeListeners();

    return super.destroy();
  };
}
