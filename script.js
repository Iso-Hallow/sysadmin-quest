document.addEventListener('DOMContentLoaded', () => {

    // --- СНАЧАЛА НАЙДЕМ ВСЕ НУЖНЫЕ HTML-ЭЛЕМЕНТЫ ---
    const questScreen = document.getElementById('quest-screen');
    const actionPanel = document.getElementById('action-panel');
    const scanModal = document.getElementById('scan-modal');
    const creditsModal = document.getElementById('credits-modal');
    
    // --- ЗАТЕМ ОБЪЯВИМ ВСЕ ФУНКЦИИ, КОТОРЫЕ БУДУТ ИСПОЛЬЗОВАТЬСЯ ---

    window.showJoke = function() {
        alert("АНЕКДОТ:\n\nСо слов пользователя:\n- Компьютер не работал. Пришел инженер, воздел руки к небу, пробормотал заклинания, прокрутил мой стул 3 раза, пнул компьютер — и случилось чудо — он заработал!\n\nСо слов инженера:\n- Прихожу. Пользователь так вертелся на стуле, что кабель питания намотался на ножку и выдернулся. Увидев это, возношу руки к небу, произношу несколько непечатных выражений, разматываю кабель, запихиваю системный блок ногой подальше под стол и включаю.");
    }
    window.showSystemScan = function() { if(scanModal) scanModal.style.display = 'flex'; }
    window.hideSystemScan = function() { if(scanModal) scanModal.style.display = 'none'; }
    window.showCredits = function() { if(creditsModal) creditsModal.style.display = 'flex'; }
    window.hideCredits = function() { if(creditsModal) creditsModal.style.display = 'none'; }

    // --- ТЕПЕРЬ ОПИШЕМ ДАННЫЕ ДЛЯ КВЕСТА ---
    const questData = {
        no_power: {
            start: { text: "ПОСТУПИЛ НОВЫЙ ИНЦИДЕНТ.\n\nСимптом: Рабочая станция не реагирует на кнопку включения. Индикаторы на корпусе и периферии не горят.\n\nПЛАН ДИАГНОСТИКИ:", actions: [ { text: "Проверить кабель питания и источник (ИБП/розетка)", next: "no_power.check_power_cable" }, { text: "Проверить индикатор на блоке питания", next: "no_power.check_psu_led" }, { text: "Запустить системную диагностику", next: "no_power.run_scan_artefact", isBad: true } ] },
            check_power_cable: { text: "РЕЗУЛЬТАТ: Кабель питания был выдернут из розетки.\n\n[ ИНЦИДЕНТ РЕШЕН ]\n\nВывод: Диагностика всегда начинается с проверки базовой инфраструктуры.", onSuccess: showCredits, actions: [{ text: "Перейти к другим сценариям", next: "start_menu" }] },
            check_psu_led: { text: "РЕЗУЛЬТАТ: Индикатор на блоке питания не горит.\n\nЭто подтверждает отсутствие входящего питания. Проблема не в компьютере, а в цепи 'кабель-ИБП-розетка'.", actions: [{ text: "Вернуться к первичной диагностике", next: "no_power.start" }] },
            run_scan_artefact: { text: "Запущена удаленная системная диагностика... (см. отдельное окно)\n\nВывод: Диагностика не выявила проблем, так как система обесточена.", onEnter: showSystemScan, actions: [{ text: "Вернуться к диагностике", next: "no_power.start" }] }
        },
        printer_issue: {
            start: { text: "ИНЦИДЕНТ: Пользователь сообщает, что 'принтер не печатает'. Документы отправляются, но из принтера ничего не выходит.\n\nДЕЙСТВИЯ:", actions: [ { text: "Перезагрузить ПК и принтер", next: "printer_issue.reboot" }, { text: "Проверить очередь печати", next: "printer_issue.check_queue" }, { text: "Переустановить драйвер", next: "printer_issue.reinstall_driver", isBad: true } ] },
            reboot: { text: "РЕЗУЛЬТАТ: После перезагрузки проблема не решена.\n\nВывод: 'Перезагрузка' — валидный первый шаг, но не решает системные проблемы.", actions: [{ text: "Вернуться и проверить очередь печати", next: "printer_issue.start" }] },
            check_queue: { text: "ДИАГНОСТИКА: В очереди печати 'завис' документ с ошибкой.\n\nСЛЕДУЮЩИЙ ШАГ:", actions: [ { text: "Очистить очередь (стандартно)", next: "printer_issue.clear_queue_fail" }, { text: "Перезапустить службу 'Диспетчер печати'", next: "printer_issue.restart_spooler" } ] },
            reinstall_driver: { text: "РЕЗУЛЬТАТ: Преждевременная эскалация. Проблема не решена.\n\n[ GAME OVER ]", actions: [{ text: "Начать диагностику заново", next: "printer_issue.start" }] },
            clear_queue_fail: { text: "РЕЗУЛЬТАТ: Попытка очистить очередь не удалась. Зависший документ не удаляется.", actions: [{ text: "Вернуться и перезапустить службу", next: "printer_issue.check_queue" }] },
            restart_spooler: { text: "ДЕЙСТВИЕ: Вы перезапустили службу 'Диспетчер печати' (spoolsv.exe).\n\nРЕЗУЛЬТАТ: Очередь очистилась.\n\n[ ИНЦИДЕНТ РЕШЕН ]", onSuccess: showCredits, actions: [{ text: "Перейти к другим сценариям", next: "start_menu" }] }
        },
        app_crash: {
            start: { text: "ИНЦИДЕНТ: Программа 'SuperCAD' вылетает с ошибкой при запуске.\n\nДЕЙСТВИЯ:", actions: [ { text: "Переустановить программу", next: "app_crash.reinstall", isBad: true }, { text: "Запустить от имени администратора", next: "app_crash.run_as_admin" }, { text: "Проверить 'Просмотр событий' Windows", next: "app_crash.event_viewer" } ] },
            run_as_admin: { text: "РЕЗУЛЬТАТ: Запуск от имени администратора не изменил ситуацию.\n\nВывод: Проблема не в правах доступа.", actions: [{ text: "Вернуться к диагностике", next: "app_crash.start" }] },
            event_viewer: { text: "ДИАГНОСТИКА: В журнале 'Приложения' найдена ошибка (Event ID 1000) для SuperCAD.exe со сбойным модулем 'MSVCR120.dll'.\n\nВЫВОД: Отсутствует или повреждена библиотека C++.", actions: [ { text: "Установить 'Microsoft Visual C++ Redistributable'", next: "app_crash.install_vc" } ] },
            install_vc: { text: "ДЕЙСТВИЕ: Вы установили пакет 'Visual C++ Redistributable 2013'.\n\nРЕЗУЛЬТАТ: Программа запустилась.\n\n[ ИНЦИДЕНТ РЕШЕН ]", onSuccess: showCredits, actions: [{ text: "Перейти к другим сценариям", next: "start_menu" }] },
            reinstall: { text: "РЕЗУЛЬТАТ: 'Слепая' переустановка — неэффективный метод. Проблема не решена.\n\n[ GAME OVER ]", actions: [{ text: "Начать диагностику заново", next: "app_crash.start" }] }
        },
        bsod: {
            start: { text: "ИНЦИДЕНТ: Пользователь сообщает о периодических BSOD с кодом 'MEMORY_MANAGEMENT'.\n\nДЕЙСТВИЯ:", actions: [ { text: "Посоветовать 'переустановить Windows'", next: "bsod.reinstall_os", isBad: true }, { text: "Запустить проверку памяти Windows (mdsched.exe)", next: "bsod.mdsched" }, { text: "Проверить системные файлы (sfc /scannow)", next: "bsod.sfc" } ] },
            mdsched: { text: "РЕЗУЛЬТАТ: Диагностика памяти обнаружила аппаратные ошибки в модуле ОЗУ.\n\n[ ИНЦИДЕНТ ЛОКАЛИЗОВАН ]\n\nВывод: Требуется замена неисправного модуля.", onSuccess: showCredits, actions: [{ text: "Перейти к другим сценариям", next: "start_menu" }] },
            sfc: { text: "РЕЗУЛЬТАТ: Проверка системных файлов не обнаружила нарушений.\n\nВывод: Проблема носит аппаратный характер.", actions: [{ text: "Вернуться и запустить проверку памяти", next: "bsod.start" }] },
            reinstall_os: { text: "РЕЗУЛЬТАТ: Переустановка ОС не решила проблему. BSOD появляется снова.\n\n[ GAME OVER ]\n\nВывод: Аппаратные проблемы не решаются переустановкой ПО.", actions: [{ text: "Начать диагностику заново", next: "bsod.start" }] }
        },
        network_issue: {
            start: { text: "ИНЦИДЕНТ: 'Ничего не открывается в интернете', хотя 'вчера всё работало'.\n\nДИАГНОСТИКА (ping):", actions: [ { text: "ping 8.8.8.8 (публичный DNS)", next: "network_issue.ping_google_dns" }, { text: "ping ya.ru (по доменному имени)", next: "network_issue.ping_domain" }, { text: "ping 192.168.1.1 (шлюз)", next: "network_issue.ping_gateway" } ] },
            ping_gateway: { text: "РЕЗУЛЬТАТ: `ping 192.168.1.1` - успешно.\n\nВывод: Локальная сеть в порядке. Проблема дальше.", actions: [{ text: "Вернуться к диагностике", next: "network_issue.start" }] },
            ping_google_dns: { text: "РЕЗУЛЬТАТ: `ping 8.8.8.8` - успешно.\n\nВывод: Доступ в интернет на уровне IP есть. Проблема, скорее всего, в DNS.", actions: [{ text: "Вернуться и попробовать пинг по имени", next: "network_issue.start" }] },
            ping_domain: { text: "РЕЗУЛЬТАТ: `ping ya.ru` - 'не удалось найти узел ya.ru'.\n\nДИАГНОЗ: Система не может преобразовать доменное имя в IP. Классическая проблема с DNS.\n\n[ ИНЦИДЕНТ РЕШЕН ]", onSuccess: showCredits, actions: [{ text: "Перейти к другим сценариям", next: "start_menu" }] }
        }
    };

    const startMenu = {
         start_menu: {
            text: "Симулятор IT-инженера.\n\nВыберите инцидент для диагностики:",
            actions: [
                { text: "Рабочая станция не включается", next: "no_power.start" },
                { text: "Принтер не печатает", next: "printer_issue.start" },
                { text: "Программа 'X' вылетает", next: "app_crash.start" },
                { text: "Критическая ошибка системы (BSOD)", next: "bsod.start" },
                { text: "Проблема с доступом к сети", next: "network_issue.start" }
            ]
        }
    };
    
    // --- ДВИЖОК КВЕСТА ---
    const historyStack = [];

    function showStep(stepPath, isGoingBack = false) {
        if (!isGoingBack) {
            historyStack.push(stepPath);
        }
        
        const pathParts = stepPath.split('.');
        let currentStep = (pathParts.length > 1) ? questData[pathParts[0]]?.[pathParts[1]] : startMenu[stepPath];

        if (!currentStep) {
            console.error("Шаг не найден:", stepPath);
            currentStep = startMenu.start_menu;
            historyStack.length = 0; 
            historyStack.push('start_menu');
        }

        if (currentStep.onEnter) {
            currentStep.onEnter();
        }

        questScreen.textContent = currentStep.text;
        actionPanel.innerHTML = '';

        if (currentStep.onSuccess) {
            setTimeout(currentStep.onSuccess, 2000);
        }

        if (stepPath !== "start_menu" && historyStack.length > 1) {
            const backButton = document.createElement('button');
            backButton.textContent = "Назад";
            backButton.className = 'action-button neutral';
            backButton.onclick = goBack;
            actionPanel.appendChild(backButton);
        }

        if (currentStep.actions) {
            currentStep.actions.forEach(action => {
                const button = document.createElement('button');
                button.textContent = action.text;
                button.className = 'action-button';
                if (action.isBad) {
                    button.classList.add('bad-choice');
                }
                button.onclick = () => showStep(action.next);
                actionPanel.appendChild(button);
            });
        }
    }

    function goBack() {
        historyStack.pop();
        const previousStep = historyStack[historyStack.length - 1];
        if (previousStep) {
            showStep(previousStep, true);
        }
    }

    // --- ПЕРВЫЙ ЗАПУСК ---
    showStep("start_menu");

});