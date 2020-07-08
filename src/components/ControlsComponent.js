import React from 'react';

const CONSTANTS = {
    COLORS: ['#EE2B29', '#ff9800', '#ffff00', '#c6ff00', '#00e5ff', '#2979ff', '#651fff', '#d500f9'],
    BUTTONS_DEVICE: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']
}

let mouseDownButton = null;
let buttonControls = [];

class ControlsComponent extends React.Component {

    doTouchStart(event) {
        event.preventDefault();
        mouseDownButton = event.target;
        this.props.buttonDown(event.target.dataset.id);
    }

    doTouchEnd(event) {
        event.preventDefault();
        if (mouseDownButton && mouseDownButton !== event.target) {
            this.props.buttonUp(mouseDownButton.dataset.id);
        }
        mouseDownButton = null;
        this.props.buttonUp(event.target.dataset.id);
    }

    doTouchMove(event, down) {
        if (!mouseDownButton)
            return;

        if (down)
            this.props.buttonDown(event.target.dataset.id);
        else
            this.props.buttonUp(event.target.dataset.id);
    }

    componentDidMount() {
        buttonControls.forEach((button, i) => {
            button.addEventListener('touchstart', (event) => this.doTouchStart(event), { passive: true });
            button.addEventListener('touchend', (event) => this.doTouchEnd(event), { passive: true });

            const hasTouchEvents = ('ontouchstart' in window);
            if (!hasTouchEvents) {
                button.addEventListener('mousedown', (event) => this.doTouchStart(event));
                button.addEventListener('mouseup', (event) => this.doTouchEnd(event));
            }

            button.addEventListener('mouseover', (event) => this.doTouchMove(event, true));
            button.addEventListener('mouseout', (event) => this.doTouchMove(event, false));
            button.addEventListener('touchenter', (event) => this.doTouchMove(event, true));
            button.addEventListener('touchleave', (event) => this.doTouchMove(event, false));
        });
        document.getElementById('App').addEventListener('mouseenter', () => mouseDownButton = null);
    }

    componentWillUnmount() {
        buttonControls.forEach((button, i) => {
            button.removeEventListener('touchstart', this.doTouchStart.bind(this));
            button.removeEventListener('touchend', this.doTouchEnd.bind(this));
            button.removeEventListener('mousedown', this.doTouchStart.bind(this));
            button.removeEventListener('mouseup', this.doTouchEnd.bind(this));
            button.removeEventListener('mouseover', this.doTouchMove.bind(this));
            button.removeEventListener('mouseout', this.doTouchMove.bind(this));
            button.removeEventListener('touchenter', this.doTouchMove.bind(this));
            button.removeEventListener('touchleave', this.doTouchMove.bind(this));
        });
        document.getElementById('App').removeEventListener('mouseenter');
    }
    render() {
        return (
            CONSTANTS.COLORS.map((color, i) => {
                return <button
                    ref={elem => buttonControls.push(elem)}
                    key={'button-' + i}
                    data-id={i}
                    style={{ backgroundColor: color, transform: this.props.pressed[i] ? "scale(0.85, 0.85)" : null }}>
                    {(i + 1)}<br />{CONSTANTS.BUTTONS_DEVICE[i]}
                </button>;
            })
        );
    }
}

export default ControlsComponent;
