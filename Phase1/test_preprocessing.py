from preprocessing import preprocess_image


image, metadata = preprocess_image(
    "Phase1/image.jpg"
)


print("\n========== RESULT ==========")

print(metadata)


if image is not None:

    print("\nPreprocessing successful!")

else:

    print("\nImage rejected!")