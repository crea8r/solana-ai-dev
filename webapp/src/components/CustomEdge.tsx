// src/components/CustomEdge.tsx

import React from 'react';
import { EdgeProps, getBezierPath } from 'react-flow-renderer';
import '../styles/CustomEdge.css';

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}) => {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <defs>
        <marker
          id="solana-arrowhead"
          markerWidth="8"
          markerHeight="8"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
          className="solana-arrowhead"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#808080" />
        </marker>
      </defs>

      <path
        id={id}
        d={edgePath}
        markerEnd="url(#solana-arrowhead)"
        className="react-flow__edge-path solana"
        style={style}
      />
      {data?.label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: '12px', fill: '#808080' }}
            startOffset="52%"
            textAnchor="middle"
            dy="5"
          >
            {data.label}
          </textPath>
        </text>
      )}
    </>
  );
};

export default CustomEdge;
