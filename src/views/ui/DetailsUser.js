import { Graph, Interface, Stage, ticker } from '@alienkitty/space.js/three';

export class DetailsUser extends Interface {
	constructor() {
		super('.user');

		this.infoWidth = parseFloat(Stage.rootStyle.getPropertyValue('--ui-panel-width').trim());
		this.width = this.infoWidth * 2;
		this.height = 60;

		this.data = {
			id: '',
			nickname: '',
			latency: 0,
			isDown: '',
			x: 0,
			y: 0
		};

		this.init();
	}

	init() {
		this.invisible();
		this.css({
			position: 'relative',
			width: this.width,
			height: this.height
		});

		this.graph = new Graph({
			width: this.width - this.infoWidth,
			height: this.height,
			range: 3,
			suffix: 'ms',
			ghost: true,
			noMarker: true
		});
		this.add(this.graph);

		this.container = new Interface('.container');
		this.container.css({
			position: 'absolute',
			left: 0,
			top: 0,
			width: this.width,
			height: this.height,
			pointerEvents: 'none',
			webkitUserSelect: 'none',
			userSelect: 'none'
		});
		this.add(this.container);

		this.content = new Interface('.content', 'pre');
		this.content.css({
			position: 'absolute',
			left: 0,
			top: 0,
			width: this.graph.width,
			height: this.height
		});
		this.container.add(this.content);

		this.info = new Interface('.info', 'pre');
		this.info.css({
			position: 'absolute',
			left: this.graph.width + 10,
			top: 0,
			width: this.infoWidth - 10,
			height: this.height
		});
		this.container.add(this.info);
	}

	addListeners() {
		ticker.add(this.onUpdate);
	}

	removeListeners() {
		ticker.remove(this.onUpdate);
	}

	// Event handlers

	onUpdate = () => {
		this.graph.update(this.data.latency);
	};

	// Public methods

	setData(data, e) {
		Object.assign(this.data, data, e);

		this.content.text(`${this.data.nickname}
${this.data.latency}ms`);

		this.info.text(`Mouse:  ${this.data.id}${this.data.isDown ? ' Down' : ''}
X:${this.data.x.toFixed(4).padStart(12, ' ')}
Y:${this.data.y.toFixed(4).padStart(12, ' ')}`);
	}

	animateIn(delay, fast) {
		this.clearTween();
		this.visible();

		this.graph.animateIn();

		if (fast) {
			this.css({ opacity: 0 }).tween({ opacity: 1 }, 400, 'easeOutCubic', delay);
		} else {
			this.css({ y: -10, opacity: 0 }).tween({ y: 0, opacity: 1 }, 400, 'easeOutCubic', delay);
		}
	}

	animateOut(callback) {
		this.graph.animateOut();

		this.clearTween().tween({ opacity: 0 }, 500, 'easeInCubic', () => {
			this.invisible();

			if (callback) {
				callback();
			}
		});
	}

	enable() {
		this.addListeners();
	}

	disable() {
		this.removeListeners();
	}

	destroy() {
		this.disable();

		return super.destroy();
	}
}