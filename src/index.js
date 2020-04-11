const { Builder, By, Key, until } = require('selenium-webdriver');
const credentials = require('./credentials.json');

(async function example() {
	let driver = await new Builder().forBrowser('firefox').build();
	let URL_UNICARIOCA = 'http://ava.unicarioca.edu.br';
	let URL_EXERCICIOS = 'https://ava.unicarioca.edu.br/graduacao/mod/quiz/view.php?id=';
	let ID_EXERCICIOS = [508832, /*508838*/];
	let matricula = credentials.matricula;
	let senha = credentials.senha;
	let respostas = [];
	const stringRespostaCorreta = 'A resposta correta é: ';
	try {
		await driver.get(URL_UNICARIOCA);
		await driver.findElement(By.name('username')).sendKeys(matricula, Key.TAB);
		await driver.findElement(By.name('password')).sendKeys(senha, Key.TAB, Key.TAB, Key.SPACE);
		await driver.wait(until.titleIs('UniCarioca Graduação'), 600000);
		for (id of ID_EXERCICIOS) {
			await driver.get(URL_EXERCICIOS + id);
			let nota;
			try {
				nota = await driver.findElement(By.css('div#feedback > h3')).getText()
			} catch {
				nota = null;
			}
			while (nota !== 'Nota mais alta: 5,00 / 5,00.') {
				// Continuar tentativa || Tentar novamente
				await driver.findElement(By.tagName('button')).click();
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
				await driver.sleep(10000);
				try {
					let redButton = await driver.findElement(By.css('input.btn.btn-primary'));
					console.log(redButton);
					await driver.sleep(4000);
					redButton.click();
				} catch {
					console.log('Não tem botão vermelho!');
				}
				// TO DO: pegar respostas certas 
				let rightAnswers = await driver.findElements(By.css('div.rightanswer'));
				for (let i = 0; i < rightAnswers.length; i++) {
					let respostaHtml = await rightAnswers[i].getText();
					console.log(respostaHtml);
					let respostaFormatada = respostaHtml.slice(stringRespostaCorreta.length);
					console.log(respostaFormatada);
					respostas.push(respostaFormatada);
				}
				console.log('respostas: ')
				console.log(respostas);
				// TO DO: clicar em terminar revisão e remover o break
				break;
				nota = await driver.findElement(By.css('div#feedback > h3')).getText();
			}
			console.log(nota)
		}
	} finally {
		// await driver.quit()
	}
})();
