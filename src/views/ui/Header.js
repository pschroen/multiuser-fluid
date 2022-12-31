import { Config } from '../../config/Config.js';
import { Events } from '../../config/Events.js';
import { Interface } from '../../utils/Interface.js';
import { Stage } from '../../controllers/Stage.js';
import { HeaderNickname } from './HeaderNickname.js';
import { HeaderInfo } from './HeaderInfo.js';

export class Header extends Interface {
  constructor() {
    super('.header');

    this.initHTML();
    this.initViews();

    this.addListeners();
    this.onResize();
  }

  initHTML() {
    this.css({
      left: 20,
      top: 20,
      right: 20,
      zIndex: 3
    });
  }

  initViews() {
    this.nickname = new HeaderNickname();
    this.nickname.css({
      x: -10,
      opacity: 0
    });
    this.add(this.nickname);

    this.info = new HeaderInfo();
    this.info.css({
      x: -10,
      opacity: 0
    });
    this.add(this.info);
  }

  addListeners() {
    Stage.events.on(Events.RESIZE, this.onResize);
  }

  removeListeners() {
    Stage.events.off(Events.RESIZE, this.onResize);
  }

  /**
   * Event handlers
   */

  onResize = () => {
    if (Stage.width < Config.BREAKPOINT) {
      this.css({
        left: 10,
        top: 10,
        right: 10
      });
    } else {
      this.css({
        left: 20,
        top: 20,
        right: 20
      });
    }
  };

  /**
   * Public methods
   */

  animateIn = () => {
    this.nickname.animateIn();
    this.nickname.tween({ x: 0, opacity: 1 }, 1000, 'easeOutQuart');
    this.info.tween({ x: 0, opacity: 1 }, 1000, 'easeOutQuart', 200);
  };

  animateOut = () => {
  };

  destroy = () => {
    this.removeListeners();

    return super.destroy();
  };
}
