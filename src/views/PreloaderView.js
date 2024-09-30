import { Input, Interface, clearTween, delayedCall, tween } from '@alienkitty/space.js/three';

import { Data } from '../data/Data.js';

import { isMobile, store } from '../config/Config.js';

export class PreloaderView extends Interface {
  constructor() {
    super('.preloader');

    this.progress = 0;

    this.init();

    this.addListeners();
  }

  init() {
    this.css({
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bg-color)',
      zIndex: 100,
      pointerEvents: 'none'
    });

    this.bg = new Interface('.bg');
    this.bg.hide();
    this.bg.css({
      position: 'absolute',
      width: '100%',
      height: '100%',
      pointerEvents: 'auto'
    });
    this.add(this.bg);

    this.nickname = new Input({
      placeholder: 'Nickname',
      maxlength: 10
    });
    this.nickname.css({
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: 78,
      height: 45,
      marginLeft: -78 / 2,
      marginTop: -108
    });
    this.add(this.nickname);

    this.number = new Interface('.number');
    this.number.css({
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: 150,
      height: 25,
      marginLeft: -150 / 2,
      marginTop: -25 / 2,
      webkitUserSelect: 'none',
      userSelect: 'none'
    });
    this.add(this.number);

    this.number.content = new Interface('.content');
    this.number.content.css({
      position: 'absolute',
      width: '100%',
      fontSize: 'var(--ui-title-font-size)',
      lineHeight: 25,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: 'var(--ui-title-letter-spacing)',
      textAlign: 'center',
      whiteSpace: 'nowrap',
      opacity: 0.4
    });
    this.number.content.text(0);
    this.number.add(this.number.content);

    this.title = new Interface('.title');
    this.title.css({
      position: 'absolute',
      left: '50%',
      top: '50%',
      width: 600,
      height: 25,
      marginLeft: -600 / 2,
      marginTop: -25 / 2,
      webkitUserSelect: 'none',
      userSelect: 'none',
      opacity: 0
    });
    this.add(this.title);

    this.title.content = new Interface('.content');
    this.title.content.css({
      position: 'absolute',
      width: '100%',
      fontSize: 'var(--ui-title-font-size)',
      lineHeight: 25,
      letterSpacing: 'var(--ui-title-letter-spacing)',
      textAlign: 'center',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      opacity: 0.4
    });
    this.title.content.text(isMobile ? 'Put on your headphones' : 'Turn up your speakers');
    this.title.add(this.title.content);
  }

  addStartButton() {
    this.number.tween({ opacity: 0 }, 200, 'easeOutSine', () => {
      this.number.hide();
      this.title.css({ y: 10, opacity: 0 }).tween({ y: 0, opacity: 1 }, 1000, 'easeOutQuart', 100);

      this.timeout1 = delayedCall(7000, () => this.swapTitle((isMobile ? 'Tap' : 'Click') + ' anywhere'));
      this.timeout2 = delayedCall(14000, () => this.swapTitle(isMobile ? 'Tap tap!' : 'Click!'));
    });
  }

  swapTitle(text) {
    this.title.tween({ y: -10, opacity: 0 }, 300, 'easeInSine', () => {
      if (!this.title) {
        return;
      }

      this.title.content.text(text);
      this.title.css({ y: 10 }).tween({ y: 0, opacity: 1 }, 1000, 'easeOutCubic');
    });
  }

  addListeners() {
    this.bg.element.addEventListener('pointerdown', this.onPointerDown);
    this.nickname.events.on('update', this.onUpdate);
    this.nickname.events.on('complete', this.onComplete);
  }

  removeListeners() {
    this.bg.element.removeEventListener('pointerdown', this.onPointerDown);
    this.nickname.events.off('update', this.onUpdate);
    this.nickname.events.off('complete', this.onComplete);
  }

  // Event handlers

  onPointerDown = () => {
    this.events.emit('start');
  };

  onUpdate = ({ value }) => {
    store.nickname = value;

    clearTween(this.timeout);

    this.timeout = delayedCall(200, () => {
      Data.Socket.nickname(value);
    });
  };

  onComplete = () => {
    if (!this.isComplete) {
      return;
    }

    this.events.emit('start');
  };

  onProgress = ({ progress }) => {
    clearTween(this);

    tween(this, { progress }, 2000, 'easeInOutSine', null, () => {
      this.number.content.text(Math.round(100 * this.progress));

      if (this.progress === 1 && !this.isComplete) {
        this.isComplete = true;

        this.events.emit('complete');

        if (this.nickname.isComplete) {
          this.events.emit('start');
        } else {
          this.bg.show();
          this.addStartButton();
        }
      }
    });
  };

  // Public methods

  animateIn = async () => {
    await this.nickname.animateIn();
    this.nickname.focus();
  };

  animateOut = () => {
    this.number.clearTween().tween({ opacity: 0 }, 200, 'easeOutSine');
    this.title.clearTween().tween({ opacity: 0 }, 200, 'easeOutSine');
    return this.tween({ opacity: 0 }, 600, 'easeInOutSine');
  };

  destroy = () => {
    this.removeListeners();

    clearTween(this.timeout1);
    clearTween(this.timeout2);

    return super.destroy();
  };
}
