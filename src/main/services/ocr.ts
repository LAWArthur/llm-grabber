import axios from 'axios'
import { CharPosition, PositionOcrResult } from '../../shared/types';

export async function getTextWithPositionFromImage(imageBase64: string): Promise<PositionOcrResult> {
  var options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate?access_token=' + await getAccessToken(),
        'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
        },
        data: {
                'image': imageBase64,
                'language_type': 'auto_detect',
                'detect_direction': 'false',
                'vertexes_location': 'false',
                'paragraph': 'false',
                'probability': 'false',
                'char_probability': 'false',
                'multidirectional_recognize': 'false'
        }
    };

    return (await axios(options)).data
}

function getAccessToken() {

    let options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' 
          + process.env.BAIDU_API_KEY 
          + '&client_secret=' 
          + process.env.BAIDU_SECRET_KEY,
    }
    return new Promise((resolve, reject) => {
      axios(options)
          .then(res => {
              resolve(res.data.access_token)
          })
          .catch(error => {
              reject(error)
          })
    })
}

/**
 * Find the character nearest to the cursor position
 * @param ocrResult - OCR result with word boxes
 * @param cursorX - Mouse cursor X coordinate
 * @param cursorY - Mouse cursor Y coordinate
 * @returns Character position info or null if cursor is not in any word box
 */
export function findNearestCharAtPosition(
  ocrResult: PositionOcrResult,
  cursorX: number,
  cursorY: number
): CharPosition | null {
  // 1. Find the word box that contains the cursor position
  const containingBox = ocrResult.words_result.find(box => {
    const { left, top, width, height } = box.location
    return (
      cursorX >= left &&
      cursorX <= left + width &&
      cursorY >= top &&
      cursorY <= top + height
    )
  })

  // If no word box contains the cursor, return null
  if (!containingBox) {
    return null
  }

  // 2. Calculate character width (assuming equal width for all characters)
  const { left, top, width, height } = containingBox.location
  const words = containingBox.words
  const charWidth = width / words.length

  // 3. Find the character nearest to cursor through linear interpolation
  const relativeX = cursorX - left
  let charIndex = Math.floor(relativeX / charWidth)

  // Ensure index is within valid range
  if (charIndex < 0) charIndex = 0
  if (charIndex >= words.length) charIndex = words.length - 1

  // Find the word box index
  const wordBoxIndex = ocrResult.words_result.indexOf(containingBox)

  return {
    char: words[charIndex] || '',
    x: left + charIndex * charWidth + charWidth / 2, // center of character
    y: top + height / 2, // center of word box vertically
    index: charIndex,
    wordBoxIndex
  }
}