import React from 'react';
import Sketch from 'react-p5';

class VisualComponent extends React.Component {
	y = 0;
	direction = '^';

	render() {
		return (
			<div className="VisualComponent">
				<Sketch
					setup={(p5, parentRef) => {
						p5.createCanvas(200, 200).parent(parentRef);
					}}
					draw={p5 => {

						p5.background(0);
						p5.fill(255, this.y * 1.3, 0);
						p5.ellipse(p5.width / 2, this.y, 50);
						if (this.y > p5.height) this.direction = '';
						if (this.y < 0) {
							this.direction = '^';
						}
						if (this.direction === '^') this.y += 8;
                        else this.y -= 4;
                        
					}}
				/>
			</div>
		);
	}
}

export default VisualComponent;
