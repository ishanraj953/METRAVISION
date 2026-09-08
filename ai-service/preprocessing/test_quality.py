from quality_check import assess_image_quality


image_path = "Phase1/image.jpg"


result = assess_image_quality(
    image_path
)


print("\n========== IMAGE QUALITY ==========\n")

for key, value in result.items():

    print(f"{key}: {value}")