const { Builder, By, Key, until } = require('selenium-webdriver');
const credentials = require('./credentials.json');
const informations = require('./informations.json');

(async function example() {
	let driver = await new Builder().forBrowser('firefox').build();
	let ID_EXERCICIOS = [508832, 508838, 508844, 508850, 508856, 508864, 508870,
		508876, 508882, 508888, 508896];
	let respostas = [];
	try {
		await driver.get(informations.urlAva);
		await driver.findElement(By.name('username')).sendKeys(credentials.matricula, Key.TAB);
		await driver.findElement(By.name('password')).sendKeys(credentials.senha, Key.TAB, Key.TAB, Key.SPACE);
		await driver.wait(until.titleIs(informations.title), 600000);
		for (id of ID_EXERCICIOS) {
			await driver.get(informations.urlAvaQuestion + id);
			let nota;
			try {
				nota = await driver.findElement(By.css('div#feedback > h3')).getText()
			} catch {
				nota = null;
			}
			while (!(nota !== informations.grade5 || nota !== informations.grade10)) {
				// Continuar tentativa || Tentar novamente
				await driver.findElement(By.tagName('button')).click();
				// Responde questionário
				if (respostas.length > 0) {
					let alternativas = await driver.findElements(By.css('label.m-l-1'));
					for (let i = 0; i < alternativas.length; i++) {
						for (let j = 0; j < respostas.length; j++) {
							let textoAlternativa = await alternativas[i].getText();
							if (textoAlternativa.includes(respostas[j])) {
								alternativas[i].click();
							}
						}
					}
				}
				respostas = [];
				// Finalizar tentativa... 
				let botaoFinalizarTentativa = await driver.findElement(By.name('next'));
				console.log(await botaoFinalizarTentativa.isDisplayed());
				while (!(await botaoFinalizarTentativa.isDisplayed())) {
					driver.executeScript('window.scrollTo(0,document.body.scrollHeight);');
				}
				await botaoFinalizarTentativa.click();
				// Enviar tudo e terminar
				let buttons = await driver.findElements(By.css('button.btn.btn-secondary'));
				buttons[1].click();
				// Enviar tudo e terminar (modal, botão vermelho)
				await driver.sleep(3000);
				try {
					//Só aparece na primeira vez que envia o questionário
					let redButton = await driver.findElement(By.css('input.btn.btn-primary'));
					redButton.click();
				} catch {
					console.log('Não tem botão vermelho!');
				}
				// TO DO: pegar respostas certas 
				let rightAnswers = await driver.findElements(By.css('div.rightanswer'));
				for (let i = 0; i < rightAnswers.length; i++) {
					let respostaHtml = await rightAnswers[i].getText();
					let respostaFormatada = respostaHtml.slice(informations.answerRight.length);
					respostaFormatada = respostaFormatada.slice(0, -1);
					respostas.push(respostaFormatada);
				}
				console.log('respostas: ')
				console.log(respostas);
				await (await driver.findElement(By.linkText(informations.finishRevision))).click();
				nota = await driver.findElement(By.css('div#feedback > h3')).getText();
			}
			console.log(nota)
		}
	} finally {
		await driver.quit()
	}
})();
