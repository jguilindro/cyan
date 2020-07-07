import React from 'react';

const CONSTANTS = {
    COLORS: ['#EE2B29', '#ff9800', '#ffff00', '#c6ff00', '#00e5ff', '#2979ff', '#651fff', '#d500f9'],
    BUTTONS_DEVICE: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']
}

class ControlsComponent extends React.Component {
    render() {
        return (
            CONSTANTS.COLORS.map((color, i) => {
                return <button key={'button-' + i} style={{backgroundColor:color, transform: this.props.pressed[i] ? "scale(0.85, 0.85)" : null}}><span>{(i+1)}<br></br>{CONSTANTS.BUTTONS_DEVICE[i]}</span></button>;
            })
        );
    }
}

export default ControlsComponent;
