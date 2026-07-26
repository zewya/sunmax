export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { name, phone, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ ok: false, error: 'Имя и телефон обязательны' });
    }

    const token = process.env.TG_TOKEN;
    const chatId = process.env.TG_CHAT;

    if (!token || !chatId) {
      console.error('Missing TG_TOKEN or TG_CHAT');
      return res.status(500).json({ ok: false, error: 'Ошибка конфигурации сервера' });
    }

    const text = [
      `\u{1F48B} \u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430 Sun Max`,
      `\u{1F464} \u0418\u043C\u044F: ${name}`,
      `\u{1F4F1} \u0422\u0435\u043B\u0435\u0444\u043E\u043D: ${phone}`,
      message ? `\u{1F4DD} \u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439: ${message}` : ''
    ].filter(Boolean).join('\n');

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', JSON.stringify(data));
      return res.status(500).json({
        ok: false,
        error: 'Ошибка отправки в Telegram',
        detail: data.description || 'Unknown error'
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ ok: false, error: 'Внутренняя ошибка сервера' });
  }
}
