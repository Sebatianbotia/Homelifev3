/* =====================================================
   HOMELIFE PREMIUM - CHATBOT.JS
   Sistema de chatbot inteligente
   ===================================================== */

// Estado del chatbot
const ChatbotState = {
    isOpen: false,
    conversationHistory: [],
    currentLanguage: 'es'
};

// Base de conocimiento del chatbot (ES)
const ChatbotKnowledge = {
    products: {
        title: 'Nuestros Productos 🛍️',
        message: 'Contamos con equipos médicos certificados INVIMA:\n\n' +
                '• Tensiómetros Digitales 🩺\n' +
                '• Oxímetros de Pulso 💉\n' +
                '• Nebulizadores 🌬️\n' +
                '• Glucómetros 🩸\n' +
                '• Termómetros Infrarrojos 🌡️\n\n' +
                'Todos con garantía de 2 años y envío gratis en compras +$150.000',
        suggestions: ['Ver catálogo completo', '¿Cuál me recomiendas?', 'Precios']
    },
    certification: {
        title: 'Certificación INVIMA ✅',
        message: 'Todos nuestros productos tienen:\n\n' +
                '✓ Registro sanitario INVIMA vigente\n' +
                '✓ Certificación ISO 13485\n' +
                '✓ Garantía extendida de 2 años\n' +
                '✓ Cumplimiento normas internacionales\n\n' +
                'Puedes verificar los certificados en cada producto.',
        suggestions: ['Ver productos', 'Contactar asesor', 'Más información']
    },
    order: {
        title: 'Estado de Pedido 📦',
        message: 'Para consultar el estado de tu pedido necesito:\n\n' +
                '• Número de orden\n' +
                '• Email de compra\n\n' +
                'También puedes contactarnos:\n' +
                '📱 WhatsApp: +57 300 123 4567\n' +
                '📧 info@homelife.com.co',
        suggestions: ['Contactar por WhatsApp', 'Enviar email', 'Ver productos']
    },
    advisor: {
        title: 'Hablar con Asesor 👤',
        message: 'Puedes contactar a nuestro equipo:\n\n' +
                '📱 WhatsApp: +57 300 123 4567\n' +
                '📞 Teléfono: (601) 123-4567\n' +
                '📧 Email: info@homelife.com.co\n\n' +
                'Horario: Lun-Vie 8am-6pm, Sáb 9am-2pm',
        suggestions: ['Abrir WhatsApp', 'Ver contacto', 'Volver al inicio']
    },
    prices: {
        title: 'Precios 💰',
        message: 'Nuestros precios son muy competitivos:\n\n' +
                '• Tensiómetros: desde $89.000\n' +
                '• Oxímetros: desde $45.000\n' +
                '• Nebulizadores: desde $120.000\n' +
                '• Glucómetros: desde $65.000\n' +
                '• Termómetros: desde $35.000\n\n' +
                '¡Envío GRATIS en compras +$150.000!',
        suggestions: ['Ver productos', 'Hacer pedido', 'Métodos de pago']
    },
    shipping: {
        title: 'Envíos 🚚',
        message: 'Información de envíos:\n\n' +
                '📦 Envío GRATIS en compras +$150.000\n' +
                '🇨🇴 Cobertura nacional (Colombia)\n' +
                '⏱️ Tiempo: 2-5 días hábiles\n' +
                '📍 Seguimiento en tiempo real\n\n' +
                '¿Quieres hacer un pedido?',
        suggestions: ['Ver productos', 'Calcular envío', 'Contactar']
    },
    payment: {
        title: 'Métodos de Pago 💳',
        message: 'Aceptamos:\n\n' +
                '• PSE (Pago Seguro en Línea)\n' +
                '• Tarjetas crédito/débito\n' +
                '• Transferencia bancaria\n' +
                '• Nequi / Daviplata\n' +
                '• Efectivo contra entrega\n\n' +
                'Todas las transacciones son 100% seguras 🔒',
        suggestions: ['Hacer pedido', 'Ver productos', 'Contactar']
    },
    warranty: {
        title: 'Garantía 🛡️',
        message: 'Tu compra está protegida:\n\n' +
                '✓ Garantía extendida de 2 años\n' +
                '✓ 30 días para devoluciones\n' +
                '✓ Servicio técnico especializado\n' +
                '✓ Soporte post-venta 24/7\n\n' +
                'Compra con confianza en HomeLife',
        suggestions: ['Ver productos', 'Contactar', 'Hacer pedido']
    }
};

// Respuestas automáticas por keywords
const AutoResponses = {
    greeting: {
        keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'hi'],
        responses: [
            '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
            '¡Bienvenido! 😊 ¿Qué información necesitas?',
            '¡Hola! Estoy aquí para ayudarte con tus consultas.'
        ]
    },
    thanks: {
        keywords: ['gracias', 'gracias por', 'muchas gracias', 'excelente', 'perfecto'],
        responses: [
            '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?',
            '¡Un placer ayudarte! ¿Necesitas algo más?',
            '¡Para servirte! ¿Algo más que quieras saber?'
        ]
    },
    bye: {
        keywords: ['adios', 'adiós', 'chao', 'hasta luego', 'nos vemos'],
        responses: [
            '¡Hasta pronto! 👋 Que tengas un excelente día.',
            '¡Adiós! Vuelve cuando necesites ayuda. 😊',
            '¡Nos vemos! Estoy aquí cuando me necesites.'
        ]
    }
};

