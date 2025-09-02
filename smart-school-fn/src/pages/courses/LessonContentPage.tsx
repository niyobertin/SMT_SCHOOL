import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchLessonContent, setCurrentContent, clearLessonContent } from '../../redux/features/lessons/lessonContentSlice';
import { ArrowLeft, FileText, FileArchive, PlayCircle, Volume2 } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';

const LessonContentPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    items: contents,
    currentContent,
    loading,
    error,
  } = useAppSelector((state) => state.lessonContent);

  useEffect(() => {
    if (lessonId) {
      dispatch(fetchLessonContent(lessonId));
    }
    
    return () => {
      dispatch(clearLessonContent());
    };
  }, [lessonId, dispatch]);


  const isPdf = (url: string) => {
    if (!url) return false;
    return url.includes('cloudinary.com') && url.includes('raw/upload');
  };

  const getPdfUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('cloudinary.com')) {
      return url;
    }
    return url;
  };

  const isVideo = (url: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const isAudio = (url: string) => {
    if (!url) return false;
    const audioExtensions = ['.mp3', '.wav', '.ogg'];
    return audioExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const isYouTubeUrl = (url: string) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const renderContent = () => {
    if (!currentContent) return null;

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{currentContent.title}</h1>
        
        {currentContent.videoUrl && (
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Video Content</h2>
            {isYouTubeUrl(currentContent.videoUrl) ? (
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={getYouTubeEmbedUrl(currentContent.videoUrl)}
                  title={currentContent.title}
                  className="w-full h-[500px] rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : isVideo(currentContent.videoUrl) ? (
              <video 
                src={currentContent.videoUrl} 
                controls 
                className="w-full rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                Unsupported video format. Please contact support.
              </div>
            )}
          </div>
        )}

        {currentContent.audioUrl && isAudio(currentContent.audioUrl) && (
          <div className="w-full max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Audio Content</h2>
            <audio 
              src={currentContent.audioUrl} 
              controls 
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {currentContent.pdfUrl && isPdf(currentContent.pdfUrl) && renderPdfViewer(currentContent.pdfUrl)}

        {currentContent.textBody && (
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-2">Text Content</h2>
            <div dangerouslySetInnerHTML={{ __html: currentContent.textBody }} />
          </div>
        )}

        {currentContent.createdAt && (
          <div className="text-sm text-gray-500 mt-4">
            Created on: {new Date(currentContent.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  };

  const renderPdfViewer = (url: string) => {
    const pdfUrl = getPdfUrl(url);
    
    return (
      <div className="w-full h-full">
        <div className="border rounded-lg overflow-hidden h-screen">
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
            aria-label="PDF Viewer"
          >
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="mb-4">Unable to display PDF directly. You can view it using the link below:</p>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open PDF in a new tab
              </a>
            </div>
          </object>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <div className="w-1/4 p-4 border-r">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-4/6 mb-2" />
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-1/2 mb-6" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-1/4 p-4 border-r overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Table of Content</h2>
        {contents.map((content, index) => (
          <button
            key={content.id || index}
            onClick={() => dispatch(setCurrentContent(content))}
            className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
              currentContent?.id === content.id
                ? 'bg-blue-100 text-blue-700'
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">
                {isPdf(content.pdfUrl || '') ? (
                  <FileArchive size={16} />
                ) : isVideo(content.videoUrl || '') ? (
                  <PlayCircle size={16} />
                ) : isAudio(content.audioUrl || '') ? (
                  <Volume2 size={16} />
                ) : (
                  <FileText size={16} />
                )}
              </span>
              {content.title || `Section ${index + 1}`}
            </div>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lessons
        </button>

        {currentContent ? (
          <div className="bg-white rounded-lg p-6">
            {renderContent()}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Select a content item from the sidebar to view it here
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonContentPage;
