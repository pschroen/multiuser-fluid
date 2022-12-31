import { Events } from '../../config/Events.js';
import { Global } from '../../config/Global.js';
import { Interface } from '../../utils/Interface.js';
import { Data } from '../../data/Data.js';
import { NicknameInputField } from './NicknameInputField.js';
import { NicknameInputTotal } from './NicknameInputTotal.js';

export class NicknameInput extends Interface {
  constructor() {
    super('.input');

    this.initHTML();
    this.initViews();

    this.addListeners();
  }

  initHTML() {
    this.invisible();
    this.css({
      position: 'relative',
      width: 78,
      height: 45,
      zIndex: 99999,
      opacity: 0
    });
  }

  initViews() {
    this.input = new NicknameInputField();
    this.add(this.input);

    this.total = new NicknameInputTotal();
    this.add(this.total);
  }

  addListeners() {
    this.input.events.on(Events.HOVER, this.onHover);
    this.input.events.on(Events.TYPING, this.onTyping);
    this.input.events.on(Events.COMPLETE, this.onComplete);
  }

  removeListeners() {
    this.input.events.off(Events.HOVER, this.onHover);
    this.input.events.off(Events.TYPING, this.onTyping);
    this.input.events.off(Events.COMPLETE, this.onComplete);
  }

  /**
   * Event handlers
   */

  onHover = ({ type }) => {
    if (type === 'mouseenter') {
      this.total.animateIn();
      this.input.tween({ opacity: 1 }, 200, 'easeOutSine');
    } else {
      this.total.animateOut();
      this.input.tween({ opacity: 0.7 }, 200, 'easeOutSine');
    }
  };

  onTyping = ({ text }) => {
    this.total.setValue(text);

    Global.NICKNAME = text;

    this.clearTimeout(this.timeout);
    this.timeout = this.delayedCall(200, () => {
      Data.Socket.nickname(text);
    });
  };

  onComplete = () => {
    this.isComplete = true;

    this.events.emit(Events.COMPLETE);
  };

  /**
   * Public methods
   */

  focus = () => {
    this.input.focus();
  };

  blur = () => {
    this.input.blur();
  };

  animateIn = () => {
    this.input.setValue(Global.NICKNAME);
    this.total.setValue(Global.NICKNAME);

    this.visible();

    return this.tween({ opacity: 1 }, 1000, 'easeOutSine', () => {
      this.input.css({ pointerEvents: 'auto' });
    });
  };

  animateOut = () => {
    this.input.css({ pointerEvents: 'none' });

    return this.tween({ opacity: 0 }, 600, 'easeInOutSine', () => {
      this.invisible();
    });
  };

  destroy = () => {
    this.removeListeners();

    this.clearTimeout(this.timeout);

    return super.destroy();
  };
}
