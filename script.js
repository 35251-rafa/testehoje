/**
 * PORTFÓLIO TECH - RAFAEL PARIZ DE MORAES (2º B TÉCNICO EM TI)
 * script.js - Lógica interativa, animação de contadores via IntersectionObserver,
 * alternador de tema, validação de formulário terminal e rolagem 100% nativa.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Constante de Contato Oficial do Aluno
  const OFFICIAL_EMAIL = '35251@raphaeldisanto';

  /* ==========================================================================
     1. TEMA CLARO / ESCURO (DARK / LIGHT MODE)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('themeToggle');
  const currentTheme = localStorage.getItem('tech_portfolio_theme') || 'dark';

  document.body.setAttribute('data-theme', currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.body.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('tech_portfolio_theme', newTheme);

      showToast(
        newTheme === 'dark' ? 'Modo Dark Tech Ativado 🌙' : 'Modo Claro Ativado ☀️', 
        'info'
      );
    });
  }

  /* ==========================================================================
     2. MENU MOBILE RESPONSIVO
     ========================================================================== */
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Fechar menu mobile ao clicar em qualquer link de navegação
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ==========================================================================
     3. DESTAQUE DINÂMICO DE SEÇÕES NA NAVEGAÇÃO (SCROLL NATIVO)
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');

  const highlightNavOnScroll = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const headerOffset = 120;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - headerOffset;
      const sectionId = current.getAttribute('id');
      const correspondingLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

      if (correspondingLink) {
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          correspondingLink.classList.add('active');
        } else {
          correspondingLink.classList.remove('active');
        }
      }
    });
  };

  window.addEventListener('scroll', highlightNavOnScroll, { passive: true });

  /* ==========================================================================
     4. CONTADORES ANIMADOS DE MÉTRICAS (VIA INTERSECTION OBSERVER)
     Inspirado em Loam House com rolagem 100% nativa sem travar o scroll.
     ========================================================================== */
  const metricCards = document.querySelectorAll('.metric-card');
  let metricsAnimated = false;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const format = el.getAttribute('data-format');
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600; // ms
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing suave (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.floor(easeProgress * target);

      // Formatação dos números
      if (format === 'prefix-zero') {
        el.textContent = `${currentVal < 10 ? '0' + currentVal : currentVal}${suffix}`;
      } else if (format === 'ordinal') {
        el.textContent = `${currentVal}º`;
      } else {
        el.textContent = `${currentVal}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        // Garantir valor final exato
        if (format === 'prefix-zero') {
          el.textContent = `${target < 10 ? '0' + target : target}${suffix}`;
        } else if (format === 'ordinal') {
          el.textContent = `${target}º`;
        } else {
          el.textContent = `${target}${suffix}`;
        }
      }
    };

    requestAnimationFrame(updateCount);
  };

  if ('IntersectionObserver' in window && metricCards.length > 0) {
    const metricsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !metricsAnimated) {
          metricsAnimated = true;
          
          const counterElements = document.querySelectorAll('.counter-number');
          counterElements.forEach(counter => animateCounter(counter));

          // Animar preenchimento das barras de progresso
          const progressBars = document.querySelectorAll('.metric-bar');
          progressBars.forEach(bar => {
            const progress = bar.style.getPropertyValue('--metric-progress') || '100%';
            bar.style.width = progress;
          });

          observer.disconnect();
        }
      });
    }, {
      threshold: 0.25
    });

    const metricsSection = document.getElementById('metricas');
    if (metricsSection) {
      metricsObserver.observe(metricsSection);
    }
  } else {
    // Fallback caso IntersectionObserver não esteja disponível
    document.querySelectorAll('.counter-number').forEach(counter => {
      const target = counter.getAttribute('data-target');
      const suffix = counter.getAttribute('data-suffix') || '';
      counter.textContent = `${target}${suffix}`;
    });
  }

  /* ==========================================================================
     5. CÓPIA RÁPIDA DE E-MAIL PARA A ÁREA DE TRANSFERÊNCIA
     ========================================================================== */
  const copyEmailToClipboard = (email) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(email)
        .then(() => {
          showToast(`E-mail ${email} copiado com sucesso! 📋`, 'success');
        })
        .catch(() => fallbackCopy(email));
    } else {
      fallbackCopy(email);
    }
  };

  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(`E-mail ${text} copiado! 📋`, 'success');
    } catch (err) {
      showToast(`E-mail: ${text}`, 'info');
    }
    document.body.removeChild(textArea);
  };

  const btnCopyEmailHero = document.getElementById('btnCopyEmailHero');
  const btnCopyOfficialEmail = document.getElementById('btnCopyOfficialEmail');

  if (btnCopyEmailHero) {
    btnCopyEmailHero.addEventListener('click', () => copyEmailToClipboard(OFFICIAL_EMAIL));
  }

  if (btnCopyOfficialEmail) {
    btnCopyOfficialEmail.addEventListener('click', () => copyEmailToClipboard(OFFICIAL_EMAIL));
  }

  /* ==========================================================================
     6. FORMULÁRIO DE CONTATO ESTILO TERMINAL COM VALIDAÇÃO EM JS
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const nameInput = document.getElementById('formName');
  const emailInput = document.getElementById('formEmail');
  const subjectInput = document.getElementById('formSubject');
  const messageInput = document.getElementById('formMessage');
  const terminalLog = document.getElementById('terminalLog');
  const submitBtn = document.getElementById('submitBtn');

  // Validador de formato de e-mail
  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  // Atualizar log do terminal
  const updateTerminalLog = (message, statusClass = '') => {
    if (terminalLog) {
      terminalLog.className = 'terminal-log-output';
      if (statusClass) {
        terminalLog.classList.add(statusClass);
      }
      terminalLog.innerHTML = message;
    }
  };

  // Validação em tempo real individual
  const validateField = (input, errorId, validatorFn, errorMsg) => {
    const errorEl = document.getElementById(errorId);
    const value = input.value.trim();

    if (!validatorFn(value)) {
      input.classList.add('input-error');
      if (errorEl) errorEl.textContent = errorMsg;
      return false;
    } else {
      input.classList.remove('input-error');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
  };

  if (contactForm) {
    // Listeners de blur e input para feedback ágil
    if (nameInput) {
      nameInput.addEventListener('input', () => {
        validateField(nameInput, 'nameError', val => val.length >= 2, 'Por favor, informe seu nome (mínimo 2 caracteres).');
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', () => {
        validateField(emailInput, 'emailError', isValidEmail, 'Informe um endereço de e-mail válido.');
      });
    }

    if (subjectInput) {
      subjectInput.addEventListener('input', () => {
        validateField(subjectInput, 'subjectError', val => val.length >= 3, 'Informe um assunto claro (mínimo 3 caracteres).');
      });
    }

    if (messageInput) {
      messageInput.addEventListener('input', () => {
        validateField(messageInput, 'messageError', val => val.length >= 10, 'A mensagem deve ter pelo menos 10 caracteres.');
      });
    }

    // Envio do Formulário Terminal
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput, 'nameError', val => val.length >= 2, 'Por favor, informe seu nome.');
      const isEmailValid = validateField(emailInput, 'emailError', isValidEmail, 'Informe um e-mail válido.');
      const isSubjectValid = validateField(subjectInput, 'subjectError', val => val.length >= 3, 'Informe o assunto.');
      const isMessageValid = validateField(messageInput, 'messageError', val => val.length >= 10, 'Mensagem deve ter no mínimo 10 caracteres.');

      if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
        updateTerminalLog('[ERRO: 400] Dados de formulário incompletos ou inválidos. Corrija os campos destacados.', 'status-error');
        showToast('Corrija os campos destacados no terminal.', 'error');
        return;
      }

      // Simulação de transmissão de pacote via terminal
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Transmitindo...</span>`;
      }

      updateTerminalLog(`[TCP_CONNECT] Conectando ao host postal... Destino: ${OFFICIAL_EMAIL}`, '');

      setTimeout(() => {
        updateTerminalLog(`[ENCRYPT] Cifrando payload de ${nameInput.value}...`, '');
        
        setTimeout(() => {
          updateTerminalLog(`[STATUS: 200 OK] Pacote enviado com sucesso para ${OFFICIAL_EMAIL}! Rafael foi notificado.`, 'status-success');
          
          showToast(`Mensagem transmitida com sucesso para ${OFFICIAL_EMAIL}! 🚀`, 'success');
          
          // Reset dos campos
          contactForm.reset();
          
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
              <span class="btn-text">Transmitir Mensagem</span>
              <svg class="send-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            `;
          }
        }, 800);
      }, 700);
    });

    // Reset do terminal
    contactForm.addEventListener('reset', () => {
      setTimeout(() => {
        document.querySelectorAll('.terminal-input, .terminal-textarea').forEach(input => input.classList.remove('input-error'));
        document.querySelectorAll('.field-error').forEach(err => err.textContent = '');
        updateTerminalLog('[STATUS: PRONTO] Formulário redefinido. Pronto para nova entrada.', '');
      }, 50);
    });
  }

  /* ==========================================================================
     7. MODAL DE DETALHES TÉCNICOS DOS PROJETOS
     ========================================================================== */
  const projectModal = document.getElementById('projectModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  const projectDetailsData = {
    hacker: {
      title: 'Página Hacker - Detalhes da Arquitetura',
      content: `
        <p><strong>Visão Geral:</strong> Experiência imersiva inspirada na estética de computação cyberpunk e terminais hacker. Desenvolvida para demonstrar manipulação criativa de DOM e estilização visual marcante.</p>
        <div class="modal-tech-list">
          <div class="modal-tech-item"><strong>Estética:</strong> Matrix / Dark Cyberpunk</div>
          <div class="modal-tech-item"><strong>Tecnologias:</strong> HTML5, CSS3, JS Puro</div>
          <div class="modal-tech-item"><strong>Deploy:</strong> Vercel Edge Network</div>
          <div class="modal-tech-item"><strong>Interatividade:</strong> Scripts de terminal</div>
        </div>
        <p style="margin-bottom: 20px;"><strong>Destaques de Engenharia:</strong> Alta fidelidade visual sem dependências pesadas, efeitos de scanline e glow verde neon em alta taxa de quadros (60fps).</p>
        <a href="https://pagina-hacker.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width: 100%;">
          Visitar Página Hacker no Ar &rarr;
        </a>
      `
    },
    iota: {
      title: 'Projeto Iota - Detalhes da Arquitetura',
      content: `
        <p><strong>Visão Geral:</strong> Plataforma web moderna focada em organização de conteúdo, design minimalista e responsividade precisa para todos os tamanhos de tela.</p>
        <div class="modal-tech-list">
          <div class="modal-tech-item"><strong>Arquitetura:</strong> Grid & Flexbox Moderno</div>
          <div class="modal-tech-item"><strong>Performance:</strong> Carregamento Instantâneo</div>
          <div class="modal-tech-item"><strong>Deploy:</strong> Vercel Edge Network</div>
          <div class="modal-tech-item"><strong>UX:</strong> Navegação intuitiva</div>
        </div>
        <p style="margin-bottom: 20px;"><strong>Destaques de Engenharia:</strong> Sem inchaço de frameworks; estrutura pura que garante consumo mínimo de banda e pontuação elevada em Core Web Vitals.</p>
        <a href="https://projeto-iota-rosy.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="width: 100%;">
          Visitar Projeto Iota no Ar &rarr;
        </a>
      `
    }
  };

  const openModal = (projectKey) => {
    const data = projectDetailsData[projectKey];
    if (!data || !projectModal) return;

    modalTitle.textContent = data.title;
    modalBody.innerHTML = data.content;
    projectModal.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!projectModal) return;
    projectModal.classList.remove('active');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.btn-project-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const projectKey = btn.getAttribute('data-project');
      openModal(projectKey);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && projectModal.classList.contains('active')) {
      closeModal();
    }
  });

  /* ==========================================================================
     8. TOAST NOTIFICATIONS (ALERTAS TECH)
     ========================================================================== */
  let toastTimeout;
  const showToast = (message, type = 'info') => {
    const toast = document.getElementById('cyberToast');
    const toastMsg = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    if (!toast || !toastMsg) return;

    clearTimeout(toastTimeout);

    toastMsg.textContent = message;
    if (toastIcon) {
      if (type === 'success') {
        toastIcon.textContent = '✓';
        toastIcon.style.background = 'var(--accent-emerald)';
      } else if (type === 'error') {
        toastIcon.textContent = '!';
        toastIcon.style.background = 'var(--accent-red)';
      } else {
        toastIcon.textContent = '⚡';
        toastIcon.style.background = 'var(--accent-blue)';
      }
    }

    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  };
});
