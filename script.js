const QUIZ_CONFIG = {
    totalQuestions: 7,
    countdownMinutes: 10,
    countdownSeconds: 0
};

// Estado do quiz
let quizState = {
    currentScreen: 'welcome',
    currentQuestion: 1,
    answers: {},
    selectedProfile: null,
    userData: {}
};

// Elementos DOM
const elements = {
    screens: {
        welcome: document.getElementById('welcome-screen'),
        questions: document.getElementById('quiz-questions'),
        credibility: document.getElementById('credibility-screen'),
        loading: document.getElementById('loading-screen'),

        offer: document.getElementById('offer-screen'),
        checkout: document.getElementById('checkout-screen'),
        success: document.getElementById('success-screen')
    },
    progress: {
        text: document.getElementById('progress-text'),
        fill: document.getElementById('progress-fill')
    },
    buttons: {
        nextQuestion: document.getElementById('next-question'),
        selectPlan: document.getElementById('select-plan')
    },
    countdown: {
        minutes: document.getElementById('countdown-minutes'),
        seconds: document.getElementById('countdown-seconds')
    },
    inputs: {
        name: document.getElementById('user-name'),
        checkoutName: document.getElementById('checkout-name'),
        checkoutEmail: document.getElementById('checkout-email'),        checkoutPhone: document.getElementById('checkout-phone')
    },
    forms: {
        checkout: document.getElementById('checkout-form')
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando...'); // Debug
    console.log('Elementos encontrados:', elements.screens); // Debug
    initializeQuiz();
    setupEventListeners();
    startCountdown();
});

// Inicializar quiz
function initializeQuiz() {
    showScreen('welcome');
    updateProgress();
}

// Configurar event listeners
function setupEventListeners() {
    // Botão próxima questão
    elements.buttons.nextQuestion.addEventListener('click', nextQuestion);
    
    // Botão selecionar plano
    elements.buttons.selectPlan.addEventListener('click', goToCheckout);
    

    
    // Botão continuar da tela de credibilidade
    const continueCredibilityBtn = document.getElementById('continue-credibility');
    if (continueCredibilityBtn) {
        continueCredibilityBtn.addEventListener('click', showLoadingScreen);
    }
    

    
    // Formulário de checkout
    elements.forms.checkout.addEventListener('submit', handleCheckout);
    
    // Seleção de perfil
    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.addEventListener('click', selectProfile);
    });
    
    // Seleção de respostas
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', selectAnswer);
    });
    
    // Seleção de respostas do grid
    document.querySelectorAll('.answer-btn-grid').forEach(btn => {
        btn.addEventListener('click', selectAnswer);
    });
    
    // Slider de investimento
    const investmentSlider = document.getElementById('investment-slider');
    const sliderValue = document.getElementById('slider-value');
    const sliderFill = document.querySelector('.slider-fill');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const continueBtn = document.getElementById('continue-investment');
    
    if (investmentSlider) {
        // Carregar valor salvo do localStorage
        const savedValue = localStorage.getItem('investmentValue') || 600;
        investmentSlider.value = savedValue;
        updateSliderDisplay(savedValue);
        
        // Event listener para mudança do slider
        investmentSlider.addEventListener('input', function() {
            const value = this.value;
            updateSliderDisplay(value);
            saveInvestmentValue(value);
            
            // Habilitar botão continuar
            if (continueBtn) {
                continueBtn.disabled = false;
            }
        });
        
        // Event listeners para botões preset
        presetBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const value = parseInt(this.dataset.value);
                investmentSlider.value = value;
                updateSliderDisplay(value);
                saveInvestmentValue(value);
                
                // Atualizar estado dos botões
                presetBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Habilitar botão continuar
                if (continueBtn) {
                    continueBtn.disabled = false;
                }
            });
        });
        
        // Event listener para botão continuar
        if (continueBtn) {
            continueBtn.addEventListener('click', function() {
                nextQuestion();
            });
        }
    }
    
    // Slider de expectativa de lucro
    const profitSlider = document.getElementById('profit-slider');
    const profitSliderValue = document.getElementById('profit-slider-value');
    const continueProfitBtn = document.getElementById('continue-profit');
    
    if (profitSlider) {
        // Carregar valor salvo do localStorage
        const savedProfitValue = localStorage.getItem('expectedProfit') || 1500;
        profitSlider.value = savedProfitValue;
        updateProfitSliderDisplay(savedProfitValue);
        
        // Event listener para mudança do slider
        profitSlider.addEventListener('input', function() {
            const value = this.value;
            updateProfitSliderDisplay(value);
            saveExpectedProfit(value);
            
            // Habilitar botão continuar
            if (continueProfitBtn) {
                continueProfitBtn.disabled = false;
            }
        });
        
        // Event listeners para botões preset (selecionar apenas os da questão 5)
        document.querySelectorAll('[data-question="5"] .preset-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const value = parseInt(this.dataset.value);
                profitSlider.value = value;
                updateProfitSliderDisplay(value);
                saveExpectedProfit(value);
                
                // Atualizar estado dos botões da questão 5
                document.querySelectorAll('[data-question="5"] .preset-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Habilitar botão continuar
                if (continueProfitBtn) {
                    continueProfitBtn.disabled = false;
                }
            });
        });
        
        // Event listener para botão continuar
        if (continueProfitBtn) {
            continueProfitBtn.addEventListener('click', function() {
                nextQuestion();
            });
        }
    }
    
    // Botão header CTA
    const headerCtaBtn = document.getElementById('header-cta');
    if (headerCtaBtn) {
        headerCtaBtn.addEventListener('click', () => {
            goToCheckout();
        });
    }
    
    // Input de texto para validação
    elements.inputs.name.addEventListener('input', function() {
        updateNextButton();
    });
    
    // Event listener para botão do header fixo
    const headerCta = document.getElementById('header-cta');
    if (headerCta) {
        headerCta.addEventListener('click', () => {
            goToCheckout();
        });
    }
}

