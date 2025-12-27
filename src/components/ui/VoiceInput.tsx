import { Mic, X, Check } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

export const VoiceInput = ({ onSend }: { onSend: (text: string) => void }) => {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');

    const toggleListen = () => {
        if (!listening) {
            setListening(true);
            setTranscript("Simulating voice recognition... 'Replaced filter and checked oil levels.'");
        } else {
            setListening(false);
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={toggleListen}
                className={clsx(
                    "p-2 rounded-full transition-all flex items-center gap-2",
                    listening ? "bg-red-100 text-red-600 animate-pulse ring-2 ring-red-400" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
            >
                <Mic className="w-5 h-5" />
                {listening && <span className="text-xs font-bold px-1">Recording...</span>}
            </button>

            {listening && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-white p-3 rounded-xl shadow-xl border border-slate-200 z-50">
                    <p className="text-sm text-slate-700 italic mb-2">"{transcript}"</p>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => { setListening(false); setTranscript(''); }} className="p-1 hover:bg-slate-100 rounded">
                            <X className="w-4 h-4 text-red-500" />
                        </button>
                        <button
                            onClick={() => {
                                onSend(transcript);
                                setListening(false);
                                setTranscript('');
                            }}
                            className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
