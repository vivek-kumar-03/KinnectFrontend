import { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from 'react-icons/bs';

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    
    setIsSending(true);
    
    try {
      // Send the message
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });
      
      // Clear the input fields
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Show success message
      toast.success("Message sent!");
    } catch (error) {
      console.error("Failed to send message:", error);
      // Error message is already shown by the chat store
    } finally {
      setIsSending(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onEmojiClick = (emojiData) => {
    setText(prevText => prevText + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="p-4 w-full backdrop-blur-sm border-t" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-xl border-2 shadow-md"
              style={{ borderColor: 'var(--border)' }}
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center hover:opacity-80 transition-colors shadow-lg"
              type="button"
              style={{ backgroundColor: 'var(--error)', color: 'white' }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-3">
        <div className="flex-1 flex gap-2">
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center transition-colors z-10 hover:text-primary"
              style={{ color: 'var(--text-primary)' }}
              disabled={isSending}
            >
              <BsEmojiSmile className="w-5 h-5" />
            </button>
            <input
              type="text"
              className="w-full px-12 md:px-14 py-3 md:py-4 border-2 rounded-full focus:outline-none transition-all duration-200 text-sm md:text-base"
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ 
                backgroundColor: 'var(--surface)', 
                borderColor: 'var(--border)', 
                color: 'var(--text-primary)',
                placeholder: 'var(--text-secondary)'
              }}
              disabled={isSending}
            />
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-20 shadow-xl rounded-lg overflow-hidden">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={isSending}
          />

          <button
            type="button"
            className={"hidden sm:flex w-12 h-12 md:w-14 md:h-14 rounded-full items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"}
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              backgroundColor: imagePreview ? 'var(--success)' : 'var(--surface)', 
              color: imagePreview ? 'white' : 'var(--text-secondary)',
              borderColor: 'var(--border)'
            }}
            disabled={isSending}
          >
            <Image className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
        <button
          type="submit"
          className={"w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"}
          disabled={(!text.trim() && !imagePreview) || isSending}
          style={{ 
            backgroundColor: ((!text.trim() && !imagePreview) || isSending) ? 'var(--surface)' : 'var(--primary)', 
            color: ((!text.trim() && !imagePreview) || isSending) ? 'var(--text-secondary)' : 'white',
            borderColor: ((!text.trim() && !imagePreview) || isSending) ? 'var(--border)' : 'var(--primary)',
            cursor: ((!text.trim() && !imagePreview) || isSending) ? 'not-allowed' : 'pointer'
          }}
        >
          {isSending ? (
            <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : (
            <Send className="w-5 h-5 md:w-6 md:h-6" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;