// Mostrar tela específica
function showScreen(screenName) {
    // Esconder todas as telas
    Object.values(elements.screens).forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
        }
    });
    
    // Mostrar tela desejada
    if (elements.screens[screenName]) {
        elements.screens[screenName].classList.add('active');
        quizState.currentScreen = screenName;
        console.log('Tela ativada:', screenName); // Debug
        
        // Scroll para o topo da página
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        console.error('Tela não encontrada:', screenName); // Debug
        console.log('Telas disponíveis:', Object.keys(elements.screens)); // Debug
    }
    
    // Atualizar progresso se estiver nas questões
    if (screenName === 'questions') {
        updateProgress();
    }
}

// Iniciar quiz
function startQuiz() {
    showScreen('questions');
    showQuestion(1);
}

// Selecionar perfil
function selectProfile(event) {
    const profile = event.currentTarget.dataset.profile;
    
    console.log('Perfil selecionado:', profile); // Debug
    
    // Remover seleção anterior
    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Selecionar novo perfil
    event.currentTarget.classList.add('selected');
    quizState.selectedProfile = profile;
    
    // Ir diretamente para a próxima etapa após um pequeno delay
    setTimeout(() => {
        startQuiz();
    }, 300);
    
    console.log('Estado atual:', quizState); // Debug
}

// Mostrar questão específica
function showQuestion(questionNumber) {
    // Esconder todas as questões
    document.querySelectorAll('.question-screen').forEach(q => {
        q.classList.remove('active');
    });
    
    // Mostrar questão atual
    const currentQuestion = document.querySelector(`[data-question="${questionNumber}"]`);
    if (currentQuestion) {
        currentQuestion.classList.add('active');
        quizState.currentQuestion = questionNumber;
        updateProgress();
        
        // Verificar se é pergunta de múltipla escolha
        const isMultipleChoice = currentQuestion.querySelector('.answer-options.multiple');
        const nextButton = elements.buttons.nextQuestion;
        const continueInvestmentBtn = document.getElementById('continue-investment');
        
        if (isMultipleChoice) {
            // Mostrar botão para múltipla escolha
            nextButton.style.display = 'flex';
            if (continueInvestmentBtn) continueInvestmentBtn.style.display = 'none';
            setTimeout(() => {
                updateNextButton();
            }, 100);
        } else if (questionNumber === 1) {
            // Esconder botão padrão e mostrar botão do slider de investimento
            nextButton.style.display = 'none';
            if (continueInvestmentBtn) {
                continueInvestmentBtn.style.display = 'flex';
                continueInvestmentBtn.disabled = true; // Começa desabilitado
            }
            
            // Inicializar slider de investimento
            setTimeout(() => {
                const savedValue = localStorage.getItem('investmentValue') || 600;
                updateSliderDisplay(savedValue);
            }, 100);
        } else if (questionNumber === 5) {
            // Esconder botão padrão e mostrar botão do slider de lucro
            nextButton.style.display = 'none';
            const continueProfitBtn = document.getElementById('continue-profit');
            if (continueProfitBtn) {
                continueProfitBtn.style.display = 'flex';
                continueProfitBtn.disabled = true; // Começa desabilitado
            }
            
            // Inicializar slider de lucro
            setTimeout(() => {
                const savedValue = localStorage.getItem('expectedProfit') || 1500;
                updateProfitSliderDisplay(savedValue);
            }, 100);
        } else if (questionNumber === 7) {
            // Mostrar botão para questão de input
            nextButton.style.display = 'flex';
            if (continueInvestmentBtn) continueInvestmentBtn.style.display = 'none';
            setTimeout(() => {
                updateNextButton();
            }, 100);
        } else {
            // Esconder botão para escolha única
            nextButton.style.display = 'none';
            if (continueInvestmentBtn) continueInvestmentBtn.style.display = 'none';
        }
    }
}

