"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useTransactionStore } from "@/lib/store";
import { TransactionType } from "@/types/transaction";
import { Plus, X } from "lucide-react";
import Lottie from "lottie-react";
import { ReceiptScanner } from "./receipt-scanner";
import { VoiceInput } from "./voice-input";

const INCOME_CATEGORIES = ["Maaş", "Yatırım", "Freelance", "Hediye", "Diğer"];
const EXPENSE_CATEGORIES = [
  "Market",
  "Gıda",
  "Ulaşım",
  "Konut",
  "Eğlence",
  "Sağlık",
  "Eğitim",
  "Alışveriş",
  "Faturalar",
  "Diğer",
];

// Basit anahtar kelime haritası
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Market": ["market", "bakkal", "bim", "a101", "şok", "migros", "carrefour", "file", "hakmar", "ekmek", "süt", "yumurta"],
  "Gıda": ["yemek", "restoran", "cafe", "kahve", "simit", "döner", "burger", "pizza", "lahmacun", "kebap"],
  "Ulaşım": ["benzin", "mazot", "otobüs", "metro", "taksi", "uber", "bi taksi", "martı", "dolmuş", "bilet", "akbil"],
  "Konut": ["kira", "aidat", "tamirat", "tadilat", "boya", "musluk", "kombi"],
  "Eğlence": ["sinema", "tiyatro", "oyun", "netflix", "spotify", "youtube", "konser", "biletix", "maç"],
  "Sağlık": ["eczane", "ilaç", "doktor", "hastane", "muayene", "gözlük", "diş", "tahlil"],
  "Faturalar": ["elektrik", "su", "doğalgaz", "internet", "telefon", "fatura", "turkcell", "vodafone", "türk telekom"],
  "Eğitim": ["kitap", "kırtasiye", "kurs", "udemy", "okul", "harç", "dershane"],
  "Alışveriş": ["giyim", "kıyafet", "ayakkabı", "trendyol", "hepsiburada", "amazon", "zara", "lcw", "teknosa", "mediamarkt"],
};


export function TransactionForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(null);

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch('https://assets2.lottiefiles.com/packages/lf20_7W0ppE.json')
      .then(res => res.json())
      .then(data => setSuccessAnimation(data))
      .catch(err => console.error("Lottie fetch error:", err));
  }, []);

  const handleVoiceInput = (transcript: string) => {
    // 1. Tutar Bulma (Basit Regex)
    const amountMatch = transcript.match(/(\d+([.,]\d+)?)/);
    if (amountMatch) {
      const parsedAmount = parseFloat(amountMatch[0].replace(",", "."));
      if (!isNaN(parsedAmount)) {
        setAmount(parsedAmount.toString());
      }
    }

    // 2. Not olarak ayarla
    // Tutar kısmını nottan çıkarmak isteyebiliriz ama basitlik için tamamını not yapalım
    // Sadece "TL", "Lira" gibi kelimeleri temizleyebiliriz
    let cleanNote = transcript;
    setNote(cleanNote);

    // 3. Kategori Tahmini
    const lowerTranscript = transcript.toLowerCase();

    // Gelir mi Gider mi?
    const incomeKeywords = ["maaş", "gelir", "yatırım", "borç aldım", "kazanç"];
    const isIncome = incomeKeywords.some(w => lowerTranscript.includes(w));
    const newType: TransactionType = isIncome ? "income" : "expense";
    setType(newType);

    // Kategori Bulma
    let foundCategory = "";
    // O anki türe (gelir/gider) göre kategori ara
    const keywordsToSearch = isIncome ? {} : CATEGORY_KEYWORDS; // Gelir için keyword map yoksa boş geçebiliriz veya ekleyebiliriz

    if (!isIncome) {
      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(keyword => lowerTranscript.includes(keyword))) {
          foundCategory = cat;
          break;
        }
      }
    } else {
      // Basit gelir kategori eşleşmesi
      if (lowerTranscript.includes("maaş")) foundCategory = "Maaş";
      else if (lowerTranscript.includes("freelance")) foundCategory = "Freelance";
      else if (lowerTranscript.includes("yatırım")) foundCategory = "Yatırım";
      else foundCategory = "Diğer";
    }

    if (foundCategory) {
      setCategory(foundCategory);
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNote(value);

    // Eğer işlem türü Gider ise ve henüz kategori seçilmemişse veya otomatik seçilmişse
    if (type === 'expense') {
      const lowerNote = value.toLowerCase();

      for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(keyword => lowerNote.includes(keyword))) {
          setCategory(cat);
          break; // İlk eşleşen kategoriyi seç ve çık
        }
      }
    }
  };

  const addTransaction = useTransactionStore((state) => state.addTransaction);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category) return;

    addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      date,
      note,
    });

    setAmount("");
    setCategory("");
    setNote("");
    setIsOpen(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2500);
  };

  if (showSuccess && successAnimation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="w-64 h-64 bg-white rounded-full p-8 shadow-2xl flex items-center justify-center animate-in fade-in zoom-in duration-300">
          <Lottie
            animationData={successAnimation}
            loop={false}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Yeni İşlem Ekle
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Yeni İşlem Ekle</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Receipt Scanner & Voice Input */}
        <div className="flex justify-center gap-4 pb-2">
          <ReceiptScanner onScanComplete={(scannedAmount: number) => {
            setAmount(scannedAmount.toFixed(2));
            setType("expense");
          }} />
          <div className="flex flex-col items-center gap-1">
            <VoiceInput onTranscript={handleVoiceInput} />
            <span className="text-[10px] text-muted-foreground">Sesli Giriş</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">İşlem Türü</label>
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value as TransactionType);
                setCategory("");
              }}
            >
              <option value="income">Gelir</option>
              <option value="expense">Gider</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tutar</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategori</label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Seçiniz</option>
              {(type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(
                (cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                )
              )}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tarih</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Not (Opsiyonel)</label>
          <Input
            placeholder="Açıklama (Örn: Migros alışverişi)"
            value={note}
            onChange={handleNoteChange}
          />
          {note && category && (
            <p className="text-xs text-muted-foreground mt-1">
              Otomatik seçilen kategori: <span className="font-medium text-primary">{category}</span>
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Kaydet
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            İptal
          </Button>
        </div>
      </form>
    </div>
  );
}
