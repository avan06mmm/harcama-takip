"use client";

import { useState, useRef, useCallback } from "react";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Check, X, Crop as CropIcon, Search } from "lucide-react";
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ReceiptScannerProps {
    onScanComplete: (amount: number) => void;
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [scannedAmount, setScannedAmount] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showCrop, setShowCrop] = useState(false);
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [isProcessing, setIsProcessing] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '');
                setShowCrop(true);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        // Initial crop: center 80%
        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                16 / 9,
                width,
                height,
            ),
            width,
            height,
        );
        setCrop(crop);
    };

    const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): HTMLCanvasElement => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height,
        );

        return canvas;
    };

    const handleScan = async () => {
        if (!imgRef.current || !completedCrop) return;

        setIsProcessing(true);
        setShowCrop(false);
        setIsScanning(true);

        try {
            const croppedCanvas = getCroppedImg(imgRef.current, completedCrop);
            const ctx = croppedCanvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) throw new Error("Canvas context not found");

            // Image Processing for better OCR
            const imageData = ctx.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                // Sharpen and threshold
                const contrast = gray > 150 ? 255 : gray < 100 ? 0 : gray;
                data[i] = contrast;
                data[i + 1] = contrast;
                data[i + 2] = contrast;
            }
            ctx.putImageData(imageData, 0, 0);

            const processedImage = croppedCanvas.toDataURL("image/png");

            // OCR Execution
            const worker = await createWorker('tur');
            const { data: { text } } = await worker.recognize(processedImage);
            await worker.terminate();

            console.log("OCR Text:", text);

            // Extraction Logic
            const cleanText = text.replace(/,/g, '.').replace(/\s/g, ' ');
            const pricePattern = /(\d+[\.,]\d{2})/g;
            const matches = cleanText.match(pricePattern);

            let foundAmount = 0;

            // Look for keywords
            const keywordRegex = /(toplam|total|tutar|odenecek|top|genel|ara|net)[^0-9\n]*(\d+[\.,]\d{2})/i;
            const keywordMatch = cleanText.match(keywordRegex);

            if (keywordMatch) {
                foundAmount = parseFloat(keywordMatch[2].replace(',', '.'));
            } else if (matches) {
                // Find largest number (usually total)
                const prices = matches.map(m => parseFloat(m.replace(',', '.')));
                foundAmount = Math.max(...prices);
            }

            if (foundAmount > 0) {
                setScannedAmount(foundAmount);
                setShowConfirm(true);
            } else {
                alert("Üzgünüm, tutarı seçili alanda bulamadım. Lütfen sadece tutarın olduğu kısmı kırpmaya çalışın.");
            }
        } catch (error) {
            console.error("OCR Error:", error);
            alert("Okuma işlemi sırasında bir hata oluştu.");
        } finally {
            setIsScanning(false);
            setIsProcessing(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <>
            <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={onSelectFile}
            />

            <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning || isProcessing}
                className="w-full h-12 border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all bg-primary/5 hover:bg-primary/10 rounded-xl"
            >
                {isScanning || isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                        <span className="font-medium">İşleniyor...</span>
                    </>
                ) : (
                    <>
                        <Camera className="mr-2 h-5 w-5 text-primary" />
                        <span className="font-medium text-primary">Fiş Tara & Yapay Zeka</span>
                    </>
                )}
            </Button>

            {/* Crop Modal */}
            {showCrop && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                            <div className="flex items-center gap-2">
                                <CropIcon className="h-5 w-5 text-primary" />
                                <h3 className="font-bold">Tutarı Çerçeve içine Alın</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowCrop(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/10">
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                className="max-w-full"
                            >
                                <img
                                    ref={imgRef}
                                    src={imgSrc}
                                    alt="Crop"
                                    onLoad={onImageLoad}
                                    style={{ maxHeight: '60vh', objectFit: 'contain' }}
                                />
                            </ReactCrop>
                        </div>

                        <div className="p-4 bg-background border-t flex flex-col gap-3">
                            <p className="text-xs text-muted-foreground text-center">
                                İpucu: Sadece toplam tutarın olduğu alanı seçmek başarı oranını artırır.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" onClick={() => setShowCrop(false)}>
                                    Vazgeç
                                </Button>
                                <Button onClick={handleScan} className="bg-primary hover:bg-primary/90">
                                    <Search className="mr-2 h-4 w-4" />
                                    Şimdi Tara
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && scannedAmount !== null && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-200">
                    <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border-2 border-primary/20 p-8 flex flex-col items-center">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-pulse">
                            <Check className="h-8 w-8 text-primary" />
                        </div>

                        <h3 className="text-2xl font-black mb-2 text-center">Tutar Algılandı!</h3>
                        <p className="text-muted-foreground text-center mb-8 text-sm">
                            Fişten okunan değeri onaylıyor musunuz?
                        </p>

                        <div className="bg-primary/5 p-6 rounded-2xl mb-8 w-full text-center border border-primary/10">
                            <span className="text-4xl font-black tracking-tighter text-primary">
                                {scannedAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-xl font-bold text-primary/60 ml-2">TL</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <Button
                                variant="outline"
                                size="lg"
                                className="rounded-xl"
                                onClick={() => {
                                    setShowConfirm(false);
                                    setScannedAmount(null);
                                }}
                            >
                                Hatalı
                            </Button>
                            <Button
                                size="lg"
                                className="rounded-xl shadow-lg shadow-primary/20"
                                onClick={() => {
                                    onScanComplete(scannedAmount);
                                    setShowConfirm(false);
                                    setScannedAmount(null);
                                }}
                            >
                                Onayla
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
