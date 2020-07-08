import React from 'react';
import '../styles/Piano.css';
import Keys from './Keys';
import ControlsComponent from './ControlsComponent';
const model = require('@magenta/music/node/piano_genie');
const core = require('@magenta/music/node/core');

const CONSTANTS = {
    COLORS: ['#EE2B29', '#ff9800', '#ffff00', '#c6ff00', '#00e5ff', '#2979ff', '#651fff', '#d500f9'],
    NUM_BUTTONS: 8,
    NOTES_PER_OCTAVE: 12,
    WHITE_NOTES_PER_OCTAVE: 7,
    LOWEST_PIANO_KEY_MIDI_NOTE: 21,
    GENIE_CHECKPOINT: 'https://storage.googleapis.com/magentadata/js/checkpoints/piano_genie/model/epiano/stp_iq_auto_contour_dt_166006',
}

const genie = new model.PianoGenie(CONSTANTS.GENIE_CHECKPOINT);
const heldButtonToVisualData = new Map();

//Button Mappings
const MAPPING_8 = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 };
const BUTTONS_DEVICE = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];

let NUM_BUTTONS = 8;
let BUTTON_MAPPING = MAPPING_8;


class PianoComponent extends React.Component {
    constructor(props) {
        super(props);
        this.player = new core.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');

        this.buttonDown = this.buttonDown.bind(this);
        this.buttonUp = this.buttonUp.bind(this);

        this.state = {
            OCTAVES: window.innerWidth > 700 ? 7 : 3,
            whiteNoteWidth: 20,
            blackNoteWidth: 20,
            whiteNoteHeight: 90,
            blackNoteHeight: 2 * 90 / 3,
            width: window.innerWidth,
            height: 20,
            keyWhitelist: null,
            TEMPERATURE: this.getTemperature(),
            keyColor: Array(90).fill(null),
            buttonsPressed: Array(8).fill(false)
        }

    }

    loadAllSamples() {
        const seq = { notes: [] };
        for (let i = 0; i < CONSTANTS.NOTES_PER_OCTAVE * 7; i++) {
            seq.notes.push({ pitch: CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE + i });
        }
        this.player.loadSamples(seq);
    }

    getTemperature() {
        const hash = parseFloat(this.parseHashParameters()['temperature']) || 0.25;
        const newTemp = Math.min(1, hash);
        console.log('Temperature = ', newTemp);
        return newTemp;
    }

    parseHashParameters() {
        const hash = window.location.hash.substring(1);
        const params = {}
        hash.split('&').map(hk => {
            let temp = hk.split('=');
            params[temp[0]] = temp[1]
            return params;
        });
        return params;
    }

    playNoteDown(pitch) {
        core.Player.tone.context.resume();
        this.player.playNoteDown({ pitch: pitch });
    }

    playNoteUp(pitch) {
        this.player.playNoteUp({ pitch: pitch });
    }

    resize(totalWhiteNotes) {
        const ratio = window.innerWidth / totalWhiteNotes;
        if (this.state.OCTAVES > 6) {
            this.setState({ whiteNoteWidth: ratio });
        } else {
            this.setState({ whiteNoteWidth: Math.floor(ratio) });
        }
        this.setState({
            blackNoteWidth: this.state.whiteNoteWidth * 2 / 3,
            width: window.innerWidth,
            height: this.state.whiteNoteHeight
        });
    }

    whenResized() {
        if (window.innerWidth > 700) {
            this.setState({ OCTAVES: 7 });
        } else {
            this.setState({ OCTAVES: 3 });
        }
        const bonusNotes = this.state.OCTAVES > 6 ? 4 : 0;  // starts on an A, ends on a C.
        const totalNotes = CONSTANTS.NOTES_PER_OCTAVE * this.state.OCTAVES + bonusNotes;
        const totalWhiteNotes = CONSTANTS.WHITE_NOTES_PER_OCTAVE * this.state.OCTAVES + (bonusNotes - 1);
        this.setState({
            keyWhitelist: Array(totalNotes).fill().map((x, i) => {
                if (this.state.OCTAVES > 6) return i;
                // Starting 3 semitones up on small screens (on a C), and a whole octave up.
                return i + 3 + CONSTANTS.NOTES_PER_OCTAVE;
            })
        });

        this.resize(totalWhiteNotes);
    }

    onKeyDown(event) {
        // Keydown fires continuously and we don't want that.
        if (event.repeat) {
            return;
        }
        if (event.key === '0' || event.key === 'r') {
            console.log('Resetting Genie!');
            genie.resetState();
        } else {
            const button = this.getButtonFromKeyCode(event.key);
            if (button != null) {
                this.buttonDown(button, true);
            }
        }
    }

    onKeyUp(event) {

        const button = this.getButtonFromKeyCode(event.key);
        if (button != null) {
            this.buttonUp(button);
        }
    }

    initGenie() {
        genie.initialize().then(() => {
            console.log('Genie Ready!');
        });
    }

    buttonDown(button) {
        // If button is already pressed down, do nothing.
        if (heldButtonToVisualData.has(button)) {
            return;
        }

        //Press the control button
        const newButtonsPressed = this.state.buttonsPressed.slice();
        newButtonsPressed[button] = true;
        this.setState({
            buttonsPressed: newButtonsPressed
        });

        const note = genie.nextFromKeyWhitelist(BUTTON_MAPPING[button], this.state.keyWhitelist, this.state.TEMPERATURE);
        const pitch = CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE + note;

        // Hear it.
        this.playNoteDown(pitch);

        // See it.
        this.highlightNote(note, button);

        heldButtonToVisualData.set(button, { note: note });
    }

