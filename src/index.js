const { Builder, By, Key, until } = require('selenium-webdriver');
const credentials = require('./credentials.json')

(async function example () {
	let driver = await new Builder().forBrowser('chrome').build();
	let URL_UNICARIOCA = 'http://ava.unicarioca.edu.br';
	let URL_EXERCICIOS = 'https://ava.unicarioca.edu.br/graduacao/mod/quiz/view.php?id=';
	let ID_EXERCICIOS = [462044, 462048, 462052, 462056, 462060, 462066, 462070, 462074, 462078, 462082, 462088, 462092, 462096, 462100, 462104, 462111, 462115, 462119, 462123, 462127];
	let matricula = credentials.matricula;
	let senha = credentials.senha;
	try {
		await driver.get(URL_UNICARIOCA);
		await driver.findElement(By.name('username')).sendKeys(matricula, Key.TAB);
		await driver.findElement(By.name('password')).sendKeys(senha, Key.TAB, Key.TAB, Key.SPACE);
		await driver.wait(until.titleIs('UniCarioca Graduação'), 600000);
		for (id of ID_EXERCICIOS) {
			await driver.get(URL_EXERCICIOS + id);
			let nota = await driver.findElement(By.css('div#feedback > h3')).getText();
			while (nota !== 'Nota mais alta: 5,00 / 5,00.') {
				let nomeBotao = await driver.findElement(By.css('button[class*="single_button"')).getText()
				console.log(nomeBotao)
			}
			console.log(nota)
		}
	} finally {
		// await driver.quit()
	}
})();