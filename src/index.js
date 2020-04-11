const { Builder, By, Key, until, Actions, } = require('selenium-webdriver');
const credentials = require('./credentials.json');

(async function example() {
	let driver = await new Builder().forBrowser('firefox').build();
	let URL_UNICARIOCA = 'http://ava.unicarioca.edu.br';
	let URL_EXERCICIOS = 'https://ava.unicarioca.edu.br/graduacao/mod/quiz/view.php?id=';
	let ID_EXERCICIOS = [508832, /*508838*/];
	let matricula = credentials.matricula;
	let senha = credentials.senha;
	let respostas = [];
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
				// TO DO: pegar respostas certas 
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