// Toggle chatbot
function toggleChatbot() {
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotButton = document.getElementById('chatbotButton');

  ChatbotState.isOpen = !ChatbotState.isOpen;

  chatbotWindow.classList.toggle('active', ChatbotState.isOpen);

  // En vez de display:none (que te puede dejar sin control), usa opacity/pointer-events
  chatbotButton.classList.toggle('hidden', ChatbotState.isOpen);
}

// Seleccionar opción rápida
function selectChatOption(option) {
    const quickOptions = document.getElementById('quickOptions');
    if (quickOptions) {
        quickOptions.style.display = 'none';
    }
    
    const data = ChatbotKnowledge[option];
    if (data) {
        // Agregar mensaje del usuario
        addUserMessage(data.title);
        
        // Simular respuesta del bot
        setTimeout(() => {
            addBotMessage(data.message);
            if (data.suggestions) {
                showSuggestions(data.suggestions);
            }
        }, 800);
    }
}

// Enviar mensaje del chat
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addUserMessage(message);
    input.value = '';
    
    // Procesar mensaje
    setTimeout(() => {
        processMessage(message);
    }, 800);
}

// Agregar mensaje del usuario
function addUserMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user';
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(message)}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Agregar mensaje del bot
function addBotMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
        </div>
        <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
    `;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Procesar mensaje del usuario
function processMessage(message) {
    const lowerMessage = message.toLowerCase();
    
    // Buscar respuestas automáticas
    for (const [key, data] of Object.entries(AutoResponses)) {
        if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
            const response = data.responses[Math.floor(Math.random() * data.responses.length)];
            addBotMessage(response);
            return;
        }
    }
    
    // Buscar en la base de conocimiento
    if (lowerMessage.includes('producto') || lowerMessage.includes('equipo') || 
        lowerMessage.includes('catalogo') || lowerMessage.includes('catálogo')) {
        selectChatOption('products');
        return;
    }
    
    if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || 
        lowerMessage.includes('cuanto') || lowerMessage.includes('valor')) {
        selectChatOption('prices');
        return;
    }
    
    if (lowerMessage.includes('invima') || lowerMessage.includes('certificado') || 
        lowerMessage.includes('certificacion') || lowerMessage.includes('certificación')) {
        selectChatOption('certification');
        return;
    }
    
    if (lowerMessage.includes('envio') || lowerMessage.includes('envío') || 
        lowerMessage.includes('entrega') || lowerMessage.includes('despacho')) {
        selectChatOption('shipping');
        return;
    }
    
    if (lowerMessage.includes('pago') || lowerMessage.includes('pagar') || 
        lowerMessage.includes('tarjeta') || lowerMessage.includes('metodo')) {
        selectChatOption('payment');
        return;
    }
    
    if (lowerMessage.includes('garantia') || lowerMessage.includes('garantía') || 
        lowerMessage.includes('devolucion') || lowerMessage.includes('devolución')) {
        selectChatOption('warranty');
        return;
    }
    
    if (lowerMessage.includes('pedido') || lowerMessage.includes('orden') || 
        lowerMessage.includes('compra') || lowerMessage.includes('rastreo')) {
        selectChatOption('order');
        return;
    }
    
    if (lowerMessage.includes('asesor') || lowerMessage.includes('hablar') || 
        lowerMessage.includes('contacto') || lowerMessage.includes('telefono')) {
        selectChatOption('advisor');
        return;
    }
    
    // Respuesta por defecto
    addBotMessage(
        'Entiendo tu consulta. Te recomiendo:\n\n' +
        '• Ver nuestros [productos](/productos.html)\n' +
        '• Contactarnos por WhatsApp: +57 300 123 4567\n' +
        '• Escribir a: info@homelife.com.co\n\n' +
        '¿En qué más puedo ayudarte?'
    );
    
    showSuggestions(['Ver productos', 'Hablar con asesor', 'Volver al inicio']);
}

// Mostrar sugerencias
function showSuggestions(suggestions) {
    const messagesContainer = document.getElementById('chatMessages');
    
    // Remover sugerencias anteriores
    const oldSuggestions = messagesContainer.querySelector('.quick-options');
    if (oldSuggestions) {
        oldSuggestions.remove();
    }
    
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'quick-options';
    suggestionsDiv.innerHTML = suggestions.map(s => 
        `<button class="quick-option" onclick="handleSuggestion('${s}')">${s}</button>`
    ).join('');
    
    messagesContainer.appendChild(suggestionsDiv);
    scrollToBottom();
}

// Manejar sugerencia
function handleSuggestion(suggestion) {
    addUserMessage(suggestion);
    
    setTimeout(() => {
        const lowerSuggestion = suggestion.toLowerCase();
        
        if (lowerSuggestion.includes('catalogo') || lowerSuggestion.includes('catálogo') || 
            lowerSuggestion.includes('productos')) {
            window.location.href = '/productos.html';
        } else if (lowerSuggestion.includes('whatsapp')) {
            window.open('https://wa.me/573001234567', '_blank');
        } else if (lowerSuggestion.includes('contacto') || lowerSuggestion.includes('asesor')) {
            selectChatOption('advisor');
        } else if (lowerSuggestion.includes('inicio')) {
            addBotMessage('¡Perfecto! ¿En qué más puedo ayudarte?');
            showInitialOptions();
        } else {
            processMessage(suggestion);
        }
    }, 500);
}

// Mostrar opciones iniciales
function showInitialOptions() {
    const suggestions = [
        'Ver productos',
        'Certificación INVIMA',
        'Estado de pedido',
        'Hablar con asesor'
    ];
    showSuggestions(suggestions);
}

// Scroll al final
function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Chatbot HomeLife inicializado');
});

/* ===== FIN CHATBOT.JS ===== */