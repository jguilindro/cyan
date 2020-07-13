import React from 'react';
import p5 from 'p5';
import '../styles/Visual.css';

class VisualComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visualWidth: window.innerWidth,
			visualHeight: window.innerHeight - 90
		}
		this.visualRef = React.createRef();
	}

	Sketch = (p5) => {
		let y = 0;
		let direction = '^';
		p5.setup = () => {
			p5.createCanvas(this.state.visualWidth, this.state.visualHeight);
		}

		p5.draw = () => {
			p5.background(0);
			p5.fill(255, y * 1.3, 0);
			p5.ellipse(p5.width / 2, y, 50);
			if (y > p5.height) direction = '';
			if (y < 0) {
				direction = '^';
			}
			if (direction === '^') y += 8;
			else y -= 4;

		}
		p5.windowResized = () => {
			p5.resizeCanvas(this.state.visualWidth, this.state.visualHeight);
		}
	}

	onResize() {
		this.setState({
			visualHeight: window.innerHeight - 90,
			visualWidth: window.innerWidth
		});
	}

	componentDidMount() {
		window.addEventListener('resize', this.onResize.bind(this));
		this.visualPanel = new p5(this.Sketch, this.visualRef.current);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onResize.bind(this));
	}

	render() {
		return (
			<div className="VisualComponent" ref={this.visualRef}>
			</div>
		);
	}
}

export default VisualComponent;
