import React from 'react';
import '../styles/Piano.css';
import Keys from './Keys';

const CONSTANTS = {
    COLORS: ['#EE2B29', '#ff9800', '#ffff00', '#c6ff00', '#00e5ff', '#2979ff', '#651fff', '#d500f9'],
    NUM_BUTTONS: 8,
    NOTES_PER_OCTAVE: 12,
    WHITE_NOTES_PER_OCTAVE: 7,
    LOWEST_PIANO_KEY_MIDI_NOTE: 21,
    GENIE_CHECKPOINT: 'https://storage.googleapis.com/magentadata/js/checkpoints/piano_genie/model/epiano/stp_iq_auto_contour_dt_166006',
}

class PianoComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            OCTAVES: 7,
            whiteNoteWidth: 20,
            blackNoteWidth: 20,
            whiteNoteHeight: 70,
            blackNoteHeight: 2 * 70 / 3,
            width: window.innerWidth,
            height: 20,
            keyWhitelist: null,
        }

    }

    resize(totalWhiteNotes) {
        const ratio = window.innerWidth / totalWhiteNotes;
        if (this.state.OCTAVES > 6) {
            this.setState({ whiteNoteWidth: ratio });
        } else {
            this.setState({ whiteNoteWidth: Math.floor(ratio) });
        }
        this.setState({ blackNoteWidth: this.state.whiteNoteWidth * 2 / 3 });
        this.setState({
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

    componentDidMount() {
        this.whenResized();
        window.addEventListener("resize", this.whenResized.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.whenResized.bind(this));
    }

    render() {
        const halfABlackNote = this.state.blackNoteWidth / 2;
        const keys = [];
        let x = 0;
        let y = 0;
        let index = 0;

        const blackNoteIndexes = [1, 3, 6, 8, 10];

        if (this.state.OCTAVES > 6) {
            keys.push(<Keys key={0} x={x} y={y} width={this.state.whiteNoteWidth} height={this.state.whiteNoteHeight} fill={'white'} stroke={'#141E30'}></Keys>);
            keys.push(<Keys key={2} x={this.state.whiteNoteWidth} y={y} width={this.state.whiteNoteWidth} height={this.state.whiteNoteHeight} fill={'white'} stroke={'#141E30'}></Keys>);
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
                    keys.push(<Keys key={index} x={x} y={y} width={this.state.whiteNoteWidth} height={this.state.whiteNoteHeight} fill={'white'} stroke={'#141E30'}></Keys>);
                    x += this.state.whiteNoteWidth;
                }
                index++;
            }
        }

        if (this.state.OCTAVES > 6) {
            // And an extra C at the end (if we're using all the octaves);
            keys.push(<Keys key={index} x={x} y={y} width={this.state.whiteNoteWidth} height={this.state.whiteNoteHeight} fill={'white'} stroke={'#141E30'}></Keys>);

            // Pianos start on an A:
            keys.push(<Keys key={1} x={this.state.whiteNoteWidth - halfABlackNote} y={y} width={this.state.blackNoteWidth} height={this.state.blackNoteHeight} fill={'black'} ></Keys>);
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
                    keys.push(<Keys key={index} x={x + this.state.whiteNoteWidth - halfABlackNote} y={y} width={this.state.blackNoteWidth} height={this.state.blackNoteHeight} fill={'black'} ></Keys>);
                } else {
                    x += this.state.whiteNoteWidth;
                }
                index++;
            }
        }

        return (
            <svg id="svg" width={this.state.width} height={this.state.height}>
                {
                    keys
                }
            </svg>
        );
    }
}

export default PianoComponent;
