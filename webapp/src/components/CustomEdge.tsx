// src/components/CustomEdge.tsx

import React from 'react';
import { EdgeProps, getBezierPath } from 'react-flow-renderer';

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
  markerEnd,
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
      <path
        id={id}
        style={style}
        className='react-flow__edge-path solana'
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data?.label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: '12px' }}
            startOffset='50%'
            textAnchor='middle'
          >
            {data.label}
          </textPath>
        </text>
      )}
    </>
  );
};

export default CustomEdge;
