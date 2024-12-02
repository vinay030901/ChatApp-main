import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    console.log("file is ", file);
    reader.onloadend = () => {
      if (file.type.startsWith("image/")) {
        setImagePreview(reader.result);
      } else if (file.type.startsWith("video/")) {
        setVideoPreview(reader.result);
      } else if (file.type.startsWith("audio/")) {
        setAudioPreview(reader.result);
      } else {
        const base64String = reader.result.split(",")[1];
        setDocumentPreview(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeVideo = () => {
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const removeAudio = () => {
    setAudioPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeDocument = () => {
    setDocumentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (
      !text.trim() &&
      !imagePreview &&
      !videoPreview &&
      !documentPreview &&
      !audioPreview
    )
      return;
    const messageData = new FormData();
    messageData.append("text", text.trim());
    if (fileInputRef.current.files[0]) {
      messageData.append("file", fileInputRef.current.files[0]);
    }
    try {
      await sendMessage(messageData);
      setText("");
      setImagePreview(null);
      setVideoPreview(null);
      setAudioPreview(null);
      setDocumentPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      {videoPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <video width="320" height="240" controls>
              <source src={videoPreview} type="video/mp4" />
            </video>
            <button
              onClick={removeVideo}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      {audioPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <audio controls>
              <source src={audioPreview} type="audio/mp3" />
            </audio>
            <button
              onClick={removeAudio}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {documentPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <p className="text-zinc-400">{documentPreview}</p>
            <button
              onClick={removeDocument}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*,video/*,application/pdf,audio/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={
            !text.trim() &&
            !imagePreview &&
            !videoPreview &&
            !documentPreview &&
            !audioPreview
          }
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
