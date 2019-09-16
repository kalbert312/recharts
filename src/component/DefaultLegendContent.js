/**
 * @fileOverview Default Legend Content
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import pureRender from '../util/PureRender';
import Surface from '../container/Surface';
import Symbols from '../shape/Symbols';
import { filterEventsOfChild, LEGEND_TYPES } from '../util/ReactUtils';

const SIZE = 32;
const ICON_TYPES = LEGEND_TYPES.filter(type => type !== 'none');

@pureRender
class DefaultLegendContent extends Component {
  static displayName = 'Legend';

  static propTypes = {
    content: PropTypes.element,
    iconSize: PropTypes.number,
    iconType: PropTypes.oneOf(ICON_TYPES),
    layout: PropTypes.oneOf(['horizontal', 'vertical']),
    align: PropTypes.oneOf(['center', 'left', 'right']),
    verticalAlign: PropTypes.oneOf(['top', 'bottom', 'middle']),
    payload: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.any,
      id: PropTypes.any,
      type: PropTypes.oneOf(LEGEND_TYPES),
    })),
    inactiveColor: PropTypes.string,
    formatter: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onClick: PropTypes.func,
    withSeriesToggling: PropTypes.bool,
  };

  static defaultProps = {
    iconSize: 14,
    layout: 'horizontal',
    align: 'center',
    verticalAlign: 'middle',
    inactiveColor: '#ccc',
  };

  state = {
    hoveredEntry: null,
  };

  /**
   * Render the path of icon
   * @param data {Object} Data of each legend item
   * @param iconSize {number} icon size
   * @return {{ width: number, height: number, rendered: ReactElement }}
   */
  renderIcon(data, iconSize = SIZE) {
    const { inactiveColor } = this.props;
    const halfSize = iconSize / 2;
    const sixthSize = iconSize / 6;
    const thirdSize = iconSize / 3;
    const color = data.inactive ? inactiveColor : data.color;

    if (data.type === 'plainline') {
      return {
        width: iconSize,
        height: 4,
        rendered: (
          <line
            strokeWidth={4}
            fill="none"
            stroke={color}
            strokeDasharray={data.payload.strokeDasharray}
            x1={0}
            y1={halfSize}
            x2={iconSize}
            y2={halfSize}
            className="recharts-legend-icon"
          />
        )
      };
    } if (data.type === 'line') {
      return {
        width: iconSize,
        height: iconSize,
        rendered: (
          <path
            strokeWidth={4}
            fill="none"
            stroke={color}
            d={`M0,${halfSize}h${thirdSize}
            A${sixthSize},${sixthSize},0,1,1,${2 * thirdSize},${halfSize}
            H${iconSize}M${2 * thirdSize},${halfSize}
            A${sixthSize},${sixthSize},0,1,1,${thirdSize},${halfSize}`}
            className="recharts-legend-icon"
          />
        )
      };
    } if (data.type === 'rect') {
      return {
        width: iconSize,
        height: (iconSize * 3 / 4),
        rendered: (
          <path
            stroke="none"
            fill={color}
            d={`M0,0h${iconSize}v${iconSize * 3 / 4}h${-iconSize}z`}
            className="recharts-legend-icon"
          />
        )
      };
    }

    return {
      width: iconSize,
      height: iconSize,
      rendered: (
        <Symbols
          fill={color}
          cx={halfSize}
          cy={halfSize}
          size={iconSize}
          sizeType="diameter"
          type={data.type}
        />
      ),
    };
  }

  onMouseEnterLI = (entry, event) => { console.log("ENTER"); this.setState({ hoveredEntry: entry }) };
  onMouseLeaveLI = (entry, event) => { console.log("LEAVE"); this.setState({ hoveredEntry: null }) };

  /**
   * Draw items of legend
   * @return {ReactElement} Items
   */
  renderItems() {
    const { payload, iconSize, inactiveColor, layout, formatter, withSeriesToggling } = this.props;
    const { hoveredEntry } = this.state;
    const itemStyle = {
      display: layout === 'horizontal' ? 'inline-block' : 'block',
      marginRight: 10,
    };
    const svgStyleBase = { display: 'inline-block', verticalAlign: 'middle', marginRight: 4, transition: "all ease .1s" };

    return payload.map((entry, i) => {
      const finalFormatter = entry.formatter || formatter;
      const className = classNames({
        'recharts-legend-item': true,
        [`legend-item-${i}`]: true,
        inactive: entry.inactive,
      });

      if (entry.type === 'none') {
        return null;
      }

      const icon = this.renderIcon(entry, iconSize);

      const offset = 10; // enough room for a glow
      const viewBox = { x: offset / -2, y: offset / -2, width: icon.width + offset, height: icon.height + offset };

      let svgStyle = {
        ...svgStyleBase,
      };

      if (withSeriesToggling) {
        const hovered = hoveredEntry && hoveredEntry.dataKey === entry.dataKey;
        if (hovered) {
          svgStyle.filter = `drop-shadow(0 0 3px ${entry.inactive ? inactiveColor : (entry.color || "currentColor")}`;
        }
      }

      return (
        <li
          className={className}
          style={itemStyle}
          key={`legend-item-${i}`}
          {...filterEventsOfChild(this.props, entry, i)}
          onMouseEnter={(e) => this.onMouseEnterLI(entry, e)}
          onMouseLeave={(e) => this.onMouseLeaveLI(entry, e)}
        >
          <Surface width={icon.width + offset} height={icon.height + offset} viewBox={viewBox} style={svgStyle}>
            {icon.rendered}
          </Surface>
          <span className="recharts-legend-item-text">
            {finalFormatter ? finalFormatter(entry.value, entry, i) : entry.value}
          </span>
        </li>
      );
    });
  }

  render() {
    const { payload, layout, align } = this.props;

    if (!payload || !payload.length) { return null; }

    const finalStyle = {
      padding: 0,
      margin: 0,
      textAlign: layout === 'horizontal' ? align : 'left',
    };

    return (
      <ul className="recharts-default-legend" style={finalStyle}>
        {this.renderItems()}
      </ul>
    );
  }
}

export default DefaultLegendContent;
