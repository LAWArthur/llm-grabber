import { desktopCapturer, screen } from 'electron';

export async function captureScreen() {
    const CAPTURE_SIZE = parseInt(process.env.CAPTURE_SIZE!)
    const HALF_SIZE = CAPTURE_SIZE / 2

    // Get current mouse cursor position
    const cursorPoint = screen.getCursorScreenPoint();

    // Get screen dimensions
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.size;

    // Capture the entire screen
    const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: { width, height }
    });

    const thumbnail = sources[0].thumbnail;

    // Calculate crop boundaries centered on cursor
    let x = cursorPoint.x - HALF_SIZE;
    let y = cursorPoint.y - HALF_SIZE;

    // Ensure we stay within screen bounds
    x = Math.max(0, Math.min(x, width - CAPTURE_SIZE));
    y = Math.max(0, Math.min(y, height - CAPTURE_SIZE));

    // Crop the image to 200x200 around cursor
    const croppedImage = thumbnail.crop({
        x: Math.floor(x),
        y: Math.floor(y),
        width: CAPTURE_SIZE,
        height: CAPTURE_SIZE
    });

    return croppedImage.toDataURL();
}