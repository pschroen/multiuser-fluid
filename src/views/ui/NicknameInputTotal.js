import { Global } from '../../config/Global.js';
import { Styles } from '../../config/Styles.js';
import { Interface } from '../../utils/Interface.js';

export class NicknameInputTotal extends Interface {
  constructor() {
    super('.total');

    this.actual = Global.NICKNAME.length;
    this.max = 10;
    this.animatedIn = false;

    this.initHTML();
  }

  initHTML() {
    this.css({
      bottom: 0,
      width: 'auto',
      height: 15,
      opacity: 0
    });

    this.count = new Interface('.count');
    this.count.css({
      ...Styles.monospaceSmall,
      opacity: 0.9
    });
    this.count.text(this.actual + '/' + this.max);
    this.add(this.count);
  }

  /**
   * Public methods
   */

  setValue = value => {
    this.actual = value.length;

    this.count.text(this.actual + '/' + this.max);
  };

  animateIn = () => {
    if (this.animatedIn) {
      return;
    }

    this.animatedIn = true;

    this.clearTween().css({ y: 10, opacity: 0 }).tween({ y: 0, opacity: 1 }, 500, 'easeOutCubic');
  };

  animateOut = () => {
    this.animatedIn = false;

    this.clearTween().tween({ opacity: 0 }, 200, 'easeInOutSine');
  };
}
