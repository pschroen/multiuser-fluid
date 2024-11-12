import { Stage, UI, WebAudio, ticker, wait } from '@alienkitty/space.js/three';

import { Data } from '../data/Data.js';
import { AudioController } from './audio/AudioController.js';
import { WorldController } from './world/WorldController.js';
import { FluidController } from './world/FluidController.js';
import { PanelController } from './panel/PanelController.js';
import { TrackersView } from '../views/TrackersView.js';
import { HeaderNickname } from '../views/ui/HeaderNickname.js';

import { breakpoint, store } from '../config/Config.js';

export class App {
	static async init(loader) {
		this.loader = loader;

		const sound = localStorage.getItem('sound');
		store.sound = sound ? JSON.parse(sound) : true;

		this.initWorld();
		this.initViews();
		this.initControllers();

		this.addListeners();
		this.onResize();

		await Promise.all([
			document.fonts.ready,
			Data.Socket.ready(),
			this.loader.ready()
		]);

		this.initAudio();
		this.initPanel();

		FluidController.start();
	}

	static initWorld() {
		WorldController.init();
		Stage.add(WorldController.element);
	}

	static initViews() {
		this.trackers = new TrackersView();
		Stage.add(this.trackers);

		this.ui = new UI({
			fps: true,
			breakpoint,
			info: {
				content: 'Observer'
			},
			details: {
				background: true,
				title: 'Multiuser Fluid'.replace(/[\s.]+/g, '_'),
				content: /* html */ `
A fluid shader tribute to Mr.doob’s Multiuser Sketchpad from 2010. Multiuser Fluid is an experiment to combine UI and data visualization elements in a multiuser environment.
				`,
				links: [
					{
						title: 'Source code',
						link: 'https://github.com/pschroen/multiuser-fluid'
					},
					{
						title: 'Mr.doob’s Multiuser Sketchpad',
						link: 'https://glitch.com/edit/#!/multiuser-sketchpad'
					},
					{
						title: 'David A Roberts’ Single-pass Fluid Solver',
						link: 'https://www.shadertoy.com/view/XlsBDf'
					}
				]
			},
			detailsButton: true,
			muteButton: {
				sound: store.sound
			}
		});
		Stage.add(this.ui);

		this.nickname = new HeaderNickname();
		this.nickname.css({
			x: -10,
			opacity: 0
		});
		this.ui.header.add(this.nickname);
	}

	static initControllers() {
		const { renderer, screen, screenCamera } = WorldController;

		FluidController.init(renderer, screen, screenCamera, this.trackers, this.ui);
	}

	static initAudio() {
		WebAudio.init({ sampleRate: 48000 });
		WebAudio.load(this.loader.filter(path => /sounds/.test(path)));

		AudioController.init(this.ui);
	}

	static initPanel() {
		PanelController.init(this.ui);
	}

	static addListeners() {
		Stage.events.on('update', this.onUsers);
		Stage.events.on('details', this.onDetails);
		this.ui.muteButton.events.on('update', this.onMute);
		window.addEventListener('resize', this.onResize);
		ticker.add(this.onUpdate);
	}

	// Event handlers

	static onUsers = e => {
		this.ui.detailsButton.setData({ count: e.length });
	};

	static onDetails = ({ open }) => {
		if (open) {
			if (store.sound) {
				AudioController.trigger('about_section');
			}
		} else {
			if (store.sound) {
				AudioController.trigger('fluid_section');
			}
		}
	};

	static onMute = ({ sound }) => {
		if (sound) {
			AudioController.unmute();
		} else {
			AudioController.mute();
		}

		localStorage.setItem('sound', JSON.stringify(sound));

		store.sound = sound;
	};

	static onResize = () => {
		const width = document.documentElement.clientWidth;
		const height = document.documentElement.clientHeight;
		const dpr = 1; // Always 1

		AudioController.resize();
		WorldController.resize(width, height, dpr);
		FluidController.resize(width, height, dpr);
	};

	static onUpdate = (time, delta, frame) => {
		WorldController.update(time, delta, frame);
		FluidController.update();
		this.ui.update();
	};

	// Public methods

	static start = async () => {
		AudioController.start();
	};

	static animateIn = async () => {
		this.nickname.animateIn();
		FluidController.animateIn();

		await wait(1000);

		this.ui.animateIn();
	};
}
