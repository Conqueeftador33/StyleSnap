
import { NextResponse, type NextRequest } from 'next/server';
import { analyzeClothingImage, type AnalyzeClothingImageInput, type AnalyzeClothingImageOutput } from '@/ai/flows/analyze-clothing-image';
import { auth } from '@/lib/firebase'; // For potential future auth check
import { onAuthStateChanged } from 'firebase/auth';

// Helper function to get current user (example, adjust as needed for server-side auth)
// In a real API, you'd likely verify a Bearer token (Firebase ID token)
async function getCurrentUser(req: NextRequest): Promise<boolean> {
  // This is a placeholder. For true API security, you'd verify a token.
  // For same-origin calls from your frontend where cookies manage auth,
  // this might be simpler, but direct API calls need token verification.
  // For now, let's assume if the request is coming, it's from an authorized context
  // or we can implement a more robust check later.
  // const authorization = req.headers.get('Authorization');
  // if (authorization?.startsWith('Bearer ')) {
  //   const idToken = authorization.split('Bearer ')[1];
  //   try {
  //     // admin.auth().verifyIdToken(idToken) // Using Firebase Admin SDK server-side
  //     return true; // Placeholder for successful token verification
  //   } catch (error) {
  //     return false;
  //   }
  // }
  return true; // Placeholder: for now, assume authorized if API is hit.
}


export async function POST(request: NextRequest) {
  try {
    // Basic check for authentication (placeholder, needs proper implementation for production)
    // const isAuthorized = await getCurrentUser(request);
    // if (!isAuthorized) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json() as AnalyzeClothingImageInput;

    if (!body.photoDataUri) {
      return NextResponse.json({ error: 'Missing photoDataUri in request body' }, { status: 400 });
    }

    const analysisResult: AnalyzeClothingImageOutput = await analyzeClothingImage({
      photoDataUri: body.photoDataUri,
    });

    return NextResponse.json(analysisResult, { status: 200 });

  } catch (error: any) {
    console.error('API - Analyze Image Error:', error);
    let errorMessage = "An unknown error occurred during AI analysis.";
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    
    // Check for specific Genkit/Gemini errors if possible to give more context
    if (error.details) { // Genkit errors often have a details field
        errorMessage = `${errorMessage} Details: ${error.details}`;
    }

    return NextResponse.json({ error: 'Failed to analyze image', details: errorMessage }, { status: 500 });
  }
}
