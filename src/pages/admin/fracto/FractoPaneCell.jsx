import React, {Component} from 'react';
import styled from "styled-components";
// import ReactSlider from 'react-slider'

const newPaneSize = 160;
const bucketRoot = "https://mikehallstudio.s3.amazonaws.com/fracto/orbitals"

const WindowPaneWrapper = styled.div`
    margin: 0;
`;

const CellWrapper = styled.div`
    position: absolute;
    margin: 0;
`;

class WindowPane extends Component {
   render() {
      const {paneSize, parentId, inverted, bounds, viewport, level} = this.props;
      const sizePx = paneSize + "px";
      const fullBounds = bounds.top - bounds.bottom;
      const halfBounds = fullBounds / 2;
      return <WindowPaneWrapper>
         <FractoPaneCell
            top={0} left={0} viewport={viewport}
            bounds={{
               top: bounds.top,
               right: bounds.left + halfBounds,
               bottom: bounds.top - halfBounds,
               left: bounds.left
            }}
            inverted={inverted}
            cellId={parentId + (inverted ? "-10" : "-00")}
            size={paneSize}
            level={level + 1}/>
         <FractoPaneCell
            top={0} left={sizePx} viewport={viewport}
            bounds={{
               top: bounds.top,
               right: bounds.left + fullBounds,
               bottom: bounds.top - halfBounds,
               left: bounds.left + halfBounds
            }}
            inverted={inverted}
            cellId={parentId + (inverted ? "-11" : "-01")}
            size={paneSize}
            level={level + 1}/>
         <FractoPaneCell
            top={sizePx} left={0} viewport={viewport}
            bounds={{
               top: bounds.top - halfBounds,
               right: bounds.left + halfBounds,
               bottom: bounds.top - fullBounds,
               left: bounds.left
            }}
            inverted={inverted}
            cellId={parentId + (inverted ? "-00" : "-10")}
            size={paneSize}
            level={level + 1}/>
         <FractoPaneCell
            top={sizePx} left={sizePx} viewport={viewport}
            bounds={{
               top: bounds.top - halfBounds,
               right: bounds.left + fullBounds,
               bottom: bounds.top - fullBounds,
               left: bounds.left + halfBounds
            }}
            inverted={inverted}
            cellId={parentId + (inverted ? "-01" : "-11")}
            size={paneSize}
            level={level + 1}/>
      </WindowPaneWrapper>;
   }
}

export class FractoPaneCell extends Component {

   state = {
      empty: false,
      imagePath: "",
      imageName: ""
   }

   componentDidMount() {
      const imagePath = this.props.cellId.replace(/-/g, '/', -1);
      const imageName = "img_" + this.props.cellId + "_256.jpg";
      this.setState({
         imagePath: imagePath,
         imageName: imageName,
      });
   }

   render() {
      const {viewport, bounds, inverted, level, size, cellId, top, left} = this.props;
      const sizePx = size + "px";
      const actual_level = level ? level : 1;
      const windowPane = size > newPaneSize ? <WindowPane
         viewport={viewport}
         bounds={bounds}
         inverted={inverted}
         paneSize={size / 2}
         parentId={cellId}
         level={actual_level}/> : '';
      const outOfBounds =
         bounds.right < viewport.left ||
         bounds.bottom > viewport.top ||
         bounds.left > viewport.right ||
         bounds.top < viewport.bottom;
      const cellContent = outOfBounds ? '' : <div>
         <img
            alt={' '}
            onError={(e) => e.target.style.display = 'none'}
            style={{
               width: sizePx, height: sizePx,
               transform: inverted ? "scaleY(-1)" : "none"
            }}
            src={bucketRoot + "/" + this.state.imagePath + "/" + this.state.imageName}
         />
         {windowPane}
      </div>
      return this.state.empty ? '' : <CellWrapper
         style={{
            width: sizePx,
            height: sizePx,
            zIndex: actual_level,
            top: top,
            left: left,
         }}>
         {cellContent}
      </CellWrapper>;
   }
}

export default FractoPaneCell;
