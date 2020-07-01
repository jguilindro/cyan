import React from 'react';

class Keys extends React.Component {
    render() {
        return (
            <rect
                x={this.props.x}
                y={this.props.y}
                width={this.props.width}
                height={this.props.height}
                fill={this.props.fill}
                stroke={this.props.stroke}
                strokeWidth='3px'
            ></rect>
        );
    }
}

export default Keys;
