import { Input, Interface, clearTween, delayedCall } from '@alienkitty/space.js/three';

import { Data } from '../../data/Data.js';

import { store } from '../../config/Config.js';

export class HeaderNickname extends Interface {
	constructor() {
		super('.nickname');

		this.init();

		this.addListeners();
	}

	init() {
		this.css({
			position: 'relative',
			cssFloat: 'left'
		});

		this.nickname = new Input({
			placeholder: 'Nickname',
			maxlength: 10
		});
		this.nickname.css({
			position: 'relative',
			left: 10,
			top: 5,
			width: 78,
			height: 45
		});
		this.add(this.nickname);
	}

	addListeners() {
		this.nickname.events.on('update', this.onUpdate);
		this.nickname.events.on('complete', this.onComplete);
	}

	removeListeners() {
		this.nickname.events.off('update', this.onUpdate);
		this.nickname.events.off('complete', this.onComplete);
	}

	// Event handlers

	onUpdate = ({ value }) => {
		store.nickname = value;

		clearTween(this.timeout);

		this.timeout = delayedCall(200, () => {
			Data.Socket.nickname(value);
		});
	};

	onComplete = () => {
		this.nickname.blur();
	};

	// Public methods

	animateIn = () => {
		this.nickname.setValue(store.nickname);
		this.nickname.animateIn();
	};

	destroy = () => {
		this.removeListeners();

		return super.destroy();
	};
}
