"""
Resume routes for uploading and processing resumes.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.services.auth_service import get_current_user
from app.services.resume_service import upload_resume, get_user_resume
import io

router = APIRouter(prefix="/resume", tags=["Resume"])


async def extract_text_from_file(file: UploadFile) -> str:
    """Extract text from uploaded file based on extension."""
    content = await file.read()
    filename = file.filename.lower()
    
    try:
        if filename.endswith('.pdf'):
            import pypdf
            pdf_file = io.BytesIO(content)
            reader = pypdf.PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
            
        elif filename.endswith('.docx'):
            import docx
            docx_file = io.BytesIO(content)
            doc = docx.Document(docx_file)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
            
        elif filename.endswith('.txt'):
            return content.decode('utf-8')
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Please upload PDF, DOCX, or TXT."
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process file: {str(e)}"
        )


@router.post("/upload")
async def upload_resume_endpoint(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload resume file (PDF, DOCX, TXT) and extract skills.
    """
    print(f"DEBUG: Received upload request for file: {file.filename}")
    try:
        user_id = str(current_user["_id"])
        print(f"DEBUG: Processing for user: {user_id}")
        
        # Extract text from file
        resume_text = await extract_text_from_file(file)
        print(f"DEBUG: Extracted text length: {len(resume_text)}")
        
        if not resume_text.strip():
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract text from the file."
            )

        result = await upload_resume(user_id, resume_text)
        print("DEBUG: Upload successful")
        return result
    
    except HTTPException as e:
        print(f"DEBUG: HTTPException: {e.detail}")
        raise e
    except Exception as e:
        print(f"DEBUG: Exception: {str(e)}")
        # Import traceback to print full stack trace
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resume upload failed: {str(e)}"
        )


@router.get("/me")
async def get_my_resume(current_user: dict = Depends(get_current_user)):
    """
    Get current user's resume and extracted skills.
    """
    try:
        user_id = str(current_user["_id"])
        resume = await get_user_resume(user_id)
        
        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found. Please upload your resume first."
            )
        
        # Convert ObjectId to string for JSON serialization
        resume["_id"] = str(resume["_id"])
        
        return resume
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve resume: {str(e)}"
        )
