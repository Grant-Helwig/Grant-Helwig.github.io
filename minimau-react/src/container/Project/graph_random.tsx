import * as graphs from "../../container/Project/graph"
import {withTooltip as Rgraph} from '@visx/tooltip/';
import React, { useState, useMemo, useRef, useCallback } from 'react';
import { DefaultNode, Graph } from '@visx/network';
//import { array, number, string } from 'prop-types';
import {cloneDeep} from 'lodash';
import {Tooltip } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { voronoi, VoronoiPolygon } from '@visx/voronoi';
import { Group } from '@visx/group';
import { Circle } from '@visx/shape';
import { number } from 'prop-types';
import { localPoint } from '@visx/event';
import { scaleLinear } from '@visx/scale';
import { Point } from '@visx/point';

let tooltipTimeout: number;

const x = (d: graphs.CustomNode) => d.x;
const y = (d: graphs.CustomNode) => d.y;

export default Rgraph<graphs.NetworkProps, graphs.CustomNode>(
    ({ width, height,
      hideTooltip,
      showTooltip,
      tooltipOpen,
      tooltipData,
      tooltipLeft,
      tooltipTop, }: graphs.NetworkProps & WithTooltipProvidedProps<graphs.CustomNode> ) => {
    
      const xScale = useMemo(
        () =>
          scaleLinear<number>({
            domain: [1.3, 2.2],
            range: [0, width],
            clamp: true,
          }),
        [width],
      );
      const yScale = useMemo(
        () =>
          scaleLinear<number>({
            domain: [0.75, 1.6],
            range: [height, 0],
            clamp: true,
          }),
        [height],
      );
    
      const voronoiLayout = useMemo(
        () => 
          voronoi<graphs.CustomNode>({
            x: (d) => d.x,
            y: (d) => d.y,
            width: width,
            height: height,
          })(graphs.rnodes),
          [width, height]
      );
      const polygons = voronoiLayout.polygons();
      const svgRef = useRef<SVGSVGElement>(null);
      const [showVoronoi, setShowVoronoi] = useState(true);
      // event handlers
      var temp: graphs.CustomNode | undefined;
      const handleMouseMove = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
          if (tooltipTimeout) clearTimeout(tooltipTimeout);
          if (!svgRef.current) return;
    
          // find the nearest polygon to the current mouse position
          let point = localPoint(svgRef.current, event); 
          
          
          if (!point)return
          const neighborRadius = 100;
          const closest = voronoiLayout.find(point.x, point.y, neighborRadius);
          if (closest) {
            if(temp){
              if(temp.x!=closest.data.x && temp.y!=closest.data.y)
              temp.color = temp.colorSave;
            }
            temp = graphs.rnodes.find(({x,y}) => x==closest.data.x && y==closest.data.y )
            if(temp){
              temp!.color =  "#FFFFFF"
              closest.data.appt = temp?.appt
            } else {
              closest.data.appt!.name = " "
              closest.data.appt!.rev = 0
            }
            
            showTooltip({
              tooltipLeft: closest.data.x,
              tooltipTop: closest.data.y,
              tooltipData: closest.data,
            });
          }
        },
        [xScale, yScale, showTooltip, voronoiLayout],
      );
    
      const handleMouseLeave = useCallback(() => {
        tooltipTimeout = window.setTimeout(() => {
          hideTooltip();
        }, 300);
      }, [hideTooltip]);
    
      return width < 10 ? null : (
        <div>
        <svg width={width} height={height} ref={svgRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseLeave} >
          <rect width={width} height={height} rx={14} fill={graphs.background}
                />
                <Group pointerEvents="none">
                {graphs.rnodes.map((point, i) => (
                  <Circle
                    key={`point-${point.x}-${i}`}
                    className="dot"
                    cx={xScale(x(point))}
                    cy={yScale(y(point))}
                    r={i % 3 === 0 ? 2 : 3}
                    fill={tooltipData === point ? 'white' : '#f6c431'}
                  />
                ))}
                {showVoronoi && false &&
                  voronoiLayout
                    .polygons()
                    .map((polygon, i) => (
                      <VoronoiPolygon
                        key={`polygon-${i}`}
                        polygon={polygon}
                        fill="white"
                        stroke="white"
                        strokeWidth={1}
                        strokeOpacity={0.2}
                        fillOpacity={tooltipData === polygon.data ? 0.5 : 0}
                      />
                    ))}
              </Group>
          <Graph<graphs.CustomLink, graphs.CustomNode>
            graph={graphs.graph3}
            top={0}
            left={0}
            nodeComponent={({ node: { color } }) =>
              color ? <DefaultNode fill={color} /> : <DefaultNode />
            }
            linkComponent={({ link: { source, target, dashed } }) => (
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                strokeWidth={2}
                stroke="#999"
                strokeOpacity={0.6}
                strokeDasharray={dashed ? '8,4' : undefined}
              />
            )}
          />
          
          <rect width={width} height={height/9} x = {0} y = {height * (8/9)} rx={14} fill={graphs.background2}/>
          <text x="20" y="650" className="project-content">Total Route Distance: 
          {Math.round((graphs.dist_between_routes(graphs.random_method, graphs.heur_matrix) + Number.EPSILON) * 100) / 100}</text>
        </svg>
        {tooltipOpen && tooltipData && tooltipLeft != null && tooltipTop != null && (
              <Tooltip left={tooltipLeft + 10} top={tooltipTop + 10}>
                <div>
                  <strong>Name:</strong> {tooltipData.appt!.name!}
                </div>
                <div>
                  <strong>Revenue: $</strong> { Math.round((tooltipData.appt!.rev! + Number.EPSILON) * 100) / 100}
                </div>
                {/* <div>
                  <strong>Domain:</strong> {tooltipData.appt!.domain!}
                </div> */}
              </Tooltip>
            )}
            {/* {(
              <div>
                <label style={{ fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={showVoronoi}
                    onChange={() => setShowVoronoi(!showVoronoi)}
                  />
                  &nbsp;Show voronoi point map
                </label>
              </div>
            )} */}
        </div>
      );
    }
    )
