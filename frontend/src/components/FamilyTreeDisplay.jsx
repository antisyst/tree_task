import PropTypes from "prop-types";
import { Tree } from "react-d3-tree";

const FamilyTreeDisplay = ({ treeData, translate, onZoom }) => {
  return (
    <div className="tree-container">
      <Tree
        data={treeData}
        translate={translate}
        zoomable={true}
        zoom={1}
        orientation="vertical"
        collapsible={true}
        separation={{ siblings: 1.5, nonSiblings: 2 }}
        zoomAndPan={{
          scaleExtent: [0.1, 5],
          translateExtent: { x: [-1000, 500], y: [-500, 500] },
          onZoom: onZoom,
        }}
      />
    </div>
  );
};

FamilyTreeDisplay.propTypes = {
  treeData: PropTypes.object.isRequired,
  translate: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
  onZoom: PropTypes.func.isRequired,
};

export default FamilyTreeDisplay;