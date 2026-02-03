
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Prize, PrizeLevel } from './types';
import { INITIAL_PRIZES } from './constants';
import Wheel from './components/Wheel';
import PrizeInfo from './components/PrizeInfo';
import { Settings, RefreshCw, Music, Image as ImageIcon, Volume2, VolumeX, X } from 'lucide-react';

const App: React.FC = () => {
  const [prizes, setPrizes] = useState<Prize[]>(() => {
    const saved = localStorage.getItem('draw_prizes');
    return saved ? JSON.parse(saved) : INITIAL_PRIZES;
  });
  
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Prize | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [flash, setFlash] = useState(false);
  
  // Media states
  const [bgImage, setBgImage] = useState<string | null>(() => localStorage.getItem('draw_bg'));
  const [bgMusic, setBgMusic] = useState<string | null>(() => localStorage.getItem('draw_music'));
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [customSounds, setCustomSounds] = useState<Record<string, string | null>>({
    [PrizeLevel.FIRST]: localStorage.getItem(`draw_sound_${PrizeLevel.FIRST}`),
    [PrizeLevel.SECOND]: localStorage.getItem(`draw_sound_${PrizeLevel.SECOND}`),
    [PrizeLevel.THIRD]: localStorage.getItem(`draw_sound_${PrizeLevel.THIRD}`),
  });

  const [showSettings, setShowSettings] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('draw_prizes', JSON.stringify(prizes));
  }, [prizes]);

  const playPrizeSound = (level: PrizeLevel) => {
    const customSound = customSounds[level];
    if (customSound) {
        const audio = new Audio(customSound);
        audio.play().catch(e => console.warn("Sound play blocked:", e));
    }
  };

  const handleDraw = () => {
    if (isSpinning) return;

    const availablePrizes = prizes.filter(p => p.remaining > 0);
    const totalRemaining = availablePrizes.reduce((sum, p) => sum + p.remaining, 0);

    if (totalRemaining === 0) {
      alert("所有奖品已抽完！");
      return;
    }

    setIsSpinning(true);
    setWinner(null);
    setShowWinnerModal(false);
    setFlash(false);

    // Probability: Weighted by remaining stock
    let random = Math.floor(Math.random() * totalRemaining);
    let winningPrize: Prize | null = null;
    let cumulative = 0;

    for (const p of prizes) {
      if (p.remaining <= 0) continue;
      cumulative += p.remaining;
      if (random < cumulative) {
        winningPrize = p;
        break;
      }
    }

    if (!winningPrize) return;

    const prizeIndex = prizes.findIndex(p => p.id === winningPrize!.id);
    
    // Rotation Calculation to land exactly at Top (270deg in SVG space)
    const centerOfSegment = prizeIndex * 90 + 45;
    const targetOffset = (270 - centerOfSegment + 360) % 360;
    
    // Add multiple spins for effect
    const totalNewRotation = rotation + (360 * 6) + targetOffset - (rotation % 360);
    
    setRotation(totalNewRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWinner(winningPrize!);
      setShowWinnerModal(true);
      
      setPrizes(prev => prev.map(p => 
        p.id === winningPrize!.id ? { ...p, remaining: p.remaining - 1 } : p
      ));

      if (winningPrize!.id !== PrizeLevel.SURPRISE) {
        setFlash(true);
        playPrizeSound(winningPrize!.id);
        confetti({
          particleCount: 200,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#facc15', '#ea580c', '#b91c1c'],
          zIndex: 1000,
        });
      }
    }, 4000);
  };

  const handleReset = () => {
    if (confirm("确定要重置所有奖品库存吗？抽奖进度将被清空。")) {
      setPrizes(INITIAL_PRIZES);
      setWinner(null);
      setShowWinnerModal(false);
      setFlash(false);
      setRotation(0);
      localStorage.removeItem('draw_prizes');
    }
  };

  const handleFileUpload = (type: 'bg' | 'music' | PrizeLevel, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (type === 'bg') {
        setBgImage(result);
        localStorage.setItem('draw_bg', result);
      } else if (type === 'music') {
        setBgMusic(result);
        localStorage.setItem('draw_music', result);
        if (bgMusicRef.current) bgMusicRef.current.src = result;
      } else {
        setCustomSounds(prev => ({ ...prev, [type]: result }));
        localStorage.setItem(`draw_sound_${type}`, result);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleMusic = () => {
    if (!bgMusicRef.current) return;
    if (isMusicPlaying) {
      bgMusicRef.current.pause();
    } else {
      bgMusicRef.current.play().catch(e => console.warn("Music play blocked:", e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col items-center justify-between py-10 transition-all duration-1000 bg-cover bg-center overflow-hidden"
      style={{ 
        backgroundImage: bgImage ? `url(${bgImage})` : `linear-gradient(rgba(127, 29, 29, 0.85), rgba(69, 10, 10, 0.95)), url('https://images.unsplash.com/photo-1576402187878-974f70c890a5?q=80&w=2000&auto=format&fit=crop')`,
      }}
    >
      {/* Background Music Element */}
      {bgMusic && <audio ref={bgMusicRef} src={bgMusic} loop onPlay={() => setIsMusicPlaying(true)} onPause={() => setIsMusicPlaying(false)} />}

      {/* Header Section */}
      <header className="text-center z-10 space-y-4 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-6 py-2 bg-yellow-500 text-red-900 rounded-full font-chinese text-xl font-bold shadow-lg"
        >
          黄冈皓雅口腔
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl md:text-7xl text-yellow-100 font-chinese font-bold drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)] tracking-wider"
        >
          皓雅口腔新年幸运抽奖
        </motion.h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-[2px] w-12 bg-yellow-600"></div>
          <p className="text-yellow-400 font-chinese text-2xl italic tracking-widest">祥马奔腾 雅韵生辉</p>
          <div className="h-[2px] w-12 bg-yellow-600"></div>
        </div>
      </header>

      {/* Prize Display Area */}
      <div className="z-10 w-full flex justify-center mt-4">
        <PrizeInfo prizes={prizes} />
      </div>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center gap-8 z-10 w-full px-4 mt-4">
        <div className="relative">
           <Wheel 
            prizes={prizes} 
            rotation={rotation} 
            isSpinning={isSpinning} 
            flash={flash}
            winner={winner}
          />
        </div>

        <div className="flex flex-col items-center gap-6 mb-16">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 0 40px rgba(250, 204, 21, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            disabled={isSpinning}
            onClick={handleDraw}
            className={`
              px-16 py-5 rounded-full text-3xl font-bold transition-all shadow-2xl relative overflow-hidden group
              ${isSpinning ? 'bg-gray-600 cursor-not-allowed text-gray-400 border-gray-600' : 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 text-red-950 border-4 border-yellow-200'}
            `}
          >
            <span className="relative z-10 font-chinese">{isSpinning ? '好运即将揭晓...' : '点击开启马年好运'}</span>
            {!isSpinning && (
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            )}
          </motion.button>
        </div>
      </main>

      {/* WINNER MODAL (Top Level Popup) */}
      <AnimatePresence>
        {showWinnerModal && winner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.3, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", damping: 12, stiffness: 100 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-red-600 to-red-900 p-8 text-center shadow-[0_0_100px_rgba(234,179,8,0.6)] border-4 border-yellow-400"
            >
              {/* Decorative Corners */}
              <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-yellow-500 rounded-tl-[2rem] opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-yellow-500 rounded-br-[2rem] opacity-50"></div>
              
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-6xl mb-6 select-none"
              >
                🎊
              </motion.div>
              
              <h2 className="text-3xl font-chinese text-yellow-300 mb-2 tracking-widest drop-shadow-lg">
                恭 喜 发 财 · 大 吉 大 利
              </h2>
              
              <div className="my-8 py-6 px-4 bg-yellow-500/10 border-y-2 border-yellow-500/30">
                <p className="text-yellow-400 text-xl font-chinese mb-2 opacity-80">祝贺获得</p>
                <motion.div 
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-5xl md:text-6xl font-bold font-chinese text-white drop-shadow-[0_4px_10px_rgba(255,255,255,0.4)]"
                >
                  {winner.name}
                </motion.div>
              </div>

              <div className="text-yellow-200/60 font-chinese text-lg italic mb-10">
                “ 祥马贺岁，好运连连 ”
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowWinnerModal(false)}
                className="bg-yellow-500 hover:bg-yellow-400 text-red-900 font-bold px-12 py-3 rounded-full text-xl font-chinese shadow-xl transition-all"
              >
                收下好运
              </motion.button>

              {/* Close Icon (Alternative) */}
              <button 
                onClick={() => setShowWinnerModal(false)}
                className="absolute top-4 right-4 text-yellow-500/50 hover:text-yellow-500"
              >
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Controls Bar - Bottom-Right Corner (Horizontal) */}
      <footer className="fixed bottom-6 right-6 z-30 pointer-events-auto">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl px-5 py-3 rounded-full border border-yellow-500/40 shadow-2xl">
          <button 
            onClick={toggleMusic}
            className={`p-3 rounded-full transition-all shadow-md ${isMusicPlaying ? 'bg-yellow-500 text-red-900 scale-105' : 'bg-red-900 text-yellow-500 hover:bg-red-800'}`}
            title={isMusicPlaying ? "关闭背景音乐" : "开启背景音乐"}
          >
            {isMusicPlaying ? <Music size={20} className="animate-pulse" /> : <VolumeX size={20} />}
          </button>
          
          <div className="w-[1px] h-6 bg-yellow-500/20"></div>

          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 bg-red-900 hover:bg-red-800 text-yellow-500 rounded-full transition-all border border-yellow-500/30 shadow-md hover:scale-105"
            title="系统设置"
          >
            <Settings size={20} />
          </button>

          <button 
            onClick={handleReset}
            className="p-3 bg-red-900 hover:bg-red-800 text-yellow-500 rounded-full transition-all border border-yellow-500/30 shadow-md hover:scale-105"
            title="重置进度"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-red-950 border-2 border-yellow-500/50 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-6 right-6 text-yellow-500 hover:text-white transition-colors"
              >
                ✕
              </button>
              
              <h3 className="text-3xl font-chinese text-yellow-400 mb-8 flex items-center gap-3">
                <Settings className="text-yellow-500" /> 系统资源配置
              </h3>
              
              <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                {/* Visuals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-yellow-200 flex items-center gap-2">
                      <ImageIcon size={16} /> 自定义背景
                    </label>
                    <input 
                      type="file" accept="image/*"
                      onChange={(e) => handleFileUpload('bg', e)}
                      className="block w-full text-xs text-yellow-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-yellow-500 file:text-red-950 hover:file:bg-yellow-400 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-yellow-200 flex items-center gap-2">
                      <Music size={16} /> 背景音乐
                    </label>
                    <input 
                      type="file" accept="audio/*"
                      onChange={(e) => handleFileUpload('music', e)}
                      className="block w-full text-xs text-yellow-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-yellow-500 file:text-red-950 hover:file:bg-yellow-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Prize Sounds */}
                <div className="space-y-4 pt-4 border-t border-yellow-500/20">
                  <label className="text-base font-bold text-yellow-400 flex items-center gap-2">
                    <Volume2 size={18} /> 奖项专属音效 (一至三等奖)
                  </label>
                  <div className="grid gap-4">
                    {[PrizeLevel.FIRST, PrizeLevel.SECOND, PrizeLevel.THIRD].map((level) => (
                      <div key={level} className="flex items-center gap-4 bg-black/20 p-3 rounded-xl">
                        <span className="text-xs font-bold text-yellow-500 w-20">
                          {level === PrizeLevel.FIRST ? '一等奖' : level === PrizeLevel.SECOND ? '二等奖' : '三等奖'}
                        </span>
                        <input 
                          type="file" accept="audio/*"
                          onChange={(e) => handleFileUpload(level, e)}
                          className="text-[10px] text-yellow-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-red-900 file:text-yellow-400 hover:file:bg-red-800 cursor-pointer flex-grow"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={() => {
                    if (confirm("确定要恢复默认设置（图片与音效）吗？")) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="flex-1 py-3 rounded-xl border border-red-700 text-red-400 hover:bg-red-900/50 font-bold transition-all"
                >
                  恢复默认
                </button>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="flex-[2] bg-gradient-to-r from-yellow-500 to-yellow-600 text-red-950 font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-all"
                >
                  确认保存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-10">
        <div className="absolute top-[-10%] left-[-10%] text-yellow-600 font-chinese text-[40rem] select-none rotate-12">馬</div>
      </div>
    </div>
  );
};

export default App;
