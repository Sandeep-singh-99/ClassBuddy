import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)


# Upload Image
def upload_image(file, folder: str = "fastapi_uploads"):
    """
    Upload image to Cloudinary.
    :param file: file object (UploadFile.file or open("file.png", "rb"))
    :param folder: folder name in Cloudinary
    :return: dict with url and public_id
    """
    try:
        result = cloudinary.uploader.upload(file, folder=folder)
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")

# Delete Image
def delete_image(public_id: str):
    """
    Delete image from Cloudinary.
    :param public_id: Cloudinary public_id of the image
    :return: success message
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        if result.get("result") == "ok":
            return {"message": "Image deleted successfully"}
        return {"message": "Image not found or already deleted"}
    except Exception as e:
        raise Exception(f"Cloudinary delete failed: {str(e)}")