    getButtonFromKeyCode(key) {
        // 1 - 8
        if (key >= '1' && key <= String(NUM_BUTTONS)) {
            return parseInt(key) - 1;
        }

        const index = BUTTONS_DEVICE.indexOf(key);
        return index !== -1 ? index : null;
    }

    highlightNote(note, button) {
        // Show the note on the piano.
        const newKeyColors = this.state.keyColor.slice();
        newKeyColors[note] = CONSTANTS.COLORS[button];
        this.setState({
            keyColor: newKeyColors
        });
    }

    buttonUp(button) {
        //Let go of the control button
        const newButtonsPressed = this.state.buttonsPressed.slice();
        newButtonsPressed[button] = false;
        this.setState({
            buttonsPressed: newButtonsPressed
        });

        const thing = heldButtonToVisualData.get(button);
        if (thing) {
            // Stop hearing the note.
            const pitch = CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE + thing.note;
            const newKeyColors = this.state.keyColor.slice();
            newKeyColors[thing.note] = null;
            this.setState({
                keyColor: newKeyColors
            });
            this.playNoteUp(pitch);

        }
        heldButtonToVisualData.delete(button);
    }

    componentDidMount() {
        this.initGenie();
        this.loadAllSamples();
        this.whenResized();
        window.addEventListener('resize', this.whenResized.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        genie.resetState();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.whenResized.bind(this));
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('keyup', this.onKeyUp.bind(this));
    }

    render() {
        const halfABlackNote = this.state.blackNoteWidth / 2;
        const keys = [];
        let x = 0;
        let y = 0;
        let index = 0;

        const blackNoteIndexes = [1, 3, 6, 8, 10];

        if (this.state.OCTAVES > 6) {
            keys.push(<Keys key={0} x={x} y={y} width={this.state.whiteNoteWidth} height={this.state.whiteNoteHeight} fill={this.state.keyColor[0] || 'white'} stroke={'#141E30'}></Keys>);
            keys.push(<Keys key={2} x={this.state.whiteNoteWidth} y={y} width={this.state.whiteNoteWidth} height={this.state.whiteNoteHeight} fill={this.state.keyColor[2] || 'white'} stroke={'#141E30'}></Keys>);
            index = 3;
            x = 2 * this.state.whiteNoteWidth;
        } else {
            // Starting 3 semitones up on small screens (on a C), and a whole octave up.
            index = 3 + CONSTANTS.NOTES_PER_OCTAVE;
        }
        // Draw the white notes.
        for (let o = 0; o < this.state.OCTAVES; o++) {
            for (let i = 0; i < CONSTANTS.NOTES_PER_OCTAVE; i++) {
                if (blackNoteIndexes.indexOf(i) === -1) {
                    keys.push(<Keys key={index} x={x} y={y} width={this.state.whiteNoteWidth} height={this.state.whiteNoteHeight} fill={this.state.keyColor[index] || 'white'} stroke={'#141E30'}></Keys>);
                    x += this.state.whiteNoteWidth;
                }
                index++;
            }
        }

        if (this.state.OCTAVES > 6) {
            // And an extra C at the end (if we're using all the octaves);
            keys.push(<Keys key={index} x={x} y={y} width={this.state.whiteNoteWidth} height={this.state.whiteNoteHeight} fill={this.state.keyColor[index] || 'white'} stroke={'#141E30'}></Keys>);

            // Pianos start on an A:
            keys.push(<Keys key={1} x={this.state.whiteNoteWidth - halfABlackNote} y={y} width={this.state.blackNoteWidth} height={this.state.blackNoteHeight} fill={this.state.keyColor[1] || 'black'} ></Keys>);
            index = 3;
            x = this.state.whiteNoteWidth;
        } else {
            // Starting 3 semitones up on small screens (on a C), and a whole octave up.
            index = 3 + CONSTANTS.NOTES_PER_OCTAVE;
            x = -this.state.whiteNoteWidth;
        }

        // Draw the black notes.
        for (let o = 0; o < this.state.OCTAVES; o++) {
            for (let i = 0; i < CONSTANTS.NOTES_PER_OCTAVE; i++) {
                if (blackNoteIndexes.indexOf(i) !== -1) {
                    keys.push(<Keys key={index} x={x + this.state.whiteNoteWidth - halfABlackNote} y={y} width={this.state.blackNoteWidth} height={this.state.blackNoteHeight} fill={this.state.keyColor[index] || 'black'} ></Keys>);
                } else {
                    x += this.state.whiteNoteWidth;
                }
                index++;
            }
        }

        return (
            <div className="piano">
                <div className="keys">
                    <svg id="svg" width={this.state.width} height={this.state.height}>
                        {
                            keys
                        }
                    </svg>
                </div>
                <div id="controls" className="controls">
                    <ControlsComponent pressed={this.state.buttonsPressed} buttonDown={this.buttonDown} buttonUp={this.buttonUp}></ControlsComponent>
                </div>
            </div>
        );
    }
}

export default PianoComponent;
