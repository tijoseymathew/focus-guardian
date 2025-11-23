from PIL import Image, ImageDraw, ImageFont

# Create simple icons with gradient background
def create_icon(size):
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw gradient circle background
    for i in range(size):
        for j in range(size):
            # Calculate distance from center
            dx = i - size/2
            dy = j - size/2
            distance = (dx*dx + dy*dy) ** 0.5
            
            if distance < size/2:
                # Create purple gradient
                t = distance / (size/2)
                r = int(102 + (118 - 102) * t)
                g = int(126 + (75 - 126) * t)
                b = int(234 + (162 - 234) * t)
                img.putpixel((i, j), (r, g, b, 255))
    
    # Draw target/focus symbol
    center = size // 2
    # Outer circle
    draw.ellipse([size*0.25, size*0.25, size*0.75, size*0.75], 
                 outline='white', width=max(2, size//16))
    # Inner circle
    draw.ellipse([size*0.4, size*0.4, size*0.6, size*0.6], 
                 fill='white')
    
    return img

# Create icons in different sizes
sizes = [16, 48, 128]
for size in sizes:
    icon = create_icon(size)
    icon.save(f'icon{size}.png')
    print(f'Created icon{size}.png')

print('Icons created successfully!')
