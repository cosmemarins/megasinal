import React, { useState, useEffect } from 'react';
import { getSettings } from '../../services/SettingsService';

function TelegramChat() {

    const [url, setUrl] = useState('');

    useEffect(() => {
        getSettings()
            .then(settings => setUrl(`https://api.telegram.org/bot${settings.telegramToken}/getUpdates`))
            .catch(err => console.error(err))
    }, [])

    return <iframe src={url} title="Telegram Chats" width="100%"></iframe>;
}

export default TelegramChat;