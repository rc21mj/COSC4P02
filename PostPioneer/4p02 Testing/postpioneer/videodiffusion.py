import torch
from diffusers import StableDiffusionPipeline
from diffusers import StableVideoDiffusionPipeline
import os
import torch
import cv2
import numpy as np
from PIL import Image
from diffusers import StableVideoDiffusionPipeline

# Load Stable Diffusion (txt2img) pipeline
pipe = StableDiffusionPipeline.from_pretrained("CompVis/stable-diffusion-v1-4").to("cpu")

# Function to generate an image from text
def generate_image(prompt, save_path="generated_image.png"):
    with torch.no_grad():
        image = pipe(prompt).images[0]
        image.save(save_path)
    return save_path

# Example usage
image_path = generate_image("A futuristic city skyline at sunset")
print(f"Image saved at {image_path}")

# Load Stable Video Diffusion model
device = "cuda"
svd_pipe = StableVideoDiffusionPipeline.from_pretrained(
    "stabilityai/stable-video-diffusion-img2vid",
    torch_dtype=torch.float16,
).to(device)
# Function to generate video from an image
def generate_video(image_path, output_video="output.mp4", num_frames=25, fps=6):
    image = Image.open(image_path).convert("RGB")

    # Generate frames using SVD
    with torch.no_grad():
        video_frames = svd_pipe(image, num_frames=num_frames, decode_chunk_size=14).frames

    # Convert frames to video
    h, w = video_frames[0].shape[:2]
    writer = cv2.VideoWriter(output_video, cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))

    for frame in video_frames:
        frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        writer.write(frame_bgr)

    writer.release()
    return output_video

# Example usage
video_path = generate_video(image_path)
print(f"Generated video saved at {video_path}")