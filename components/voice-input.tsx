"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
// import { toast } from "sonner";

interface VoiceInputProps {
    onTranscript: (text: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null); // Using any for SpeechRecognition

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

            if (SpeechRecognition) {
                const speechRecognition = new SpeechRecognition();
                speechRecognition.continuous = false;
                speechRecognition.interimResults = false;
                speechRecognition.lang = "tr-TR";

                speechRecognition.onstart = () => {
                    setIsListening(true);
                };

                speechRecognition.onend = () => {
                    setIsListening(false);
                };

                speechRecognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    onTranscript(transcript);
                };

                speechRecognition.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                };

                setRecognition(speechRecognition);
            }
        }
    }, [onTranscript]);

    const toggleListening = () => {
        if (!recognition) {
            alert("Tarayıcınız sesli girişi desteklemiyor veya izin verilmedi.");
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    return (
        <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            onClick={toggleListening}
            className={`rounded-full transition-all duration-300 ${isListening ? "animate-pulse ring-4 ring-red-500/30" : "hover:bg-primary/10 hover:text-primary"
                }`}
            title="Sesli Giriş Yap"
        >
            {isListening ? (
                <MicOff className="h-5 w-5" />
            ) : (
                <Mic className="h-5 w-5" />
            )}
        </Button>
    );
}
