import { ref, onUnmounted } from 'vue';
import { useMutation } from '@tanstack/vue-query';
import { useQuasar } from 'quasar';
import { speech } from '@/services/speech';

export function useSpeech() {
  const q = useQuasar();
  const isRecording = ref(false);
  const mediaRecorder = ref<MediaRecorder | null>(null);
  const audioChunks = ref<Blob[]>([]);
  const isVoiceSupported = ref(!!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia);
  
  // Колбэк, который будет вызван при успешной транскрибации
  let onTranscriptionSuccess: ((text: string) => void) | null = null;

  const { mutate: transcribeSpeech, isPending: isTranscribing, isError: isTranscribeError } = useMutation({
    mutationFn: (files: File[]) => speech.transcribe(files),
    onSuccess: (res) => {
      if (onTranscriptionSuccess) {
        onTranscriptionSuccess(res.data.text);
      }
    }
  });

  const stopRecording = () => {
    if (mediaRecorder.value) {
      mediaRecorder.value.stop();
      isRecording.value = false;
    }
  };

  const startRecording = async (callback?: (text: string) => void) => {
    // Сохраняем колбэк, если он был передан
    if (callback) {
      onTranscriptionSuccess = callback;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.value = [];
      mediaRecorder.value = new MediaRecorder(stream);
      
      mediaRecorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.value.push(event.data);
        }
      };
      
      mediaRecorder.value.onstop = () => {
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        
        transcribeSpeech([audioFile]);
        
        // Остановить все треки в stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.value.start();
      isRecording.value = true;
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
      q.notify({
        color: 'negative',
        message: 'Не удалось получить доступ к микрофону'
      });
    }
  };

  const toggleVoiceRecording = (callback?: (text: string) => void) => {
    if (isRecording.value) {
      stopRecording();
    } else {
      startRecording(callback);
    }
  };

  onUnmounted(() => {
    if (isRecording.value) {
      stopRecording();
    }
  });

  return {
    isRecording,
    isTranscribing,
    isVoiceSupported,
    toggleVoiceRecording,
    transcribeSpeech
  };
} 