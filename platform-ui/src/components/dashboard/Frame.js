import styled, { css } from 'styled-components';

const Frame = styled.iframe`
  width: 100%;
  min-height: 80vh;

  border: none;

  ${({ src }) => !src && css`
    background: linear-gradient(to right, #000 33%, #fff 0%) top/10px 1px repeat-x,
                linear-gradient(#000 33%, #fff 0%) right/1px 10px repeat-y,
                linear-gradient(to right, #000 33%, #fff 0%) bottom/10px 1px repeat-x,
                linear-gradient(#000 33%, #fff 0%) left/1px 10px repeat-y;
  `}
`;

export default Frame;
