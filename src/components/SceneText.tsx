import { Text } from '@react-three/drei';

type Props = {
  children: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  fontSize?: number;
  color?: string;
  font?: string;
  italic?: boolean;
  maxWidth?: number;
  anchorX?: 'left' | 'center' | 'right';
  anchorY?: 'top' | 'middle' | 'bottom' | 'top-baseline' | 'bottom-baseline';
  letterSpacing?: number;
  lineHeight?: number;
};

// Drei's <Text> uses Troika under the hood. If `font` is omitted, Troika
// falls back to its built-in Roboto. For now we ship without custom fonts
// to avoid CDN font load issues — easy to swap later via FONT_* constants.

export const FONT_SERIF: string | undefined = undefined; // pending custom italic serif TTF
export const FONT_INTER: string | undefined = undefined;
export const FONT_MONO:  string | undefined = undefined;

export function SceneText({
  children,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  fontSize = 0.18,
  color = '#F4F3EE',
  font,
  maxWidth = 4.0,
  anchorX = 'left',
  anchorY = 'middle',
  letterSpacing = -0.02,
  lineHeight = 1.05,
}: Props) {
  return (
    <Text
      position={position}
      rotation={rotation}
      font={font}
      fontSize={fontSize}
      color={color}
      maxWidth={maxWidth}
      anchorX={anchorX}
      anchorY={anchorY}
      letterSpacing={letterSpacing}
      lineHeight={lineHeight}
    >
      {children}
    </Text>
  );
}

export const SceneMono = (props: Props) => (
  <SceneText
    {...props}
    fontSize={props.fontSize ?? 0.07}
    color={props.color ?? '#9A9A92'}
    letterSpacing={props.letterSpacing ?? 0.18}
  />
);
