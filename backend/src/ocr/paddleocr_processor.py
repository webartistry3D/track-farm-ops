import sys
import json
import os
from paddleocr import PaddleOCR
import cv2
import numpy as np

class PaddleOCRProcessor:
    def __init__(self):
        # Initialize PaddleOCR with English language
        self.ocr = PaddleOCR(use_angle_cls=True, lang='en')
    
    def process_image(self, image_path):
        try:
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Could not read image file")
            
            # Preprocess image for better OCR accuracy
            img = self.preprocess_image(img)
            
            # Perform OCR
            results = self.ocr.ocr(img, cls=True)
            
            if not results or not results[0]:
                return {
                    "success": False,
                    "text": "",
                    "confidence": 0
                }
            
            # Extract text and calculate confidence
            text_lines = []
            confidences = []
            
            for line in results[0]:
                if line:
                    bbox, (text, confidence) = line
                    text_lines.append(text)
                    confidences.append(confidence)
            
            full_text = '\n'.join(text_lines)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                "success": True,
                "text": full_text,
                "confidence": avg_confidence * 100  # Convert to percentage
            }
            
        except Exception as e:
            return {
                "success": False,
                "text": "",
                "confidence": 0,
                "error": str(e)
            }
    
    def preprocess_image(self, img):
        """Preprocess image for better OCR results"""
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(thresh, None, h=10, templateWindowSize=7, searchWindowSize=21)
        
        return denoised

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "Usage: python paddleocr_processor.py <image_path>"
        }))
        return
    
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(json.dumps({
            "success": False,
            "error": f"Image file not found: {image_path}"
        }))
        return
    
    processor = PaddleOCRProcessor()
    result = processor.process_image(image_path)
    
    print(json.dumps(result))

if __name__ == "__main__":
    main()
