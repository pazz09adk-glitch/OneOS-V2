import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ImagePlus,
  Mic,
  MicOff,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import '../../resources/design-system/oneos-ds-tokens.css';
import './styles.css';
import {
  DEMO_GREETING_FOR,
  DEMO_REPLY,
  TWIN_SYSTEM_PROMPT,
} from './twin-system-prompt';

type Role = 'user' | 'assistant' | 'system';

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  images?: string[];
  createdAt: number;
};

type ModelConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  visitorName: string;
};

const STORAGE_KEY = 'wangmian-twin-chat-config-v1';

const DEFAULT_CONFIG: ModelConfig = {
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKey: '',
  model: 'openai/gpt-4o-mini',
  visitorName: '',
};

function loadConfig(): ModelConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function WangmianTwinChatApp() {
  const [config, setConfig] = useState<ModelConfig>(() => loadConfig());
  const [draftConfig, setDraftConfig] = useState<ModelConfig>(() => loadConfig());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);


  const liveMode = Boolean(config.apiKey.trim());

  const displayName = useMemo(() => {
    const n = config.visitorName.trim();
    return n || null;
  }, [config.visitorName]);

  useEffect(() => {
    setMessages([
      {
        id: uid(),
        role: 'assistant',
        content: DEMO_GREETING_FOR(displayName === '王冕' ? '王冕' : displayName),
        createdAt: Date.now(),
      },
    ]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- 仅首屏招呼

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const saveConfig = () => {
    let key = draftConfig.apiKey.trim().replace(/^Bearer\s+/i, '');
    // 去掉复制时夹带的不可见字符
    key = key.replace(/[\u200b-\u200d\ufeff]/g, '').replace(/\s+/g, '');
    const next = {
      ...draftConfig,
      baseUrl: draftConfig.baseUrl.trim().replace(/\/+$/, ''),
      apiKey: key,
      model: draftConfig.model.trim(),
      visitorName: draftConfig.visitorName.trim(),
    };
    setConfig(next);
    setDraftConfig(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSettingsOpen(false);
    setError('');
  };

  const clearChat = () => {
    setMessages([
      {
        id: uid(),
        role: 'assistant',
        content: DEMO_GREETING_FOR(
          draftConfig.visitorName.trim() === '王冕'
            ? '王冕'
            : draftConfig.visitorName.trim() || displayName,
        ),
        createdAt: Date.now(),
      },
    ]);
    setError('');
  };

  const onPickImages = async (files: FileList | null) => {
    if (!files?.length) return;
    const next: string[] = [];
    for (const file of Array.from(files).slice(0, 4)) {
      if (!file.type.startsWith('image/')) continue;
      next.push(await fileToDataUrl(file));
    }
    setPendingImages((prev) => [...prev, ...next].slice(0, 6));
  };

  const callModel = async (history: ChatMessage[]) => {
    const url = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;
    const openaiMessages: Array<Record<string, unknown>> = [
      { role: 'system', content: TWIN_SYSTEM_PROMPT },
    ];

    for (const m of history) {
      if (m.role === 'system') continue;
      if (m.images?.length) {
        openaiMessages.push({
          role: m.role,
          content: [
            { type: 'text', text: m.content || '（用户发来截图，请结合画面回答）' },
            ...m.images.map((urlImg) => ({
              type: 'image_url',
              image_url: { url: urlImg },
            })),
          ],
        });
      } else {
        openaiMessages.push({ role: m.role, content: m.content });
      }
    }

    const isOpenRouter = /openrouter\.ai/i.test(config.baseUrl);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey.trim()}`,
    };
    if (isOpenRouter) {
      headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.origin : 'https://prototype.lnoneos.com';
      headers['X-Title'] = 'wangmian-twin-chat';
      headers['X-OpenRouter-Title'] = '全宇宙无敌帅的王冕的分身';
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model.trim() || (isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini'),
        messages: openaiMessages,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let friendly = text || `模型请求失败 HTTP ${res.status}`;
      try {
        const j = JSON.parse(text);
        const msg = j?.error?.message || j?.message || '';
        if (res.status === 401 || /user not found/i.test(msg)) {
          friendly =
            `鉴权失败（401）：${msg || 'User not found'}\n\n` +
            'OpenRouter 常见原因：Key 复制不全、Key 已过期/删除、或填成了别家的 Key。\n' +
            '处理：openrouter.ai 新建一把 sk-or-v1- Key → 接入模型里重新粘贴 → Base URL 必须是 https://openrouter.ai/api/v1 → 硬刷新后再试。';
        } else if (res.status === 402) {
          friendly = `额度不足（402）：${msg}\n去 OpenRouter 充值或领取额度后再聊。`;
        }
      } catch {
        // keep raw
      }
      throw new Error(friendly);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error('模型返回为空');
    }
    return content;
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if ((!text && pendingImages.length === 0) || busy) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      content: text,
      images: pendingImages.length ? [...pendingImages] : undefined,
      createdAt: Date.now(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setPendingImages([]);
    setBusy(true);
    setError('');

    try {
      let reply: string;
      if (liveMode) {
        reply = await callModel(nextHistory);
      } else {
        await new Promise((r) => setTimeout(r, 450));
        reply = DEMO_REPLY(text, Boolean(userMsg.images?.length));
      }
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'assistant', content: reply, createdAt: Date.now() },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content: `独立团翻车了：${msg}\n\n检查「接入模型」里的 Base URL / Key / 模型名；跨域要模型服务允许浏览器直连。`,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }, [busy, input, liveMode, messages, pendingImages, config]);

  const toggleVoice = () => {
    const w = window as Window & {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setError('当前浏览器不支持语音识别，换 Chrome 或先打字/截图。');
      return;
    }
    if (recording && recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
      return;
    }
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = 'zh-CN';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (event: any) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const piece = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) finalText += piece;
        else setInput((prev) => (prev && !prev.endsWith(piece) ? `${prev}${piece}` : piece || prev));
      }
      if (finalText) {
        setInput((prev) => `${prev}${finalText}`.trim());
      }
    };
    rec.onerror = () => {
      setRecording(false);
      setError('语音识别中断，再试一次或改打字。');
    };
    rec.onend = () => setRecording(false);
    rec.start();
    setRecording(true);
    setError('');
  };

  return (
    <div className="wtc-app" data-ds-mode="light">
      <header className="wtc-header">
        <div className="wtc-brand">
          <span className="wtc-avatar" aria-hidden>
            <Sparkles size={18} />
          </span>
          <div>
            <h1>全宇宙无敌帅的王冕的分身</h1>
            <p>
              {liveMode ? '已接入模型 · 可聊真分身' : '演示模式 · 配置 API 后外网真聊'}
              {displayName ? ` · 你好，${displayName}` : ''}
            </p>
          </div>
        </div>
        <div className="wtc-header-actions">
          <button type="button" className="wtc-icon-btn" onClick={clearChat} aria-label="清空对话">
            <Trash2 size={18} />
          </button>
          <button
            type="button"
            className="wtc-icon-btn wtc-icon-btn-primary"
            onClick={() => {
              setDraftConfig(config);
              setSettingsOpen(true);
            }}
            aria-label="接入模型"
          >
            <Settings2 size={18} />
            <span>接入模型</span>
          </button>
        </div>
      </header>

      <div className="wtc-banner" role="status">
        文本 / 语音 / 截图都能扔。对象存储托管本页；密钥只存在你浏览器 localStorage，不进仓库。
      </div>

      <div className="wtc-messages" ref={listRef} data-annotation-id="wtc-messages">
        {messages.map((m) => (
          <div key={m.id} className={`wtc-bubble wtc-bubble-${m.role}`}>
            {m.images?.length ? (
              <div className="wtc-bubble-images">
                {m.images.map((src) => (
                  <img key={src.slice(0, 48)} src={src} alt="用户上传截图" />
                ))}
              </div>
            ) : null}
            <div className="wtc-bubble-text">{m.content}</div>
          </div>
        ))}
        {busy ? <div className="wtc-typing">分身正在上炮弹…</div> : null}
      </div>

      {error ? <div className="wtc-error">{error}</div> : null}

      {pendingImages.length > 0 ? (
        <div className="wtc-pending-images">
          {pendingImages.map((src) => (
            <div key={src.slice(0, 40)} className="wtc-pending-item">
              <img src={src} alt="待发送截图" />
              <button
                type="button"
                className="wtc-pending-remove"
                aria-label="移除截图"
                onClick={() => setPendingImages((prev) => prev.filter((x) => x !== src))}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <footer className="wtc-composer" data-annotation-id="wtc-composer">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            void onPickImages(e.target.files);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          className="wtc-icon-btn"
          aria-label="上传截图"
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus size={20} />
        </button>
        <button
          type="button"
          className={`wtc-icon-btn ${recording ? 'is-recording' : ''}`}
          aria-label={recording ? '停止语音' : '语音输入'}
          onClick={toggleVoice}
        >
          {recording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <textarea
          className="wtc-input"
          rows={1}
          placeholder="跟分身说点啥…（可粘贴需求、扔截图）"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <button
          type="button"
          className="wtc-send"
          disabled={busy || (!input.trim() && pendingImages.length === 0)}
          onClick={() => void send()}
        >
          <Send size={18} />
          发送
        </button>
      </footer>

      {settingsOpen ? (
        <div className="wtc-modal-mask" role="presentation" onClick={() => setSettingsOpen(false)}>
          <div
            className="wtc-modal"
            role="dialog"
            aria-modal="true"
            aria-label="接入模型"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wtc-modal-head">
              <h2>接入模型（外网真聊）</h2>
              <button type="button" className="wtc-icon-btn" aria-label="关闭" onClick={() => setSettingsOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <p className="wtc-modal-hint">
              OpenRouter 示例已预填。Key 点「复制」后粘贴（别发给别人）。账户需有余额/免费额度。Key 只存本机浏览器。
            </p>
            <label className="wtc-field">
              <span>你的姓名（打招呼用）</span>
              <input
                value={draftConfig.visitorName}
                onChange={(e) => setDraftConfig((c) => ({ ...c, visitorName: e.target.value }))}
                placeholder="例如：张三；王冕会叫「我的本尊」"
              />
            </label>
            <label className="wtc-field">
              <span>Base URL</span>
              <input
                value={draftConfig.baseUrl}
                onChange={(e) => setDraftConfig((c) => ({ ...c, baseUrl: e.target.value }))}
                placeholder="https://openrouter.ai/api/v1"
              />
            </label>
            <label className="wtc-field">
              <span>API Key</span>
              <input
                type="password"
                value={draftConfig.apiKey}
                onChange={(e) => setDraftConfig((c) => ({ ...c, apiKey: e.target.value }))}
                placeholder="sk-or-v1-..."
                autoComplete="off"
              />
            </label>
            <label className="wtc-field">
              <span>模型名</span>
              <input
                value={draftConfig.model}
                onChange={(e) => setDraftConfig((c) => ({ ...c, model: e.target.value }))}
                placeholder="openai/gpt-4o-mini"
              />
            </label>
            <div className="wtc-modal-actions">
              <button type="button" className="wtc-btn-secondary" onClick={() => setSettingsOpen(false)}>
                取消
              </button>
              <button type="button" className="wtc-btn-primary" onClick={saveConfig}>
                保存并启用
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


