
export async function speakText(text: string, onEnd?: () => void): Promise<void> {
  if (!text) return;
  
  // 清理文本，移除 Markdown 标记
  const cleanText = text
    .replace(/[*#`_\[\]]/g, '') // 移除 Markdown 符号
    .replace(/\n+/g, '。') // 换行改为句号
    .replace(/\d+\.\s/g, '第$&条，') // 数字列表优化
    .slice(0, 1000); // 限制长度
  
  // 使用浏览器内置的语音合成
  if ('speechSynthesis' in window) {
    // 停止之前的朗读
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85; // 稍慢的语速，更庄重
    utterance.pitch = 0.9; // 稍低的音调，更沉稳
    utterance.volume = 1.0;
    
    // 尝试选择更合适的中文语音
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find(voice => 
      voice.lang.includes('zh') && 
      (voice.name.includes('Female') || voice.name.includes('女') || voice.name.includes('Ting'))
    ) || voices.find(voice => voice.lang.includes('zh'));
    
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }
    
    // 添加结束事件监听
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    
    // 添加错误处理
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      if (onEnd) onEnd();
    };
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('浏览器不支持语音合成功能');
    if (onEnd) onEnd();
  }
}