// Selecionar resposta
function selectAnswer(event) {
    const answerBtn = event.currentTarget;
    const questionNumber = answerBtn.closest('.question-screen').dataset.question;
    
    // Verificar se é grid ou opções normais
    const isGrid = answerBtn.classList.contains('answer-btn-grid');
    const isMultiple = answerBtn.closest('.answer-options') && 
                      answerBtn.closest('.answer-options').classList.contains('multiple');
    
    if (isGrid) {
        // Botões de grid (escolha única)
        answerBtn.closest('.answer-grid').querySelectorAll('.answer-btn-grid').forEach(btn => {
            btn.classList.remove('selected');
        });
        answerBtn.classList.add('selected');
        quizState.answers[questionNumber] = answerBtn.dataset.value;
        
        // Avançar automaticamente após um delay
        setTimeout(() => {
            nextQuestion();
        }, 500);
    } else if (isMultiple) {
        // Múltipla escolha
        answerBtn.classList.toggle('selected');
        const selectedAnswers = Array.from(answerBtn.closest('.answer-options').querySelectorAll('.answer-btn.selected'))
            .map(btn => btn.dataset.value);
        quizState.answers[questionNumber] = selectedAnswers;
        updateNextButton();
    } else {
        // Escolha única normal
        answerBtn.closest('.answer-options').querySelectorAll('.answer-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        answerBtn.classList.add('selected');
        quizState.answers[questionNumber] = answerBtn.dataset.value;
        
        // Avançar automaticamente após um delay
        setTimeout(() => {
            nextQuestion();
        }, 500);
    }
}

// Próxima questão
function nextQuestion() {
    const currentQuestion = quizState.currentQuestion;
    
    // Para questão de input (7), validar se o campo está preenchido
    if (currentQuestion === 7) {
        const nameValue = elements.inputs.name.value.trim();
        if (!nameValue) {
            alert('Por favor, digite seu nome antes de continuar.');
            return;
        }
        quizState.userData.name = nameValue;
        quizState.answers[currentQuestion] = nameValue;
        console.log('Nome salvo:', nameValue); // Debug
        console.log('Indo para credibilidade...'); // Debug
    } else if (currentQuestion === 1) {
        // Para questão do slider de investimento, verificar se há valor selecionado
        const investmentValue = localStorage.getItem('investmentValue') || 600;
        if (!investmentValue) {
            alert('Por favor, selecione um valor de investimento antes de continuar.');
            return;
        }
        quizState.answers.investment = investmentValue;
    } else if (currentQuestion === 5) {
        // Para questão do slider de lucro, verificar se há valor selecionado
        const expectedProfit = localStorage.getItem('expectedProfit') || 1500;
        if (!expectedProfit) {
            alert('Por favor, selecione uma expectativa de lucro antes de continuar.');
            return;
        }
        quizState.answers[currentQuestion] = expectedProfit;
    } else {
        // Para questões normais, validar se há resposta selecionada
        if (!quizState.answers[currentQuestion] || 
            (Array.isArray(quizState.answers[currentQuestion]) && quizState.answers[currentQuestion].length === 0)) {
            alert('Por favor, selecione uma resposta antes de continuar.');
            return;
        }
    }
    
    // Ir para próxima questão ou tela de credibilidade
    if (currentQuestion < QUIZ_CONFIG.totalQuestions) {
        showQuestion(currentQuestion + 1);
        
        // Scroll para o topo da página
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        showCredibilityScreen();
    }
}

// Mostrar tela de credibilidade
function showCredibilityScreen() {
    showScreen('credibility');
}

// Mostrar tela de loading
function showLoadingScreen() {
    showScreen('loading');
    
    // Iniciar carrossel de testimonials
    startTestimonialCarousel();
    
    // Animar os passos de carregamento com tempos específicos
    const steps = document.querySelectorAll('.loading-step');
    const stepTimes = [3000, 4000, 2000, 5000]; // Tempos em milissegundos
    let currentStep = 0;
    
    function animateStep() {
        if (currentStep < steps.length) {
            const currentStepElement = steps[currentStep];
            currentStepElement.classList.add('active');
            
            // Animar a porcentagem deste passo
            animateStepProgress(currentStepElement, stepTimes[currentStep]);
            
            // Avançar para o próximo passo após o tempo específico
            setTimeout(() => {
                currentStep++;
                animateStep();
            }, stepTimes[currentStep]);
        } else {
            // Após todos os passos, mostrar oferta
            setTimeout(showOfferScreen, 1000);
        }
    }
    
    animateStep();
}

// Carrossel de testimonials
function startTestimonialCarousel() {
    const testimonials = document.querySelectorAll('#loading-screen .testimonial-card');
    let currentIndex = 0;
    
    function showNextTestimonial() {
        // Esconder todos os testimonials
        testimonials.forEach(testimonial => {
            testimonial.style.display = 'none';
        });
        
        // Mostrar o próximo testimonial
        testimonials[currentIndex].style.display = 'block';
        
        // Avançar para o próximo
        currentIndex = (currentIndex + 1) % testimonials.length;
        
        // Agendar próximo testimonial em 3 segundos
        setTimeout(showNextTestimonial, 3000);
    }
    
    // Iniciar o carrossel
    showNextTestimonial();
}

// Animar porcentagem de um passo
function animateStepProgress(stepElement, duration) {
    const progressBar = stepElement.querySelector('.step-fill');
    const percentageElement = stepElement.querySelector('.step-percentage');
    const startTime = Date.now();
    
    function updateProgress() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const percentage = Math.round(progress * 100);
        
        // Atualizar barra de progresso
        progressBar.style.width = `${percentage}%`;
        
        // Atualizar porcentagem
        percentageElement.textContent = `${percentage}%`;
        
        if (progress < 1) {
            requestAnimationFrame(updateProgress);
        } else {
            // Quando chegar a 100%, mostrar ícone de verificado
            showStepCompleted(stepElement);
        }
    }
    
    updateProgress();
}

