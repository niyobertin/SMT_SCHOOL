import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fetchLessonContent,
  setCurrentContent,
  clearLessonContent,
} from '../../redux/features/lessons/lessonContentSlice';
import {
  ArrowLeft,
  FileText,
  FileArchive,
  PlayCircle,
  Volume2,
  X,
  Menu,
} from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatDistanceToNow } from 'date-fns';

const LessonContentPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  const isPdf = (url: string) =>
    !!url && url.includes('cloudinary.com') && url.includes('raw/upload');

  const getPdfUrl = (url: string) => (url ? url : '');

  const isVideo = (url: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const isAudio = (url: string) => {
    if (!url) return false;
    const audioExtensions = ['.mp3', '.wav', '.ogg'];
    return audioExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const isYouTubeUrl = (url: string) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/.test(url);

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const renderPdfViewer = (url: string) => {
    const pdfUrl = getPdfUrl(url);
    return (
      <div className="w-full h-full">
        <div className="border rounded-lg overflow-hidden h-screen">
          <object
            data={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            type="application/pdf"
            className="w-full h-full "
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            aria-label="PDF Viewer"
          >
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="mb-4">
                Unable to display PDF directly. You can view it using the link
                below:
              </p>
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

  const renderContent = () => {
    if (!currentContent) return null;
    return (
      <div className="space-y-2"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
      >
        <h1 className="text-2xl text-center font-bold">{currentContent.title}</h1>
        {currentContent.createdAt && (
          <p className="text-sm text-end text-gray-500">
            Created{' '}
            {formatDistanceToNow(new Date(currentContent.createdAt), {
              addSuffix: true,
            })}
          </p>
        )}

        {currentContent.videoUrl && (
          <div className="w-full max-w-4xl mx-auto">
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
            <audio src={currentContent.audioUrl} controls className="w-full">
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {currentContent.pdfUrl &&
          isPdf(currentContent.pdfUrl) &&
          (
            <div
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
              }}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onDragOver={(e) => e.preventDefault()}
              onPointerCancel={(e) => e.preventDefault()}
            >
              {renderPdfViewer(currentContent.pdfUrl)}
            </div>
          )}

        {currentContent.textBody && (
          <div className="prose max-w-5xl mx-auto no-print"
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onPointerCancel={(e) => e.preventDefault()}
          >
            <div dangerouslySetInnerHTML={{ __html: currentContent.textBody }} />
          </div>
        )}
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
      <div
        className={`transition-all duration-300 border-r bg-white
          ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden flex-shrink-0'}`}
      >
        <div className={isSidebarOpen ? 'p-4' : 'py-2 px-2'}>
          <div className={isSidebarOpen ? 'flex items-center space-x-4 mb-4' : 'fixed items-center space-x-4 mb-4'}>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className={isSidebarOpen ? 'block' : 'sr-only'}>Back</span>
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center text-black bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md"
            >
              {isSidebarOpen ? <X className="mr-2 h-4 w-4" /> : <Menu className="mr-2 h-4 w-4" />}
            </button>

          </div>
          <div className={isSidebarOpen ? 'block' : 'hidden'}>
            <h2 className="text-lg font-semibold mb-4">Table of Content</h2>
            {contents.map((content, index) => (
              <button
                key={content.id || index}
                onClick={() => dispatch(setCurrentContent(content))}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${currentContent?.id === content.id
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
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 p-2 md:p-2 overflow-y-auto bg-white rounded-lg px-2"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onPaste={(e) => e.preventDefault()}
      >
        {currentContent ? (
          <div>{renderContent()}</div>
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
