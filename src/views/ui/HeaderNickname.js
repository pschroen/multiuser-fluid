import { Events } from '../../config/Events.js';
import { Interface } from '../../utils/Interface.js';
import { NicknameInput } from './NicknameInput.js';

export class HeaderNickname extends Interface {
  constructor() {
    super('.nickname');

    this.initHTML();
    this.initNickname();

    this.addListeners();
  }

  initHTML() {
    this.css({
      position: 'relative',
      cssFloat: 'left'
    });
  }

  initNickname() {
    this.nickname = new NicknameInput();
    this.nickname.css({
      left: 10,
      top: 5
    });
    this.add(this.nickname);
  }

  addListeners() {
    this.nickname.events.on(Events.COMPLETE, this.onComplete);
  }

  removeListeners() {
    this.nickname.events.off(Events.COMPLETE, this.onComplete);
  }

  /**
   * Event handlers
   */

  onComplete = () => {
    this.nickname.blur();
  };

  /**
   * Public methods
   */

  animateIn = () => {
    this.nickname.animateIn();
  };

  destroy = () => {
    this.removeListeners();

    return super.destroy();
  };
}