// Mostrar ícone de verificado quando etapa for concluída
function showStepCompleted(stepElement) {
    const percentageElement = stepElement.querySelector('.step-percentage');
    
    // Substituir porcentagem por ícone de verificado
    percentageElement.innerHTML = '<i class="fas fa-check"></i>';
    percentageElement.classList.add('completed');
}



// Mostrar tela de oferta
function showOfferScreen() {
    showScreen('offer');
    calculateAndDisplayProfit();
    startUrgencyTimer();
}

function calculateAndDisplayProfit() {
    const answers = quizState.answers;
    const investment = parseInt(answers.investment) || 600;
    
    // Calcular lucros dos 4 meses
    const month1Profit = Math.round(investment * 0.30); // 30%
    const month2Profit = Math.round(investment * 0.80); // 80%
    const month3Profit = Math.round(investment * 1.50); // 150%
    const month4Profit = Math.round(investment * 3.80); // 380%
    const totalProfit = month1Profit + month2Profit + month3Profit + month4Profit;
    
    // Atualizar elementos na tela
    const userInvestmentElement = document.getElementById('user-investment');
    const userInvestmentHeaderElement = document.getElementById('user-investment-header');
    const totalProfitHeaderElement = document.getElementById('total-profit-header');
    const month1Element = document.getElementById('month1-profit');
    const month2Element = document.getElementById('month2-profit');
    const month3Element = document.getElementById('month3-profit');
    const month4Element = document.getElementById('month4-profit');
    const totalElement = document.getElementById('total-4months-profit');
    const returnInvestmentElement = document.getElementById('return-investment');
    
    if (userInvestmentElement) userInvestmentElement.textContent = investment.toLocaleString('pt-BR');
    if (userInvestmentHeaderElement) userInvestmentHeaderElement.textContent = investment.toLocaleString('pt-BR');
    if (totalProfitHeaderElement) totalProfitHeaderElement.textContent = totalProfit.toLocaleString('pt-BR');
    if (month1Element) month1Element.textContent = month1Profit.toLocaleString('pt-BR');
    if (month2Element) month2Element.textContent = month2Profit.toLocaleString('pt-BR');
    if (month3Element) month3Element.textContent = month3Profit.toLocaleString('pt-BR');
    if (month4Element) month4Element.textContent = month4Profit.toLocaleString('pt-BR');
    if (totalElement) totalElement.textContent = totalProfit.toLocaleString('pt-BR');
    if (returnInvestmentElement) returnInvestmentElement.textContent = totalProfit.toLocaleString('pt-BR');
    
    // Animar as barras de progresso
    setTimeout(() => {
        animateProfitBars();
    }, 500);
}

function animateProfitBars() {
    const bars = document.querySelectorAll('.profit-fill');
    const percentages = [8, 21, 39, 100]; // Percentuais baseados nos lucros
    
    bars.forEach((bar, index) => {
        const percentage = percentages[index] || 0;
        
        setTimeout(() => {
            bar.style.width = percentage + '%';
        }, index * 300);
    });
}

function startUrgencyTimer() {
    let timeLeft = 5 * 60; // 5 minutos em segundos
    const timerDisplay = document.getElementById('urgency-timer');
    
    const timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        if (timerDisplay) {
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timer);
            if (timerDisplay) {
                timerDisplay.textContent = '00:00';
            }
        }
    }, 1000);
}





// Ir para checkout
function goToCheckout() {
    // URL base para redirecionamento
    const baseUrl = 'https://pay.kiwify.com.br/SNxsdzs';
    
    // Obter parâmetros da URL atual
    const currentUrl = new URL(window.location.href);
    const currentParams = currentUrl.searchParams;
    
    // Criar nova URL com parâmetros
    const redirectUrl = new URL(baseUrl);
    
    // Adicionar todos os parâmetros da URL atual
    for (const [key, value] of currentParams.entries()) {
        redirectUrl.searchParams.set(key, value);
    }
    
    // Redirecionar para a URL de pagamento
    window.location.href = redirectUrl.toString();
}



// Lidar com checkout
function handleCheckout(event) {
    event.preventDefault();
    
    const formData = {
        name: elements.inputs.checkoutName.value,
        email: elements.inputs.checkoutEmail.value,
        phone: elements.inputs.checkoutPhone.value,
        profile: quizState.selectedProfile,
        answers: quizState.answers
    };
    
    // Aqui você pode integrar com seu sistema de pagamento
    console.log('Dados do checkout:', formData);
    
    // Simular processamento
    showSuccessScreen();
    
    // Enviar dados para webhook (opcional)
    sendToWebhook(formData);
}

// Mostrar tela de sucesso
function showSuccessScreen() {
    showScreen('success');
}

// Enviar para webhook
function sendToWebhook(data) {
    // Substitua pela URL do seu webhook
    const webhookUrl = 'https://seu-webhook.com/quiz-data';
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).catch(error => {
        console.log('Erro ao enviar dados:', error);
    });
}

// Atualizar progresso
function updateProgress() {
    const currentQuestion = quizState.currentQuestion;
    const totalQuestions = QUIZ_CONFIG.totalQuestions;
    
    // Atualizar texto do progresso
    if (elements.progress.text) {
        elements.progress.text.textContent = `Passo ${currentQuestion} de ${totalQuestions}`;
    }
    
    // Atualizar barra de progresso
    if (elements.progress.fill) {
        const percentage = (currentQuestion / totalQuestions) * 100;
        elements.progress.fill.style.width = `${percentage}%`;
    }
}

// Atualizar botão próximo
function updateNextButton() {
    const currentQuestion = quizState.currentQuestion;
    let hasAnswer = false;
    
    if (currentQuestion === 7) {
        // Para questão de nome
        hasAnswer = elements.inputs.name.value.trim().length > 0;
    } else {
        // Para questões normais (incluindo grid)
        hasAnswer = quizState.answers[currentQuestion] && 
                   (Array.isArray(quizState.answers[currentQuestion]) ? 
                    quizState.answers[currentQuestion].length > 0 : 
                    true);
    }
    
    elements.buttons.nextQuestion.disabled = !hasAnswer;
}



// Contador regressivo
function startCountdown() {
    let minutes = QUIZ_CONFIG.countdownMinutes;
    let seconds = QUIZ_CONFIG.countdownSeconds;
    
    const countdownInterval = setInterval(() => {
        if (seconds > 0) {
            seconds--;
        } else if (minutes > 0) {
            minutes--;
            seconds = 59;
        } else {
            clearInterval(countdownInterval);
            // Resetar contador quando chegar a zero
            minutes = QUIZ_CONFIG.countdownMinutes;
            seconds = QUIZ_CONFIG.countdownSeconds;
        }
        
        // Atualizar elementos
        if (elements.countdown.minutes) {
            elements.countdown.minutes.textContent = minutes.toString().padStart(2, '0');
        }
        if (elements.countdown.seconds) {
            elements.countdown.seconds.textContent = seconds.toString().padStart(2, '0');
        }
    }, 1000);
}

// Iniciar contador do header fixo
function startOfferCountdown() {
    let minutes = 10;
    let seconds = 0;
    
    const countdownElement = document.getElementById('offer-countdown');
    
    const timer = setInterval(() => {
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(timer);
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }
        
        if (countdownElement) {
            countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

// Animações suaves
function animateTransition(fromScreen, toScreen) {
    fromScreen.style.opacity = '0';
    fromScreen.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        toScreen.style.opacity = '1';
        toScreen.style.transform = 'translateY(0)';
    }, 300);
}

// Utilitários
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Funções do Slider
function updateSliderDisplay(value) {
    const sliderValue = document.getElementById('slider-value');
    
    if (sliderValue) {
        sliderValue.textContent = `R$ ${value.toLocaleString('pt-BR')}`;
    }
    
    // Atualizar preenchimento da barra
    const sliderFill = document.querySelector('.slider-fill');
    if (sliderFill) {
        const percentage = ((value - 100) / (10000 - 100)) * 100;
        sliderFill.style.width = `${percentage}%`;
    }
}

function saveInvestmentValue(value) {
    localStorage.setItem('investmentValue', value);
    quizState.answers[1] = value; // Salvar na questão 1
}

function updateProfitSliderDisplay(value) {
    const profitSliderValue = document.getElementById('profit-slider-value');
    const profitSliderFill = document.querySelector('[data-question="5"] .slider-fill');
    
    if (profitSliderValue) {
        profitSliderValue.textContent = `R$ ${parseInt(value).toLocaleString('pt-BR')}`;
    }
    
    if (profitSliderFill) {
        const percentage = ((value - 500) / (10000 - 500)) * 100;
        profitSliderFill.style.width = `${percentage}%`;
    }
}

function saveExpectedProfit(value) {
    localStorage.setItem('expectedProfit', value);
    quizState.answers[5] = value; // Salvar na questão 5
}

// Event listeners para melhor UX
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        if (quizState.currentScreen === 'welcome' && quizState.selectedProfile) {
            startQuiz();
        } else if (quizState.currentScreen === 'questions' && !elements.buttons.nextQuestion.disabled) {
            nextQuestion();
        } else if (quizState.currentScreen === 'offer') {
            goToCheckout();
        }
    }
});

// Prevenir zoom em dispositivos móveis
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, { passive: false });

// Detectar dispositivo móvel
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Ajustar para dispositivos móveis
if (isMobile()) {
    document.body.classList.add('mobile');
}

// Analytics (opcional)
function trackEvent(eventName, data = {}) {
    // Integração com Google Analytics, Facebook Pixel, etc.
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, data);
    }
    
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, data);
    }
}

// Rastrear eventos importantes
document.addEventListener('click', function(event) {
    if (event.target.closest('.profile-btn')) {
        trackEvent('profile_selected', { profile: quizState.selectedProfile });
    }
    
    if (event.target.closest('.answer-btn')) {
        trackEvent('question_answered', { 
            question: quizState.currentQuestion,
            answer: event.target.closest('.answer-btn').dataset.value 
        });
    }
    
    if (event.target.closest('#select-plan')) {
        trackEvent('checkout_started');
    }
});

// Exportar para uso externo
window.QuizApp = {
    getState: () => quizState,
    getAnswers: () => quizState.answers,
    getUserData: () => quizState.userData

}; 
